import { getMostViewedArtikkeliIds } from '@/api/artikkelinKatselu';
import { components } from '@/api/schema';
import { getArticles, getNewestContent } from '@/services/cms-api';
import { type StructuredContent } from '@/types/cms-content';

import { LoaderFunction } from 'react-router';

const loader = (async ({ context }) => {
  const [newestContent, mostViewedContent] = await Promise.all([
    getNewestContent(),
    getMostViewedArtikkeliIds().then(async (articleIds) => {
      const articles = await getArticles(articleIds);
      return articleIds
        .map((id) => articles.items.find((article) => article.id === id))
        .filter((a): a is StructuredContent => !!a);
    }),
  ]);

  return { newestContent: newestContent.items, mostViewedContent, isLoggedIn: !!context };
}) satisfies LoaderFunction<components['schemas']['OhjaajaCsrfDto'] | null>;

export type LoaderData = Awaited<ReturnType<typeof loader>>;
export default loader;
