import { getMostViewedArtikkeliErcs } from '@/api/artikkelinKatselu';
import { getBestMatchingArticles } from '@/api/kiinnostukset';
import { components } from '@/api/schema';
import { getArticlesByErcs, getNewestContent } from '@/services/cms-article-api';
import { type StructuredContent } from '@/types/cms-content';

import { LoaderFunction } from 'react-router';

const loader = (async ({ context }) => {
  const isLoggedIn = !!context;
  const [newestContent, mostViewedContent, bestMatchingContent] = await Promise.all([
    getNewestContent(),
    getMostViewedArtikkeliErcs().then(async (articleErcs) => {
      const articles = await getArticlesByErcs(articleErcs);
      return articleErcs
        .map((erc) => articles.items.find((article) => article.externalReferenceCode === erc))
        .filter((a): a is StructuredContent => !!a);
    }),
    isLoggedIn ? getBestMatchingArticles() : Promise.resolve([]),
  ]);

  return { newestContent: newestContent.items, mostViewedContent, bestMatchingContent, isLoggedIn };
}) satisfies LoaderFunction<components['schemas']['OhjaajaCsrfDto'] | null>;

export type LoaderData = Awaited<ReturnType<typeof loader>>;
export default loader;
