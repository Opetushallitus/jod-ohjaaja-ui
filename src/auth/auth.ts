import { useAuthStore } from '@/stores/useAuthStore';
import { type OhjaajaCsrfDto } from '@/types/auth';
import { LoaderFunction, LoaderFunctionArgs, redirect } from 'react-router';

export const withOhjaajaContext = (load: LoaderFunction<OhjaajaCsrfDto | null>, loginRequired = true) => {
  return async (args: LoaderFunctionArgs) => {
    const data = await useAuthStore.getState().fetchUser();
    return !loginRequired || data ? await load({ ...args, context: data }) : redirect('/');
  };
};
