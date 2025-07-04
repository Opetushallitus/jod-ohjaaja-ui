import { getMostViewedArtikkeliIds } from '@/api/artikkelinKatselu';
import { getBestMatchingArticles } from '@/api/kiinnostukset';
import { components } from '@/api/schema';
import { getArticles, getNewestContent } from '@/services/cms-api';
import { type StructuredContent } from '@/types/cms-content';

import { LoaderFunction } from 'react-router';

const loader = (async ({ context }) => {
  const isLoggedIn = !!context;
  const [newestContent, mostViewedContent, bestMatchingContent] = await Promise.all([
    getNewestContent(),
    getMostViewedArtikkeliIds().then(async (articleIds) => {
      const articles = await getArticles(articleIds);
      return articleIds
        .map((id) => articles.items.find((article) => article.id === id))
        .filter((a): a is StructuredContent => !!a);
    }),
    isLoggedIn ? getBestMatchingArticles() : Promise.resolve([]),
  ]);

  return { newestContent: newestContent.items, mostViewedContent, bestMatchingContent, isLoggedIn };
}) satisfies LoaderFunction<components['schemas']['OhjaajaCsrfDto'] | null>;

export type LoaderData = Awaited<ReturnType<typeof loader>>;
export default loader;
