import { useAuthStore } from '@/stores/useAuthStore';
import { useKiinnostuksetStore } from '@/stores/useKiinnostuksetStore';
import { useSessionExpirationStore } from '@/stores/useSessionExpirationStore';
import { useSuosikitStore } from '@/stores/useSuosikitStore';
import { Middleware } from 'openapi-fetch';

export const sessionExpiredMiddleware: Middleware = {
  async onResponse({ response }) {
    const { sessionExpired, extendSession, onSessionExtended } = useSessionExpirationStore.getState();

    if (response.status >= 200 && response.status < 300 && !sessionExpired) {
      onSessionExtended?.();
      await extendSession();
    }
    if (response.status === 403 && !response.url.endsWith('/api/profiili/ohjaaja')) {
      useAuthStore.getState().invalidate();
      useSuosikitStore.getState().clearSuosikit();
      useKiinnostuksetStore.getState().clearKiinnostukset();

      /* eslint-disable sonarjs/todo-tag */
      throw new Error('session-expired'); // TODO: This should be replaced with a proper handling of session expiration
    }
    return response;
  },
};
