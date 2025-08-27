import { getCategoryContent, searchContent } from '@/services/cms-article-api';
import { StructuredContent, StructuredContentPage } from '@/types/cms-content';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getBestMatchingArticles } from './kiinnostukset';

const mocks = vi.hoisted(() => ({
  api: vi.fn(),
}));
vi.mock('@/api/client', () => ({
  client: {
    GET: mocks.api,
  },
}));

vi.mock('@/services/cms-article-api', () => ({
  getCategoryContent: vi.fn(),
  searchContent: vi.fn(),
}));

const getMockArticles = (items: Partial<StructuredContent>[]): StructuredContentPage => {
  return {
    actions: {},
    facets: [],
    totalCount: items.length,
    page: 1,
    pageSize: 1,
    lastPage: 1,
    items: items.map((item) => ({
      id: item.id ?? 0,
      title: item.title ?? '',
      taxonomyCategoryBriefs: item.taxonomyCategoryBriefs ?? [],
    })) as StructuredContent[],
  };
};

describe('getBestMatchingArticles', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns empty array when no interests found', async () => {
    mocks.api.mockResolvedValue({ data: [] });
    const result = await getBestMatchingArticles();
    expect(result).toEqual([]);
  });

  it('returns articles sorted by match count', async () => {
    mocks.api.mockResolvedValue({ data: [{ asiasanaId: 1 }, { asiasanaId: 2 }] });

    const mockArticles = getMockArticles([
      {
        id: 1,
        taxonomyCategoryBriefs: [
          {
            taxonomyCategoryId: 1,
            embeddedTaxonomyCategory: { type: 'TAG', name_i18n: { 'fi-FI': 'Tag 1' } },
            taxonomyCategoryName: 'Tag 1',
          },
        ],
      },
      {
        id: 2,
        taxonomyCategoryBriefs: [
          {
            taxonomyCategoryId: 1,
            embeddedTaxonomyCategory: { type: 'TAG', name_i18n: { 'fi-FI': 'Tag 1' } },
            taxonomyCategoryName: 'Tag 1',
          },
          {
            taxonomyCategoryId: 2,
            embeddedTaxonomyCategory: { type: 'TAG', name_i18n: { 'fi-FI': 'Tag 2' } },
            taxonomyCategoryName: 'Tag 2',
          },
        ],
      },
    ]);

    vi.mocked(searchContent).mockResolvedValue(mockArticles);

    const result = await getBestMatchingArticles();
    expect(result).toHaveLength(2);
    expect(result[0].id).toBe(2); // Article with more matches comes first
    expect(result[1].id).toBe(1);
  });

  it('filters articles by category when categoryId is provided', async () => {
    mocks.api.mockResolvedValue({ data: [{ asiasanaId: 1 }] });

    const mockArticles = getMockArticles([
      {
        id: 1,
        taxonomyCategoryBriefs: [
          {
            taxonomyCategoryId: 1,
            embeddedTaxonomyCategory: { type: 'TAG', name_i18n: { 'fi-FI': 'Tag 1' } },
            taxonomyCategoryName: 'Tag 1',
          },
        ],
      },
    ]);

    vi.mocked(getCategoryContent).mockResolvedValue(mockArticles);

    await getBestMatchingArticles(123);
    expect(getCategoryContent).toHaveBeenCalledWith(123);
  });

  it('excludes articles with no matching tags', async () => {
    mocks.api.mockResolvedValue({ data: [{ asiasanaId: 1 }] });

    const mockArticles = getMockArticles([
      {
        id: 1,
        taxonomyCategoryBriefs: [
          {
            taxonomyCategoryId: 999,
            embeddedTaxonomyCategory: { type: 'TAG', name_i18n: { 'fi-FI': 'Tag 999' } },
            taxonomyCategoryName: 'Tag 999',
          },
        ],
      },
    ]);

    vi.mocked(searchContent).mockResolvedValue(mockArticles);

    const result = await getBestMatchingArticles();
    expect(result).toEqual([]);
  });
});
