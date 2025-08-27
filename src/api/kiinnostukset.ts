import { getCategoryContent, searchContent } from '@/services/cms-article-api';
import { client } from './client';

const KIINNOSTUKSET_PATH = '/api/profiili/kiinnostukset';

export const getKiinnostukset = async () => {
  const { data, error } = await client.GET(KIINNOSTUKSET_PATH);

  if (!error) {
    return data ?? [];
  }

  return [];
};
export const addKiinnostus = async (asiasanaId: number) => {
  const { data, error } = await client.POST(KIINNOSTUKSET_PATH, {
    body: {
      asiasanaId,
    },
  });

  if (!error) {
    return data;
  }

  return null;
};

export const deleteKiinnostus = async (id: string) => {
  await client.DELETE(KIINNOSTUKSET_PATH, {
    params: {
      query: { id },
    },
  });
};

/**
 * Retrieve articles that best match the user's interests based on their 'kiinnostukset'.
 * If a categoryId is provided, it will filter articles within that category.
 * The articles are sorted by the number of matching tags with the user's interests.
 * @param categoryId - Optional category ID to filter articles by category.
 * @returns A promise that resolves to an array of articles sorted by match count.
 * If no interests are found, it returns an empty array.
 * If no articles match the interests, it also returns an empty array.
 */
export const getBestMatchingArticles = async (categoryId?: number) => {
  const kiinnostusIds = (await getKiinnostukset())
    .filter((kiinnostus): kiinnostus is { asiasanaId: number } => kiinnostus?.asiasanaId !== undefined)
    .map(({ asiasanaId }) => asiasanaId.toString());
  if (kiinnostusIds.length === 0) {
    return [];
  }
  const articles = categoryId ? await getCategoryContent(categoryId) : await searchContent('', kiinnostusIds, 1, 1000);
  const articlesWithMatchCount = articles.items.map((article) => {
    const tagIds = (article.taxonomyCategoryBriefs ?? [])
      .filter((cat) => cat.embeddedTaxonomyCategory?.type === 'TAG')
      .map((cat) => cat.taxonomyCategoryId.toString());

    const matchCount = tagIds.filter((id) => id && kiinnostusIds.includes(id)).length;

    return { article, matchCount };
  });
  articlesWithMatchCount.sort((a, b) => b.matchCount - a.matchCount);
  return articlesWithMatchCount.filter((item) => item.matchCount > 0).map((item) => item.article);
};
