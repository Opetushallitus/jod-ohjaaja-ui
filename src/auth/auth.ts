import { registerCsrfMiddleware } from '@/api/middlewares/csrf';
import { components } from '@/api/schema';
import { LoaderFunction, LoaderFunctionArgs, redirect } from 'react-router';
import { client } from '../api/client';

export const authStore: {
  ohjaajaPromise: Promise<unknown> | undefined;
} = {
  ohjaajaPromise: undefined,
};

export const withOhjaajaContext = (
  load: LoaderFunction<components['schemas']['OhjaajaCsrfDto'] | null>,
  loginRequired = true,
) => {
  return async (args: LoaderFunctionArgs) => {
    authStore.ohjaajaPromise ??= client.GET('/api/profiili/ohjaaja');

    const { data = null } = (await authStore.ohjaajaPromise) as { data: components['schemas']['OhjaajaCsrfDto'] };
    if (data) {
      registerCsrfMiddleware(data.csrf);
    }

    return !loginRequired || data ? await load({ ...args, context: data }) : redirect('/');
  };
};
