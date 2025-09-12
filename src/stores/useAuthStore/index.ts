import { client } from '@/api/client';
import { registerCsrfMiddleware, unregisterCsrfMiddleware } from '@/api/middlewares/csrf';
import { type OhjaajaCsrfDto } from '@/types/auth';

import { create } from 'zustand';
import { useKiinnostuksetStore } from '../useKiinnostuksetStore';
import { useSuosikitStore } from '../useSuosikitStore';

interface AuthState {
  user: OhjaajaCsrfDto | null;
  status: 'unknown' | 'authenticated' | 'anonymous' | 'loading';
  lastFetchAt: number;
  promise: Promise<OhjaajaCsrfDto | null> | null;
  setUser: (u: OhjaajaCsrfDto | null) => void;
  invalidate: () => void;
  /**
   * Fetches current user data from the API with built-in caching and request deduplication.
   *
   * Caching behavior:
   * - If user exists and was fetched less than LIVE_CACHE_MS ago, returns the cached user
   * - If more time has passed, fetches fresh user data from the API
   * This prevents unnecessary profile API calls on rapid page navigation while
   * maintaining frequent enough checks to verify if the session is still alive.
   *
   * Request deduplication:
   * - If no user is found but a fetch attempt is already in progress,
   *   returns the Promise of that attempt
   * - Since user can only be logged in through page refresh,
   *   one failed request to the profile API is sufficient
   *
   * @param opts.force - When true, bypasses all caching and request deduplication,
   *                    forcing a new request to the profile API
   * @returns Promise that resolves to user data or null
   */
  fetchUser: (opts?: { force?: boolean }) => Promise<OhjaajaCsrfDto | null>;
}

/*
 * Live cache duration for user data in milliseconds.
 * During this time, repeated calls to fetchUser will return cached data if user is logged in.
 */
const LIVE_CACHE_MS = 30 * 1000;
const bc = typeof window !== 'undefined' ? new BroadcastChannel('ohjaaja:auth') : null;
const TAB_ID = crypto.randomUUID();

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  status: 'unknown',
  lastFetchAt: 0,
  promise: null,

  setUser: (u) => {
    if (u) {
      registerCsrfMiddleware(u.csrf);
      set({ user: u, status: 'authenticated' });
      bc?.postMessage({ type: 'USER_CHANGE', user: u, source: TAB_ID });
    } else {
      unregisterCsrfMiddleware();
      set({ user: null, status: 'anonymous' });
      bc?.postMessage({ type: 'USER_CHANGE', user: null, source: TAB_ID });
    }
  },

  invalidate: () => {
    const { status } = get();
    if (status !== 'anonymous') {
      unregisterCsrfMiddleware();
      set({ user: null, status: 'anonymous', lastFetchAt: 0, promise: null });
      bc?.postMessage({ type: 'USER_CHANGE', user: null, source: TAB_ID });
    }
  },

  fetchUser: async (opts) => {
    const { user, lastFetchAt, promise } = get();
    const now = Date.now();

    if (!opts?.force) {
      if (user) {
        if (now - lastFetchAt < LIVE_CACHE_MS) {
          return user;
        }
      } else if (promise) return promise;
    }

    const p = client
      .GET('/api/profiili/ohjaaja')
      .then(({ data }) => {
        set({ lastFetchAt: Date.now() });
        if (data) {
          get().setUser(data);
          return data;
        }
        get().setUser(null);
        return null;
      })
      .catch(() => {
        get().invalidate();
        return null;
      });

    set({ promise: p, status: 'loading' });
    return p;
  },
}));

/**
 * Listen for auth changes from other tabs and update the user state accordingly.
 * This ensures that login/logout actions in one tab are reflected in all open tabs.
 */
if (bc) {
  bc.onmessage = (event) => {
    const message = event.data;
    if (message.type === 'USER_CHANGE' && message.source !== TAB_ID) {
      const { user } = useAuthStore.getState();
      // Only update if the user presence state differs
      if (!user && message.user) {
        useAuthStore.getState().setUser(message.user);
        useSuosikitStore.getState().fetchSuosikit();
        useKiinnostuksetStore.getState().fetchKiinnostukset();
      } else if (user && !message.user) {
        useAuthStore.getState().invalidate();
        useSuosikitStore.getState().clearSuosikit();
        useKiinnostuksetStore.getState().clearKiinnostukset();
      }
    }
  };
}
