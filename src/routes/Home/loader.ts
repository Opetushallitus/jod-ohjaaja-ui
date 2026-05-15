import { LoaderFunction } from 'react-router';

import { getMostViewedArtikkeliErcs } from '@/api/artikkelinKatselu';
import { getBestMatchingArticles } from '@/api/kiinnostukset';
import { components } from '@/api/schema';
import i18n, { LangCode } from '@/i18n/config';
import { getArticlesByErcs, getNewestContent } from '@/services/cms-article-api';
import { getNavigationTreeItems } from '@/services/navigation-loader';
import { type StructuredContent } from '@/types/cms-content';
import { getExcludedCategoryIds } from '@/utils/navigation';

const loader = (async ({ context }) => {
  const isLoggedIn = !!context;
  const language = i18n.language;

  const navigationItems = getNavigationTreeItems();
  const excludeCategoriesFromNewestContent = getExcludedCategoryIds(
    navigationItems,
    'hideFromHomePageNewestCarousel',
    language as LangCode,
  );
  const excludeCategoriesFromMostViewedContent = getExcludedCategoryIds(
    navigationItems,
    'hideFromHomePageMostViewedCarousel',
    language as LangCode,
  );

  const [newestContent, mostViewedContent, bestMatchingContent] = await Promise.all([
    getNewestContent(excludeCategoriesFromNewestContent),
    getMostViewedArtikkeliErcs().then(async (articleErcs) => {
      const articles = await getArticlesByErcs(articleErcs, excludeCategoriesFromMostViewedContent);
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
