import i18n from '@/i18n/config';
import { useAuthStore } from '@/stores/useAuthStore';
import { useKiinnostuksetStore } from '@/stores/useKiinnostuksetStore';
import { useNoteStore } from '@/stores/useNoteStore';
import { useSuosikitStore } from '@/stores/useSuosikitStore';
import { Middleware } from 'openapi-fetch';

export const sessionExpiredMiddleware: Middleware = {
  onResponse({ response }) {
    if (response.status === 403 && !response.url.endsWith('/api/profiili/ohjaaja')) {
      useAuthStore.getState().invalidate();

      useNoteStore.getState().setNote({
        title: i18n.t('error-boundary.title'),
        description: i18n.t('error-boundary.session-expired'),
        variant: 'error',
      });

      useSuosikitStore.getState().clearSuosikit();
      useKiinnostuksetStore.getState().clearKiinnostukset();

      /* eslint-disable sonarjs/todo-tag */
      throw new Error('session-expired'); // TODO: This should be replaced with a proper handling of session expiration
    }
    return response;
  },
};
