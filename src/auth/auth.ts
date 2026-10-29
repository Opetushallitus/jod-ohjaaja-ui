import { LoaderFunction, LoaderFunctionArgs, redirect } from 'react-router';

import { useSessionManagerStore } from '@/stores/useSessionManagerStore';
import { type OhjaajaCsrfDto } from '@/types/auth';

let prefetchedOhjaajaContext: Promise<OhjaajaCsrfDto | null> | undefined;

/**
 * Starts the session check before the router is created, so that it runs in parallel with the other startup requests.
 * The result is shared by the loaders of the initial navigation until `releasePrefetchedOhjaajaContext` is called.
 */
export const prefetchOhjaajaContext = () => {
  prefetchedOhjaajaContext ??= useSessionManagerStore.getState().syncOhjaajaFromServer();
};

export const releasePrefetchedOhjaajaContext = () => {
  prefetchedOhjaajaContext = undefined;
};

export const withOhjaajaContext = (load: LoaderFunction<OhjaajaCsrfDto | null>, loginRequired = true) => {
  return async (args: LoaderFunctionArgs) => {
    const data = await (prefetchedOhjaajaContext ?? useSessionManagerStore.getState().syncOhjaajaFromServer());
    return !loginRequired || data ? await load({ ...args, context: data }) : redirect('/');
  };
};
