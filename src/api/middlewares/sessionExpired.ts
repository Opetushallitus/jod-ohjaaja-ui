import { authStore } from '@/auth';
import { Middleware } from 'openapi-fetch';
import { unregisterCsrfMiddleware } from './csrf';

export const sessionExpiredMiddleware: Middleware = {
  onResponse({ response }) {
    if (response.status === 403 && !response.url.endsWith('/api/profiili/ohjaaja')) {
      authStore.ohjaajaPromise = undefined;
      unregisterCsrfMiddleware();
      /* eslint-disable sonarjs/todo-tag */
      throw new Error('session-expired'); // TODO: This should be replaced with a proper handling of session expiration
    }
    return response;
  },
};
