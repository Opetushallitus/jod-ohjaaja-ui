import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as cmsApi from './cms-api';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('CMS API', () => {
  beforeEach(() => {
    mockFetch.mockClear();
    mockFetch.mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({}),
      }),
    );
  });

  it('should fetch navigation menu', async () => {
    await cmsApi.getNavigations();
    expect(mockFetch).toHaveBeenCalledWith('/ohjaaja/cms/o/jod-navigation/20117', expect.any(Object));
  });

  it('should fetch content by article ID', async () => {
    await cmsApi.getContentByArticleId(123);
    expect(mockFetch).toHaveBeenCalledWith(
      '/ohjaaja/cms/o/headless-delivery/v1.0/structured-contents/123?nestedFields=embeddedTaxonomyCategory',
      expect.any(Object),
    );
  });

  it('should fetch newest content', async () => {
    await cmsApi.getNewestContent();
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
    await cmsApi.getCategoryContent(456, 'dateCreated:desc');
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
    await cmsApi.searchContent('test', ['789'], 1, 10);
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
    await cmsApi.getArticles([101, 102]);
    const queryParams = new URLSearchParams();
    queryParams.set('page', `1`);
    queryParams.set('pageSize', `500`);
    queryParams.set('nestedFields', 'embeddedTaxonomyCategory');
    const idFilters = [101, 102].map((id) => `id eq '${id}'`).join(' or ');
    queryParams.set('filter', idFilters);
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining(
        '/ohjaaja/cms/o/headless-delivery/v1.0/sites/20117/structured-contents?' + queryParams.toString(),
      ),
      expect.any(Object),
    );
  });

  it('should fetch tags', async () => {
    await cmsApi.getTags();
    expect(mockFetch).toHaveBeenCalledWith('/ohjaaja/cms/o/jod-tags/20117', expect.any(Object));
  });

  it('should throw error on failed request', async () => {
    mockFetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: false,
        statusText: 'Not Found',
      }),
    );

    await expect(cmsApi.getTags()).rejects.toThrow('CMS API error: Not Found');
  });
});
