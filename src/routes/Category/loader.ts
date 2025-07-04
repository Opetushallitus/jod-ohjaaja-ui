import { getMostViewedArtikkeliIds } from '@/api/artikkelinKatselu';
import { getBestMatchingArticles } from '@/api/kiinnostukset';
import { components } from '@/api/schema';
import { getCategoryContent } from '@/services/cms-api';
import { StructuredContent } from '@/types/cms-content';
import { LoaderFunction } from 'react-router';

const getCategoryContentLoader = (categoryId: number) =>
  (async ({ context }) => {
    const isLoggedIn = !!context;
    const [newestCategoryContent, mostViewedArticleIds, bestMatchingCategoryContent] = await Promise.all([
      getCategoryContent(categoryId, 'dateCreated:desc'),
      getMostViewedArtikkeliIds(),
      isLoggedIn ? getBestMatchingArticles(categoryId) : Promise.resolve([]),
    ]);

    const mostViewedCategoryContent = mostViewedArticleIds
      .map((id) => newestCategoryContent.items.find((article) => article.id === id))
      .filter((a): a is StructuredContent => !!a);

    return { newestCategoryContent, mostViewedCategoryContent, bestMatchingCategoryContent, isLoggedIn };
  }) satisfies LoaderFunction<components['schemas']['OhjaajaCsrfDto'] | null>;

export type LoaderData = Awaited<ReturnType<ReturnType<typeof getCategoryContentLoader>>>;
export default getCategoryContentLoader;
