import { LoaderFunction } from 'react-router';

import { getMostViewedArtikkeliErcs } from '@/api/artikkelinKatselu';
import { getBestMatchingArticles } from '@/api/kiinnostukset';
import { components } from '@/api/schema';
import i18n, { LangCode } from '@/i18n/config';
import { getCategoryContent } from '@/services/cms-article-api';
import { getNavigationTreeItems } from '@/services/navigation-loader';
import { StructuredContent } from '@/types/cms-content';
import { NavigationItemType } from '@/types/cms-navigation';
import { deferred } from '@/utils/deferred';
import { getCategoryArticleErcs, getExcludedCategoryIds } from '@/utils/navigation';

const getMainCategoryContentLoader = (categoryId: number, navigationItemType: NavigationItemType) =>
  (({ context }) => {
    const isLoggedIn = !!context;
    const language = i18n.language;

    const navigationItems = getNavigationTreeItems();
    const excludeCategoriesFromNewestContent = getExcludedCategoryIds(
      navigationItems,
      'hideFromMainCategoryPageNewestCarousel',
      language as LangCode,
    );
    const excludeCategoriesFromMostViewedContent = getExcludedCategoryIds(
      navigationItems,
      'hideFromMainCategoryPageMostViewedCarousel',
      language as LangCode,
    );

    // The content is not awaited, so that the page can be rendered while the carousels are still loading.
    const newestCategoryContent = deferred(
      getCategoryContent(categoryId, 'newest', excludeCategoriesFromNewestContent).then(({ items }) => items),
    );
    const mostViewedCategoryContent = deferred(
      Promise.all([
        newestCategoryContent,
        getMostViewedArtikkeliErcs(
          getCategoryArticleErcs(categoryId, language as LangCode, excludeCategoriesFromMostViewedContent),
        ),
      ]).then(([articles, mostViewedArticleErcs]) =>
        mostViewedArticleErcs
          .map((erc) => articles.find((article) => article.externalReferenceCode === erc))
          .filter((a): a is StructuredContent => !!a),
      ),
    );
    const bestMatchingCategoryContent = deferred(
      isLoggedIn ? getBestMatchingArticles(categoryId) : Promise.resolve([]),
    );

    return {
      newestCategoryContent,
      mostViewedCategoryContent,
      bestMatchingCategoryContent,
      navigationItemType,
      isLoggedIn,
    };
  }) satisfies LoaderFunction<components['schemas']['OhjaajaCsrfDto'] | null>;

export type LoaderData = Awaited<ReturnType<ReturnType<typeof getMainCategoryContentLoader>>>;
export default getMainCategoryContentLoader;
