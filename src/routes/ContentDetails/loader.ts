import { addArtikkelinKatselu } from '@/api/artikkelinKatselu';
import { components } from '@/api/schema';
import { getContentByArticleId } from '@/services/cms-article-api';
import { LoaderFunction } from 'react-router';

const getContentDetailsLoader = (contentId: number, externalReferenceCode?: string) =>
  (async ({ context }) => {
    const [data] = await Promise.all([getContentByArticleId(contentId), addArtikkelinKatselu(externalReferenceCode)]);
    return { data, isLoggedIn: !!context, userId: context?.id };
  }) satisfies LoaderFunction<components['schemas']['OhjaajaCsrfDto'] | null>;

export type LoaderData = Awaited<ReturnType<ReturnType<typeof getContentDetailsLoader>>>;
export default getContentDetailsLoader;
