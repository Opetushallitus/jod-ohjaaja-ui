import { components } from '@/api/schema';
import { getCategoryContent } from '@/services/cms-api';
import { LoaderFunction } from 'react-router';

const getCategoryContentLoader = (categoryId: number) =>
  (async ({ context }) => {
    const data = await getCategoryContent(categoryId);

    return { data, isLoggedIn: !!context };
  }) satisfies LoaderFunction<components['schemas']['OhjaajaCsrfDto'] | null>;

export type LoaderData = Awaited<ReturnType<ReturnType<typeof getCategoryContentLoader>>>;
export default getCategoryContentLoader;
