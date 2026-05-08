import { create } from 'zustand';
import { useShallow } from 'zustand/shallow';

import { registerCsrfMiddleware, unregisterCsrfMiddleware } from '@/api/middlewares/csrf';
import { useKiinnostuksetStore } from '@/stores/useKiinnostuksetStore';
import { useSuosikitStore } from '@/stores/useSuosikitStore';
import type { OhjaajaCsrfDto } from '@/types/auth';

const refetchSuosikitAndKiinnostukset = () => {
  useSuosikitStore
    .getState()
    .fetchSuosikit()
    .catch(() => {});
  useKiinnostuksetStore
    .getState()
    .fetchKiinnostukset()
    .catch(() => {});
};

export type OhjaajaLoaderContext = OhjaajaCsrfDto | null;

export type SessionStatus = 'anonymous' | 'authenticated' | 'warning' | 'recovering' | 'expired';
type SessionEvent =
  | 'session:authenticated'
  | 'session:extended'
  | 'session:expired'
  | 'session:logout'
  | 'session:cleared';
export type SessionExpireReason =
  | 'timer'
  | 'server-403'
  | 'logout'
  | 'manual'
  | 'validation-failed'
  | 'api-fetch-failed';

interface SessionManagerState {
  sessionStartTime?: number;
  sessionLengthMs: number;
  warningThresholdMs: number;
  status: SessionStatus;
  ohjaaja?: OhjaajaCsrfDto;
  lastValidatedAt?: number;
  disabled: boolean;
  onWarning?: () => void;
  onExpired?: (reason?: SessionExpireReason) => void | Promise<void>;
  onSessionExtended?: () => void;
  setOnWarning: (callback?: () => void) => void;
  setOnExpired: (callback?: (reason?: SessionExpireReason) => void | Promise<void>) => void;
  setOnSessionExtended: (callback?: () => void) => void;
  start: () => void;
  stop: () => void;
  disable: () => void;
  extendSession: () => Promise<void> | void;
  initializeFromLoader: (data?: OhjaajaLoaderContext) => void;
  /** GET `/ohjaaja/api/profiili/ohjaaja`, then updates store (CSRF, user, timers). */
  syncOhjaajaFromServer: (force?: boolean) => Promise<OhjaajaLoaderContext>;
  resetOhjaajaContextRequest: () => void;
  validateSession: (force?: boolean) => Promise<boolean>;
  expireSession: (reason?: SessionExpireReason) => Promise<void>;
  /**
   * Clears authenticated state without running `onExpired` (e.g. failed profile fetch).
   * Notifies other tabs via {@link SessionEvent} `session:cleared`.
   */
  silentInvalidateAcrossTabs: () => void;
}

const SESSION_SYNC_CHANNEL = 'ohjaaja:session-sync';
const SESSION_SYNC_TAB_ID = globalThis.crypto.randomUUID();
const SESSION_LENGTH_MS = 30 * 60 * 1000;
const SESSION_WARNING_THRESHOLD_MS = 25 * 60 * 1000;
const LIVE_CACHE_MS = 30 * 1000;

export const useSessionManagerStore = create<SessionManagerState>()((set, get) => {
  let warningShown = false;
  let intervalId: ReturnType<typeof setInterval> | undefined;
  let isSyncInitialized = false;
  let sessionSyncChannel: BroadcastChannel | undefined;
  let ohjaajaContextPromise: Promise<OhjaajaLoaderContext> | undefined;
  let visibilityHandler: (() => void) | undefined;

  const getTimeSinceSessionStarted = () => {
    const { sessionStartTime } = get();
    return sessionStartTime ? Date.now() - sessionStartTime : 0;
  };

  const fetchOhjaajaContext = async (force = false) => {
    if (force) {
      ohjaajaContextPromise = undefined;
    }
    ohjaajaContextPromise ??= (async () => {
      const response = await fetch('/ohjaaja/api/profiili/ohjaaja', {
        method: 'GET',
        credentials: 'same-origin',
      });
      if (!response.ok) {
        return null;
      }
      const data = (await response.json()) as OhjaajaCsrfDto | null;
      return data ?? null;
    })();
    try {
      return await ohjaajaContextPromise;
    } finally {
      ohjaajaContextPromise = undefined;
    }
  };

  const emitSessionEvent = (event: SessionEvent) => {
    if (!sessionSyncChannel) {
      return;
    }
    sessionSyncChannel.postMessage({ tabId: SESSION_SYNC_TAB_ID, event, timestamp: Date.now() });
  };

  const applyRemoteClear = (reason: SessionExpireReason) => {
    const prevStatus = get().status;
    get().stop();
    warningShown = false;
    unregisterCsrfMiddleware();
    const shouldBecomeAnonymous = reason === 'logout' || reason === 'api-fetch-failed';
    set({
      status: shouldBecomeAnonymous ? 'anonymous' : 'expired',
      disabled: !shouldBecomeAnonymous,
      sessionStartTime: undefined,
      lastValidatedAt: undefined,
      ohjaaja: undefined,
    });
    return { prevStatus };
  };

  const ensureSessionSyncChannel = () => {
    if (isSyncInitialized || typeof BroadcastChannel === 'undefined') {
      return;
    }
    isSyncInitialized = true;
    sessionSyncChannel = new BroadcastChannel(SESSION_SYNC_CHANNEL);
    sessionSyncChannel.onmessage = (messageEvent: MessageEvent<{ tabId?: string; event?: SessionEvent }>) => {
      const payload = messageEvent.data;
      if (!payload || payload.tabId === SESSION_SYNC_TAB_ID) {
        return;
      }

      if (payload.event === 'session:cleared') {
        applyRemoteClear('api-fetch-failed');
        useSuosikitStore.getState().clearSuosikit();
        useKiinnostuksetStore.getState().clearKiinnostukset();
        return;
      }

      if (payload.event === 'session:expired' || payload.event === 'session:logout') {
        const reason: SessionExpireReason = payload.event === 'session:logout' ? 'logout' : 'manual';
        const { prevStatus } = applyRemoteClear(reason);
        useSuosikitStore.getState().clearSuosikit();
        useKiinnostuksetStore.getState().clearKiinnostukset();
        if (reason === 'logout' || prevStatus !== 'expired') {
          void (async () => {
            await get().onExpired?.(reason);
          })();
        }
        return;
      }

      if (payload.event === 'session:authenticated') {
        void (async () => {
          const data = await fetchOhjaajaContext(true);
          if (!data?.csrf) {
            return;
          }
          warningShown = false;
          registerCsrfMiddleware(data.csrf);
          set({
            status: 'authenticated',
            disabled: false,
            sessionStartTime: Date.now(),
            ohjaaja: data,
            lastValidatedAt: Date.now(),
          });
          get().start();
          get().onSessionExtended?.();
          refetchSuosikitAndKiinnostukset();
        })();
        return;
      }

      if (payload.event === 'session:extended') {
        const s = get();
        const loggedIn = s.status === 'authenticated' || s.status === 'warning' || s.status === 'recovering';
        if (!loggedIn || !s.ohjaaja?.csrf) {
          return;
        }
        warningShown = false;
        set({
          status: 'authenticated',
          disabled: false,
          sessionStartTime: Date.now(),
        });
        get().start();
        get().onSessionExtended?.();
      }
    };
  };

  return {
    sessionStartTime: undefined,
    sessionLengthMs: SESSION_LENGTH_MS,
    warningThresholdMs: SESSION_WARNING_THRESHOLD_MS,
    status: 'anonymous',
    ohjaaja: undefined,
    lastValidatedAt: undefined,
    disabled: false,
    onWarning: undefined,
    onExpired: undefined,
    onSessionExtended: undefined,
    setOnWarning: (callback) => set({ onWarning: callback }),
    setOnExpired: (callback) => set({ onExpired: callback }),
    setOnSessionExtended: (callback) => set({ onSessionExtended: callback }),
    start: () => {
      ensureSessionSyncChannel();
      const state = get();
      if (intervalId || state.disabled || !isSessionValidState(state.status)) {
        return;
      }
      if (!state.sessionStartTime) {
        set({ sessionStartTime: Date.now() });
      }

      const checkSessionTimer = async () => {
        const currentState = get();
        if (currentState.disabled || !isSessionValidState(currentState.status)) {
          return;
        }
        const timeSinceSessionStart = getTimeSinceSessionStarted();
        if (timeSinceSessionStart >= currentState.sessionLengthMs) {
          await currentState.expireSession('timer');
          return;
        }
        if (
          timeSinceSessionStart >= currentState.warningThresholdMs &&
          timeSinceSessionStart < currentState.sessionLengthMs
        ) {
          if (!warningShown) {
            warningShown = true;
            set({ status: 'warning' });
            currentState.onWarning?.();
          }
        } else if (timeSinceSessionStart < currentState.warningThresholdMs && warningShown) {
          warningShown = false;
          set({ status: 'authenticated' });
        }
      };

      intervalId = globalThis.setInterval(checkSessionTimer, 1000);

      if (typeof document !== 'undefined' && !visibilityHandler) {
        visibilityHandler = () => {
          if (document.visibilityState === 'visible') {
            void checkSessionTimer();
          }
        };
        document.addEventListener('visibilitychange', visibilityHandler);
      }
    },
    stop: () => {
      if (intervalId) {
        clearInterval(intervalId);
        intervalId = undefined;
      }
      if (visibilityHandler) {
        document.removeEventListener('visibilitychange', visibilityHandler);
        visibilityHandler = undefined;
      }
    },
    disable: () => {
      get().stop();
      warningShown = false;
      unregisterCsrfMiddleware();
      set({ disabled: true, status: 'expired', ohjaaja: undefined });
    },
    extendSession: () => {
      warningShown = false;
      set({
        sessionStartTime: Date.now(),
        status: 'authenticated',
        disabled: false,
      });
      get().onSessionExtended?.();
      emitSessionEvent('session:extended');
    },
    initializeFromLoader: (data) => {
      ensureSessionSyncChannel();
      const state = get();
      const ctx: OhjaajaLoaderContext = data ?? null;
      const isAuthenticated = ohjaajaLoaderContextHasSession(ctx);
      const nextToken = ctx?.csrf?.token;

      if (!isAuthenticated) {
        if (state.status === 'anonymous' && !state.ohjaaja) {
          return;
        }
        warningShown = false;
        unregisterCsrfMiddleware();
        set({
          status: 'anonymous',
          disabled: false,
          sessionStartTime: undefined,
          ohjaaja: undefined,
          lastValidatedAt: undefined,
        });
        get().stop();
        return;
      }

      const stillLoggedIn =
        state.status === 'authenticated' || state.status === 'warning' || state.status === 'recovering';
      if (stillLoggedIn && state.ohjaaja?.csrf?.token === nextToken) {
        if (!state.ohjaaja || state.ohjaaja.etunimi !== ctx.etunimi || state.ohjaaja.sukunimi !== ctx.sukunimi) {
          set({ ohjaaja: ctx, lastValidatedAt: Date.now() });
        }
        return;
      }

      warningShown = false;
      registerCsrfMiddleware(ctx.csrf);
      set({
        status: 'authenticated',
        disabled: false,
        sessionStartTime: Date.now(),
        ohjaaja: ctx,
        lastValidatedAt: Date.now(),
      });
      emitSessionEvent('session:authenticated');
      get().start();
      get().onSessionExtended?.();
    },
    syncOhjaajaFromServer: async (force = false) => {
      const { ohjaaja, lastValidatedAt } = get();
      const now = Date.now();
      if (!force && ohjaaja && lastValidatedAt && now - lastValidatedAt < LIVE_CACHE_MS) {
        return ohjaaja;
      }

      try {
        const data = await fetchOhjaajaContext(force);
        get().initializeFromLoader(data);
        return ohjaajaLoaderContextHasSession(data) ? data : null;
      } catch {
        get().silentInvalidateAcrossTabs();
        return null;
      }
    },
    resetOhjaajaContextRequest: () => {
      ohjaajaContextPromise = undefined;
    },
    validateSession: async (force = false) => {
      const { lastValidatedAt, status } = get();
      if (!force && status !== 'expired' && lastValidatedAt && Date.now() - lastValidatedAt < 10_000) {
        return isSessionValidState(get().status);
      }
      try {
        set({ status: 'recovering' });
        const data = await fetchOhjaajaContext(force);
        if (!ohjaajaLoaderContextHasSession(data)) {
          await get().expireSession('validation-failed');
          return false;
        }
        warningShown = false;
        registerCsrfMiddleware(data.csrf);
        set({
          status: 'authenticated',
          disabled: false,
          sessionStartTime: Date.now(),
          ohjaaja: data,
          lastValidatedAt: Date.now(),
        });
        emitSessionEvent('session:authenticated');
        get().start();
        get().onSessionExtended?.();
        return true;
      } catch {
        await get().expireSession('validation-failed');
        return false;
      }
    },
    expireSession: async (reason = 'manual') => {
      const shouldBecomeAnonymous = reason === 'logout';
      if (get().status === 'expired' && !shouldBecomeAnonymous) {
        return;
      }
      ensureSessionSyncChannel();
      get().stop();
      warningShown = false;
      unregisterCsrfMiddleware();
      set({
        status: shouldBecomeAnonymous ? 'anonymous' : 'expired',
        disabled: !shouldBecomeAnonymous,
        sessionStartTime: undefined,
        lastValidatedAt: undefined,
        ohjaaja: undefined,
      });
      emitSessionEvent(reason === 'logout' ? 'session:logout' : 'session:expired');
      await get().onExpired?.(reason);
    },
    silentInvalidateAcrossTabs: () => {
      ensureSessionSyncChannel();
      get().stop();
      warningShown = false;
      unregisterCsrfMiddleware();
      useSuosikitStore.getState().clearSuosikit();
      useKiinnostuksetStore.getState().clearKiinnostukset();
      set({
        status: 'anonymous',
        disabled: false,
        sessionStartTime: undefined,
        lastValidatedAt: undefined,
        ohjaaja: undefined,
      });
      emitSessionEvent('session:cleared');
    },
  };
});

export const isSessionExpiredState = (status: SessionStatus) => status === 'expired';
export const isSessionValidState = (status: SessionStatus) => status === 'authenticated' || status === 'warning';

const sessionStatusClaimsOhjaajaSession = (status: SessionStatus) =>
  status === 'authenticated' || status === 'warning' || status === 'recovering';

export const storeHasActiveOhjaajaSession = (state: SessionManagerState) =>
  sessionStatusClaimsOhjaajaSession(state.status) && Boolean(state.ohjaaja?.csrf?.token);

export function ohjaajaLoaderContextHasSession(ctx: OhjaajaLoaderContext): ctx is OhjaajaCsrfDto {
  return ctx != null && Boolean(ctx.csrf?.token);
}

export const useIsSessionExpired = () => useSessionManagerStore((state) => isSessionExpiredState(state.status));
export const useIsLoggedIn = () => useSessionManagerStore((state) => storeHasActiveOhjaajaSession(state));

export const useOhjaajaProfile = () => useSessionManagerStore((state) => state.ohjaaja ?? null);

export const useOhjaajaProfileLinkData = () =>
  useSessionManagerStore(
    useShallow((state) =>
      state.ohjaaja?.csrf
        ? { etunimi: state.ohjaaja.etunimi, sukunimi: state.ohjaaja.sukunimi, csrf: state.ohjaaja.csrf }
        : null,
    ),
  );

export const sessionActivityShouldExtendFromApi = (state: SessionManagerState) =>
  !state.disabled && sessionStatusClaimsOhjaajaSession(state.status);
