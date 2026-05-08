import { Middleware } from 'openapi-fetch';

import { useKiinnostuksetStore } from '@/stores/useKiinnostuksetStore';
import { sessionActivityShouldExtendFromApi, useSessionManagerStore } from '@/stores/useSessionManagerStore';
import { useSuosikitStore } from '@/stores/useSuosikitStore';

export const sessionExpiredMiddleware: Middleware = {
  async onResponse({ response }) {
    const sessionState = useSessionManagerStore.getState();

    if (response.status >= 200 && response.status < 300 && sessionActivityShouldExtendFromApi(sessionState)) {
      sessionState.onSessionExtended?.();
      await sessionState.extendSession();
    }
    if (response.status === 403 && !response.url.endsWith('/api/profiili/ohjaaja')) {
      useSuosikitStore.getState().clearSuosikit();
      useKiinnostuksetStore.getState().clearKiinnostukset();
      await useSessionManagerStore.getState().expireSession('server-403');

      throw new Error('session-expired'); // TODO: This should be replaced with a proper handling of session expiration
    }
    return response;
  },
};
