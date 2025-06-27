import { getMostViewedArtikkeliIds } from '@/api/artikkelinKatselu';
import { components } from '@/api/schema';
import { getCategoryContent } from '@/services/cms-api';
import { StructuredContent } from '@/types/cms-content';
import { LoaderFunction } from 'react-router';

const getCategoryContentLoader = (categoryId: number) =>
  (async ({ context }) => {
    const [newestCategoryContent, mostViewedArticleIds] = await Promise.all([
      getCategoryContent(categoryId, 'dateCreated:desc'),
      getMostViewedArtikkeliIds(),
    ]);

    const mostViewedContent = mostViewedArticleIds
      .map((id) => newestCategoryContent.items.find((article) => article.id === id))
      .filter((a): a is StructuredContent => !!a);

    return { newestCategoryContent, mostViewedContent, isLoggedIn: !!context };
  }) satisfies LoaderFunction<components['schemas']['OhjaajaCsrfDto'] | null>;

export type LoaderData = Awaited<ReturnType<ReturnType<typeof getCategoryContentLoader>>>;
export default getCategoryContentLoader;
