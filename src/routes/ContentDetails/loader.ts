import { components } from '@/api/schema';
import { getContentByArticleId } from '@/services/cms-api';
import { LoaderFunction } from 'react-router';

const getContentDetailsLoader = (contentId: number) =>
  (async ({ context }) => {
    const data = await getContentByArticleId(contentId);
    return { data, isLoggedIn: !!context };
  }) satisfies LoaderFunction<components['schemas']['OhjaajaCsrfDto'] | null>;

export type LoaderData = Awaited<ReturnType<ReturnType<typeof getContentDetailsLoader>>>;
export default getContentDetailsLoader;
