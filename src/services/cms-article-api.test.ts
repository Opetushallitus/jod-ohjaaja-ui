import { NavigationTreeItem } from '@/types/cms-navigation';
import { beforeEach, describe, expect, it, Mock, vi } from 'vitest';
import {
  getArticlesByErcs,
  getCategoryContent,
  getContentByArticleId,
  getNewestContent,
  searchContent,
} from './cms-article-api';
import { getNavigationTreeItems } from './navigation-loader';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

vi.mock('@/services/navigation-loader', () => ({
  getNavigationTreeItems: vi.fn(),
}));

describe('CMS ARTICLE API', () => {
  beforeEach(() => {
    mockFetch.mockClear();
    mockFetch.mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({}),
      }),
    );
  });

  it('should fetch content by article ID', async () => {
    await getContentByArticleId(123);
    expect(mockFetch).toHaveBeenCalledWith(
      '/ohjaaja/cms/o/headless-delivery/v1.0/structured-contents/123?nestedFields=embeddedTaxonomyCategory',
      expect.any(Object),
    );
  });

  it('should fetch newest content', async () => {
    await getNewestContent();
    const queryParams = new URLSearchParams();
    queryParams.set('nestedFields', 'embeddedTaxonomyCategory');
    queryParams.set('page', `1`);
    queryParams.set('pageSize', `12`);
    queryParams.set('sort', 'dateCreated:desc');

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining(
        '/ohjaaja/cms/o/headless-delivery/v1.0/sites/20117/structured-contents?' + queryParams.toString(),
      ),
      expect.any(Object),
    );
  });

  it('should fetch category content', async () => {
    await getCategoryContent(456, 'dateCreated:desc');
    const queryParams = new URLSearchParams();
    queryParams.set('nestedFields', 'embeddedTaxonomyCategory');
    queryParams.set('page', `1`);
    queryParams.set('pageSize', `500`);
    queryParams.set('sort', 'dateCreated:desc');
    queryParams.set('filter', `taxonomyCategoryIds/any(t:t eq 456)`);

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining(
        '/ohjaaja/cms/o/headless-delivery/v1.0/sites/20117/structured-contents?' + queryParams.toString(),
      ),
      expect.any(Object),
    );
  });

  it('should search content', async () => {
    await searchContent('test', ['789'], 1, 10);
    const queryParams = new URLSearchParams();
    queryParams.set('page', `1`);
    queryParams.set('pageSize', `10`);
    queryParams.set('nestedFields', 'embeddedTaxonomyCategory');
    queryParams.set('search', 'test');
    queryParams.set('filter', `taxonomyCategoryIds/any(t:t eq 789)`);

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining(
        '/ohjaaja/cms/o/headless-delivery/v1.0/sites/20117/structured-contents?' + queryParams.toString(),
      ),
      expect.any(Object),
    );
  });

  it('should fetch articles by IDs', async () => {
    const mockTreeNavigationTreeItems: NavigationTreeItem[] = [
      {
        name: 'article-1',
        title: 'Article 1',
        description: '',
        path: '',
        lng: 'fi',
        type: 'Article',
        externalReferenceCode: '101',
        articleId: 1001,
        children: [],
      },
      {
        name: 'article-2',
        title: 'Article 2',
        description: '',
        path: '',
        lng: 'fi',
        type: 'Article',
        externalReferenceCode: '102',
        articleId: 1002,
        children: [],
      },
      {
        name: 'article-2',
        title: 'Article 2',
        description: '',
        path: '',
        lng: 'sv',
        type: 'Article',
        externalReferenceCode: '102',
        articleId: 1002,
        children: [],
      },
    ];

    (getNavigationTreeItems as Mock).mockReturnValue(mockTreeNavigationTreeItems);
    await getArticlesByErcs(['101', '102']);
    const queryParams = new URLSearchParams();
    queryParams.set('page', `1`);
    queryParams.set('pageSize', `500`);
    queryParams.set('nestedFields', 'embeddedTaxonomyCategory');
    const ids = [1001, 1002].map((id) => `'${id}'`);
    const idFilter = `id in (${ids.join(', ')})`;
    queryParams.set('filter', idFilter);

    mockFetch.mock.calls.forEach((call) => console.log(call[0])); // Debugging line to see the actual URL called

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining(
        '/ohjaaja/cms/o/headless-delivery/v1.0/sites/20117/structured-contents?' + queryParams.toString(),
      ),
      expect.any(Object),
    );
  });
});
