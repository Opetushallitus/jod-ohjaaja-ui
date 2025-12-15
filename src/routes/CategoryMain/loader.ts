import { getMostViewedArtikkeliErcs } from '@/api/artikkelinKatselu';
import { getBestMatchingArticles } from '@/api/kiinnostukset';
import { components } from '@/api/schema';
import i18n, { LangCode } from '@/i18n/config';
import { getCategoryContent } from '@/services/cms-article-api';
import { StructuredContent } from '@/types/cms-content';
import { NavigationItemType } from '@/types/cms-navigation';
import { getCategoryArticleErcs } from '@/utils/navigation';
import { LoaderFunction } from 'react-router';

const getMainCategoryContentLoader = (categoryId: number, navigationItemType: NavigationItemType) =>
  (async ({ context }) => {
    const isLoggedIn = !!context;
    const [newestCategoryContent, mostViewedArticleErcs, bestMatchingCategoryContent] = await Promise.all([
      getCategoryContent(categoryId, 'newest'),
      getMostViewedArtikkeliErcs(getCategoryArticleErcs(categoryId, i18n.language as LangCode)),
      isLoggedIn ? getBestMatchingArticles(categoryId) : Promise.resolve([]),
    ]);

    const mostViewedCategoryContent = mostViewedArticleErcs
      .map((erc) => newestCategoryContent.items.find((article) => article.externalReferenceCode === erc))
      .filter((a): a is StructuredContent => !!a);

    return { newestCategoryContent, mostViewedCategoryContent, bestMatchingCategoryContent, navigationItemType };
  }) satisfies LoaderFunction<components['schemas']['OhjaajaCsrfDto'] | null>;

export type LoaderData = Awaited<ReturnType<ReturnType<typeof getMainCategoryContentLoader>>>;
export default getMainCategoryContentLoader;
