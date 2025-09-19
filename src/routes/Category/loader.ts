import { getMostViewedArtikkeliErcs } from '@/api/artikkelinKatselu';
import { getBestMatchingArticles } from '@/api/kiinnostukset';
import { components } from '@/api/schema';
import { getCategoryContent } from '@/services/cms-article-api';
import { StructuredContent } from '@/types/cms-content';
import { NavigationItemType } from '@/types/cms-navigation';
import { LoaderFunction } from 'react-router';

const getCategoryContentLoader = (categoryId: number, navigationItemType: NavigationItemType) =>
  (async ({ context }) => {
    const isLoggedIn = !!context;
    const [newestCategoryContent, mostViewedArticleErcs, bestMatchingCategoryContent] = await Promise.all([
      getCategoryContent(categoryId, 'dateCreated:desc'),
      getMostViewedArtikkeliErcs(),
      isLoggedIn ? getBestMatchingArticles(categoryId) : Promise.resolve([]),
    ]);

    const mostViewedCategoryContent = mostViewedArticleErcs
      .map((erc) => newestCategoryContent.items.find((article) => article.externalReferenceCode === erc))
      .filter((a): a is StructuredContent => !!a);

    return { newestCategoryContent, mostViewedCategoryContent, bestMatchingCategoryContent, navigationItemType };
  }) satisfies LoaderFunction<components['schemas']['OhjaajaCsrfDto'] | null>;

export type LoaderData = Awaited<ReturnType<ReturnType<typeof getCategoryContentLoader>>>;
export default getCategoryContentLoader;
