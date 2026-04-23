import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/api/middlewares/csrf', () => ({
  registerCsrfMiddleware: vi.fn(),
  unregisterCsrfMiddleware: vi.fn(),
}));

const suosikitMocks = vi.hoisted(() => ({
  clearSuosikit: vi.fn(),
  fetchSuosikit: vi.fn(() => Promise.resolve()),
}));

const kiinnostuksetMocks = vi.hoisted(() => ({
  clearKiinnostukset: vi.fn(),
  fetchKiinnostukset: vi.fn(() => Promise.resolve()),
}));

vi.mock('@/stores/useSuosikitStore', () => ({
  useSuosikitStore: {
    getState: () => ({
      clearSuosikit: suosikitMocks.clearSuosikit,
      fetchSuosikit: suosikitMocks.fetchSuosikit,
    }),
  },
}));

vi.mock('@/stores/useKiinnostuksetStore', () => ({
  useKiinnostuksetStore: {
    getState: () => ({
      clearKiinnostukset: kiinnostuksetMocks.clearKiinnostukset,
      fetchKiinnostukset: kiinnostuksetMocks.fetchKiinnostukset,
    }),
  },
}));

import { registerCsrfMiddleware, unregisterCsrfMiddleware } from '@/api/middlewares/csrf';
import {
  isSessionExpiredState,
  isSessionValidState,
  SessionStatus,
  storeHasActiveOhjaajaSession,
  useSessionManagerStore,
} from './index';

const CSRF_TOKEN = { token: 'test-token', headerName: 'X-CSRF', parameterName: '_csrf' };

const OHJAAJA_DATA = {
  csrf: CSRF_TOKEN,
  etunimi: 'Matti',
  sukunimi: 'Meikäläinen',
};

function getState() {
  return useSessionManagerStore.getState();
}

function initAuthenticated() {
  getState().initializeFromLoader(OHJAAJA_DATA);
}

const initialStoreSlice = {
  sessionStartTime: undefined,
  status: 'anonymous' as SessionStatus,
  ohjaaja: undefined,
  lastValidatedAt: undefined,
  disabled: false,
  onWarning: undefined,
  onExpired: undefined,
  onSessionExtended: undefined,
};

describe('useSessionManagerStore', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(OHJAAJA_DATA),
    } as Response);
  });

  afterEach(() => {
    getState().stop();
    vi.useRealTimers();
    vi.restoreAllMocks();
    useSessionManagerStore.setState(initialStoreSlice);
  });

  describe('initial state', () => {
    it('starts as anonymous with no ohjaaja payload', () => {
      const state = getState();
      expect(state.status).toBe('anonymous');
      expect(state.ohjaaja).toBeUndefined();
      expect(state.disabled).toBe(false);
    });
  });

  describe('initializeFromLoader', () => {
    it('sets authenticated state when valid data is provided', () => {
      initAuthenticated();

      const state = getState();
      expect(state.status).toBe('authenticated');
      expect(state.ohjaaja?.csrf).toEqual(CSRF_TOKEN);
      expect(state.ohjaaja?.etunimi).toBe('Matti');
      expect(state.ohjaaja?.sukunimi).toBe('Meikäläinen');
      expect(state.sessionStartTime).toBeDefined();
      expect(state.lastValidatedAt).toBeDefined();
      expect(registerCsrfMiddleware).toHaveBeenCalledWith(CSRF_TOKEN);
    });

    it('stays anonymous when called with null', () => {
      getState().initializeFromLoader(null);

      expect(getState().status).toBe('anonymous');
      expect(getState().ohjaaja).toBeUndefined();
    });

    it('resets to anonymous when called with null after authenticated', () => {
      initAuthenticated();
      expect(getState().status).toBe('authenticated');

      getState().initializeFromLoader(null);

      expect(getState().status).toBe('anonymous');
      expect(getState().ohjaaja).toBeUndefined();
      expect(unregisterCsrfMiddleware).toHaveBeenCalled();
    });

    it('updates user data when token unchanged', () => {
      initAuthenticated();

      const updatedData = { ...OHJAAJA_DATA, etunimi: 'Liisa' };
      getState().initializeFromLoader(updatedData);

      expect(getState().ohjaaja?.etunimi).toBe('Liisa');
      expect(getState().status).toBe('authenticated');
    });

    it('re-initializes when CSRF token changes', () => {
      initAuthenticated();
      const firstStartTime = getState().sessionStartTime;

      vi.advanceTimersByTime(100);

      const newData = {
        ...OHJAAJA_DATA,
        csrf: { ...CSRF_TOKEN, token: 'new-token' },
      };
      getState().initializeFromLoader(newData);

      expect(getState().ohjaaja?.csrf?.token).toBe('new-token');
      expect(getState().sessionStartTime).toBeGreaterThan(firstStartTime!);
    });

    it('calls onSessionExtended on fresh authentication', () => {
      const onExtended = vi.fn();
      getState().setOnSessionExtended(onExtended);

      initAuthenticated();

      expect(onExtended).toHaveBeenCalledOnce();
    });
  });

  describe('extendSession', () => {
    it('resets session start time and keeps authenticated', () => {
      initAuthenticated();
      const originalStartTime = getState().sessionStartTime;
      vi.advanceTimersByTime(5000);

      getState().extendSession();

      expect(getState().sessionStartTime).toBeGreaterThan(originalStartTime!);
      expect(getState().status).toBe('authenticated');
    });

    it('calls onSessionExtended callback', () => {
      initAuthenticated();
      const onExtended = vi.fn();
      getState().setOnSessionExtended(onExtended);

      getState().extendSession();

      expect(onExtended).toHaveBeenCalledOnce();
    });
  });

  describe('expireSession', () => {
    it('transitions to expired state and cleans up', async () => {
      initAuthenticated();

      await getState().expireSession('manual');

      expect(getState().status).toBe('expired');
      expect(getState().disabled).toBe(true);
      expect(getState().ohjaaja).toBeUndefined();
      expect(unregisterCsrfMiddleware).toHaveBeenCalled();
    });

    it('calls onExpired callback', async () => {
      initAuthenticated();
      const onExpired = vi.fn();
      getState().setOnExpired(onExpired);

      await getState().expireSession('manual');

      expect(onExpired).toHaveBeenCalledOnce();
    });

    it('is idempotent — does not fire twice', async () => {
      initAuthenticated();
      const onExpired = vi.fn();
      getState().setOnExpired(onExpired);

      await getState().expireSession('manual');
      await getState().expireSession('manual');

      expect(onExpired).toHaveBeenCalledOnce();
    });

    it('logout reason transitions to anonymous and keeps store enabled', async () => {
      initAuthenticated();

      await getState().expireSession('logout');

      expect(getState().status).toBe('anonymous');
      expect(getState().disabled).toBe(false);
      expect(getState().ohjaaja).toBeUndefined();
    });

    it('passes logout reason to onExpired callback', async () => {
      initAuthenticated();
      const onExpired = vi.fn();
      getState().setOnExpired(onExpired);

      await getState().expireSession('logout');

      expect(onExpired).toHaveBeenCalledWith('logout');
    });
  });

  describe('disable', () => {
    it('sets expired+disabled and cleans up CSRF', () => {
      initAuthenticated();

      getState().disable();

      expect(getState().status).toBe('expired');
      expect(getState().disabled).toBe(true);
      expect(getState().ohjaaja).toBeUndefined();
      expect(unregisterCsrfMiddleware).toHaveBeenCalled();
    });
  });

  describe('timer logic', () => {
    it('transitions to warning when threshold is reached', () => {
      initAuthenticated();
      const onWarning = vi.fn();
      getState().setOnWarning(onWarning);
      getState().start();

      vi.advanceTimersByTime(25 * 60 * 1000);

      expect(getState().status).toBe('warning');
      expect(onWarning).toHaveBeenCalledOnce();
    });

    it('transitions to expired when session length is reached', async () => {
      initAuthenticated();
      const onExpired = vi.fn();
      getState().setOnExpired(onExpired);
      getState().start();

      vi.advanceTimersByTime(30 * 60 * 1000);

      await vi.runAllTimersAsync();

      expect(getState().status).toBe('expired');
      expect(onExpired).toHaveBeenCalled();
    });

    it('reverts to authenticated when session is extended during warning', () => {
      initAuthenticated();
      getState().start();

      vi.advanceTimersByTime(25 * 60 * 1000);
      expect(getState().status).toBe('warning');

      getState().extendSession();

      vi.advanceTimersByTime(1000);
      expect(getState().status).toBe('authenticated');
    });

    it('does not start when disabled', () => {
      initAuthenticated();
      getState().disable();
      const onWarning = vi.fn();
      getState().setOnWarning(onWarning);

      getState().start();
      vi.advanceTimersByTime(30 * 60 * 1000);

      expect(onWarning).not.toHaveBeenCalled();
    });

    it('stops cleanly', () => {
      initAuthenticated();
      getState().start();

      getState().stop();
      vi.advanceTimersByTime(30 * 60 * 1000);

      expect(getState().status).toBe('authenticated');
    });
  });

  describe('validateSession', () => {
    it('returns true and sets authenticated on success', async () => {
      initAuthenticated();
      vi.advanceTimersByTime(15_000);

      const result = await getState().validateSession(true);

      expect(result).toBe(true);
      expect(getState().status).toBe('authenticated');
      expect(getState().lastValidatedAt).toBeDefined();
    });

    it('expires session on fetch failure', async () => {
      initAuthenticated();
      vi.spyOn(globalThis, 'fetch').mockResolvedValue({
        ok: false,
        json: () => Promise.resolve(null),
      } as Response);

      const result = await getState().validateSession(true);

      expect(result).toBe(false);
      expect(getState().status).toBe('expired');
    });

    it('expires session on network error', async () => {
      initAuthenticated();
      vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('Network error'));

      const result = await getState().validateSession(true);

      expect(result).toBe(false);
      expect(getState().status).toBe('expired');
    });

    it('throttles validation within 10s window', async () => {
      initAuthenticated();
      const fetchSpy = vi.spyOn(globalThis, 'fetch');
      fetchSpy.mockClear();

      await getState().validateSession(true);
      const callCount = fetchSpy.mock.calls.length;

      await getState().validateSession(false);

      expect(fetchSpy).toHaveBeenCalledTimes(callCount);
    });

    it('bypasses throttle with force=true', async () => {
      initAuthenticated();
      await getState().validateSession(true);

      const fetchSpy = vi.spyOn(globalThis, 'fetch');
      fetchSpy.mockClear();

      await getState().validateSession(true);

      expect(fetchSpy).toHaveBeenCalled();
    });
  });

  describe('syncOhjaajaFromServer', () => {
    it('returns payload and syncs authenticated state', async () => {
      const data = await getState().syncOhjaajaFromServer();

      expect(data).toEqual(OHJAAJA_DATA);
      expect(getState().status).toBe('authenticated');
      expect(getState().ohjaaja?.csrf).toEqual(CSRF_TOKEN);
      expect(getState().ohjaaja?.etunimi).toBe('Matti');
      expect(registerCsrfMiddleware).toHaveBeenCalledWith(CSRF_TOKEN);
    });

    it('returns null on HTTP error without authenticating', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValue({
        ok: false,
        json: () => Promise.resolve(null),
      } as Response);

      const data = await getState().syncOhjaajaFromServer();

      expect(data).toBeNull();
      expect(getState().status).toBe('anonymous');
      expect(getState().ohjaaja).toBeUndefined();
    });
  });

  describe('helper functions', () => {
    it('isSessionExpiredState returns true only for expired', () => {
      expect(isSessionExpiredState('expired')).toBe(true);
      expect(isSessionExpiredState('authenticated')).toBe(false);
      expect(isSessionExpiredState('anonymous')).toBe(false);
    });

    it('isSessionValidState returns true for authenticated and warning', () => {
      expect(isSessionValidState('authenticated')).toBe(true);
      expect(isSessionValidState('warning')).toBe(true);
      expect(isSessionValidState('expired')).toBe(false);
      expect(isSessionValidState('recovering')).toBe(false);
      expect(isSessionValidState('anonymous')).toBe(false);
    });

    it('storeHasActiveOhjaajaSession requires logged-in-like status and CSRF', () => {
      expect(storeHasActiveOhjaajaSession({ status: 'authenticated', ohjaaja: OHJAAJA_DATA } as never)).toBe(true);
      expect(storeHasActiveOhjaajaSession({ status: 'warning', ohjaaja: OHJAAJA_DATA } as never)).toBe(true);
      expect(storeHasActiveOhjaajaSession({ status: 'recovering', ohjaaja: OHJAAJA_DATA } as never)).toBe(true);
      expect(storeHasActiveOhjaajaSession({ status: 'authenticated', ohjaaja: undefined } as never)).toBe(false);
      expect(storeHasActiveOhjaajaSession({ status: 'expired', ohjaaja: OHJAAJA_DATA } as never)).toBe(false);
      expect(storeHasActiveOhjaajaSession({ status: 'anonymous', ohjaaja: OHJAAJA_DATA } as never)).toBe(false);
    });
  });

  describe('callback registration', () => {
    it('setOnWarning registers and clears callback', () => {
      const cb = vi.fn();
      getState().setOnWarning(cb);
      expect(getState().onWarning).toBe(cb);

      getState().setOnWarning(undefined);
      expect(getState().onWarning).toBeUndefined();
    });

    it('setOnExpired registers and clears callback', () => {
      const cb = vi.fn();
      getState().setOnExpired(cb);
      expect(getState().onExpired).toBe(cb);

      getState().setOnExpired(undefined);
      expect(getState().onExpired).toBeUndefined();
    });

    it('setOnSessionExtended registers and clears callback', () => {
      const cb = vi.fn();
      getState().setOnSessionExtended(cb);
      expect(getState().onSessionExtended).toBe(cb);

      getState().setOnSessionExtended(undefined);
      expect(getState().onSessionExtended).toBeUndefined();
    });
  });
});
