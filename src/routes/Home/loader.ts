import { getMostViewedArtikkeliErcs } from '@/api/artikkelinKatselu';
import { getBestMatchingArticles } from '@/api/kiinnostukset';
import { components } from '@/api/schema';
import i18n, { LangCode } from '@/i18n/config';
import { getArticlesByErcs, getNewestContent } from '@/services/cms-article-api';
import { getNavigationTreeItems } from '@/services/navigation-loader';
import { type StructuredContent } from '@/types/cms-content';
import { getNavigationItemsByType } from '@/utils/navigation';

import { LoaderFunction } from 'react-router';

const loader = (async ({ context }) => {
  const isLoggedIn = !!context;

  const navigationItems = getNavigationTreeItems();
  const studyProgramsListingIds = getNavigationItemsByType(
    navigationItems,
    'StudyProgramsListing',
    i18n.language as LangCode,
  )
    .map((item) => item.categoryId)
    .filter((id): id is number => !!id);

  const [newestContent, mostViewedContent, bestMatchingContent] = await Promise.all([
    // Exclude study programs from the newest content section on the front page.
    // Typically, there is only one StudyProgramsListing navigation item, but handle multiple gracefully.
    getNewestContent(studyProgramsListingIds.length > 0 ? studyProgramsListingIds[0] : undefined),
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
