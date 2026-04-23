import { useSessionManagerStore } from '@/stores/useSessionManagerStore';
import { type OhjaajaCsrfDto } from '@/types/auth';
import { LoaderFunction, LoaderFunctionArgs, redirect } from 'react-router';

export const withOhjaajaContext = (load: LoaderFunction<OhjaajaCsrfDto | null>, loginRequired = true) => {
  return async (args: LoaderFunctionArgs) => {
    const data = await useSessionManagerStore.getState().syncOhjaajaFromServer();
    return !loginRequired || data ? await load({ ...args, context: data }) : redirect('/');
  };
};
