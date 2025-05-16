import { LangCode } from '@/i18n/config';
import { CMSNavigationItem, NavigationItemType, NavigationTreeItem } from '@/types/cms-navigation';
import { TFunction } from 'i18next';
import { describe, expect, it, vi } from 'vitest';
import { getCategoryArticleIds, getLocale, getNavigationItems, getSearchUrl } from './navigation';

vi.mock('@/services/navigation-loader', () => ({
  getNavigationTreeItems: vi.fn(),
}));

describe('navigation utils', () => {
  describe('getLocale', () => {
    it('returns correct locale for Finnish', () => {
      expect(getLocale('fi')).toBe('fi-FI');
    });

    it('returns correct locale for English', () => {
      expect(getLocale('en')).toBe('en-US');
    });

    it('returns correct locale for Swedish', () => {
      expect(getLocale('sv')).toBe('sv-SE');
    });

    it('returns Finnish locale as default for unknown language', () => {
      expect(getLocale('unknown')).toBe('fi-FI');
    });
  });

  const createCMSNavigationItem = (
    id: number,
    name: string,
    parentId: number,
    type: NavigationItemType,
    children: CMSNavigationItem[] = [],
    categoryId: number | null = null,
    articleId: number | null = null,
  ): CMSNavigationItem => {
    return {
      id,
      name,
      name_i18n: {
        'fi-FI': name,
        'en-US': name,
        'sv-SE': name,
      },
      description: '',
      description_i18n: {
        'fi-FI': '',
        'en-US': '',
        'sv-SE': '',
      },
      type,
      categoryId,
      articleId,
      parentNavigationId: parentId,
      children,
    };
  };

  describe('getNavigationItems', () => {
    it('returns correct navigation tree item when there is only one item in navigation tree', () => {
      const navigationItem: CMSNavigationItem = createCMSNavigationItem(1, 'Main', 0, 'CategoryMain', [], 1);
      const result = getNavigationItems(navigationItem, 'fi' as LangCode);
      expect(result).toEqual({
        title: 'Main',
        name: 'main',
        description: '',
        path: 'main',
        type: 'CategoryMain',
        children: [],
        categoryId: 1,
        articleId: undefined,
        lng: 'fi',
      });
    });
    it('returns correct navigation tree item with children', () => {
      const navigationItem: CMSNavigationItem = createCMSNavigationItem(
        1,
        'Main',
        0,
        'CategoryMain',
        [
          createCMSNavigationItem(
            2,
            'Category 1',
            1,
            'CategoryListing',
            [createCMSNavigationItem(4, 'Article 1', 2, 'Article', [], null, 1)],
            2,
          ),
          createCMSNavigationItem(3, 'Category 2', 1, 'CategoryListing', [], 3),
        ],
        1,
      );
      const result = getNavigationItems(navigationItem, 'fi' as LangCode);

      expect(result.children).toHaveLength(2);
      expect(result.children[0]).toEqual({
        title: 'Category 1',
        name: 'category-1',
        description: '',
        path: 'category-1',
        type: 'CategoryListing',
        children: [
          {
            name: 'article-1',
            path: 'article-1',
            type: 'Article',
            title: 'Article 1',
            description: '',
            children: [],
            categoryId: undefined,
            articleId: 1,
            lng: 'fi',
          },
        ],
        categoryId: 2,
        articleId: undefined,
        lng: 'fi',
      });
    });
  });

  describe('getSearchUrl', () => {
    it('returns correct search URL with query parameters', () => {
      const translate = vi.fn((_: string) => 'search') as unknown as TFunction;
      const lng = 'fi';
      const tagIds = ['tag1', 'tag2'];
      const search = 'test search';
      const page = 2;

      const result = getSearchUrl(translate, lng, tagIds, search, page);
      expect(result).toBe('/fi/search?q=test+search&t=tag1&t=tag2&p=2');
    });

    it('returns correct search URL without query parameters', () => {
      const translate = vi.fn((_: string) => 'search') as unknown as TFunction;
      const lng = 'fi';

      const result = getSearchUrl(translate, lng);
      expect(result).toBe('/fi/search?');
    });
  });

  const createNavigationTreeItem = (
    title: string,
    name: string,
    children: Partial<NavigationTreeItem>[] = [],
    type: NavigationItemType = 'CategoryListing',
    articleId?: number,
  ): NavigationTreeItem => ({
    title,
    name,
    path: name,
    description: '',
    type,
    lng: 'fi',
    children: children as NavigationTreeItem[],
    ...(articleId && { articleId }),
  });

  describe('getCategoryArticleIds', () => {
    it('returns article IDs from navigation item and its child categories', () => {
      const navigationItem = createNavigationTreeItem('Category 1', 'category-1', [
        createNavigationTreeItem('Article 1', 'article-1', [], 'Article', 1),
        createNavigationTreeItem('Article 2', 'article-2', [], 'Article', 2),
      ]);
      const result = getCategoryArticleIds(navigationItem);
      expect(result).toEqual([1, 2]);
    });

    it('returns empty array if no article IDs are found', () => {
      const navigationItem = createNavigationTreeItem('Category 1', 'category-1', [
        createNavigationTreeItem('Category 2', 'category-2'),
      ]);
      const result = getCategoryArticleIds(navigationItem);
      expect(result).toEqual([]);
    });

    it('returns article IDs from nested categories', () => {
      const navigationItem = createNavigationTreeItem('Category 1', 'category-1', [
        createNavigationTreeItem('Category 2', 'category-2', [
          createNavigationTreeItem('Article 3', 'article-3', [], 'Article', 3),
        ]),
        createNavigationTreeItem('Article 4', 'article-4', [], 'Article', 4),
      ]);
      const result = getCategoryArticleIds(navigationItem);
      expect(result).toEqual([3, 4]);
    });

    it('returns empty array if no article IDs are found in nested categories', () => {
      const navigationItem = createNavigationTreeItem('Category 1', 'category-1', [
        createNavigationTreeItem('Category 2', 'category-2'),
      ]);
      const result = getCategoryArticleIds(navigationItem);
      expect(result).toEqual([]);
    });

    it('returns article IDs from multiple nested categories', () => {
      const navigationItem = createNavigationTreeItem('Category 1', 'category-1', [
        createNavigationTreeItem('Category 2', 'category-2', [
          createNavigationTreeItem('Article 5', 'article-5', [], 'Article', 5),
        ]),
        createNavigationTreeItem('Category 3', 'category-3', [
          createNavigationTreeItem('Article 6', 'article-6', [], 'Article', 6),
        ]),
      ]);
      const result = getCategoryArticleIds(navigationItem);
      expect(result).toEqual([5, 6]);
    });
  });
});
