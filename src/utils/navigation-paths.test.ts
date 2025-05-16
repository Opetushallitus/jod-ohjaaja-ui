import { LangCode } from '@/i18n/config';
import { getNavigationTreeItems } from '@/services/navigation-loader';
import { NavigationItemType, NavigationTreeItem } from '@/types/cms-navigation';
import { beforeEach, describe, expect, it, Mock, vi } from 'vitest';
import {
  getArticleCategoryTitlePathParts,
  getArticlePath,
  getItemPath,
  getMainCategory,
  getMainCategoryPath,
} from './navigation-paths';

vi.mock('@/services/navigation-loader', () => ({
  getNavigationTreeItems: vi.fn(),
}));

const createBaseNavigationTreeItem = (
  title: string,
  name: string,
  path: string,
  type: NavigationItemType,
  categoryId: number,
  articleId: number,
  lng: LangCode,
): NavigationTreeItem => {
  return {
    title,
    name,
    path,
    description: '',
    type,
    categoryId,
    articleId,
    lng,
    children: [],
  };
};

const createNavigationTreeItemWithChildren = (
  baseItem: Omit<NavigationTreeItem, 'children'>,
  children: NavigationTreeItem[] = [],
): NavigationTreeItem => {
  return {
    ...baseItem,
    children,
  };
};

const mockTreeNavigationTreeItems = [
  createNavigationTreeItemWithChildren(
    createBaseNavigationTreeItem('Category 1', 'category-1', 'fi-category-1', 'CategoryListing', 1, 0, 'fi'),
    [
      createBaseNavigationTreeItem('Article-1', 'article-1', 'fi-article-1', 'Article', 0, 1, 'fi'),
      createBaseNavigationTreeItem('Article-2', 'article-2', 'fi-article-2', 'Article', 0, 2, 'fi'),
    ],
  ),
  createNavigationTreeItemWithChildren(
    createBaseNavigationTreeItem('Category 1', 'category-1', 'en-category-1', 'CategoryListing', 1, 0, 'en'),
    [
      createBaseNavigationTreeItem('Article-1', 'article-1', 'en-article-1', 'Article', 0, 1, 'en'),
      createBaseNavigationTreeItem('Article-2', 'article-2', 'en-article-2', 'Article', 0, 2, 'en'),
    ],
  ),
];

describe('Navigation Paths Utils', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  describe('getArticlePath', () => {
    it('should return the article path', () => {
      (getNavigationTreeItems as Mock).mockReturnValue(mockTreeNavigationTreeItems);
      const articlePath = getArticlePath(2, 'en');
      expect(articlePath).toBe('/en/en-category-1/en-article-2');
    });

    it('should return only language if article is not found', () => {
      (getNavigationTreeItems as Mock).mockReturnValue(mockTreeNavigationTreeItems);
      const articlePath = getArticlePath(3, 'fi');
      expect(articlePath).toBe('/fi/');
    });
  });
  describe('getItemPath', () => {
    it('should return item path', () => {
      (getNavigationTreeItems as Mock).mockReturnValue(mockTreeNavigationTreeItems);
      const itemPath = getItemPath('en', 'Article', 'article-2');
      expect(itemPath).toBe('en-article-2');
    });

    it('should return empty string if item is not found', () => {
      (getNavigationTreeItems as Mock).mockReturnValue(mockTreeNavigationTreeItems);
      const itemPath = getItemPath('en', 'Article', 'article-3');
      expect(itemPath).toBe('');
    });
  });

  describe('getMainCategoryPath', () => {
    it('should return the main category path', () => {
      (getNavigationTreeItems as Mock).mockReturnValue(mockTreeNavigationTreeItems);
      const mainCategoryPath = getMainCategoryPath('fi', 0);
      expect(mainCategoryPath).toBe('fi-category-1');
    });
    it('should return empty string if main category is not found', () => {
      (getNavigationTreeItems as Mock).mockReturnValue(mockTreeNavigationTreeItems);
      const mainCategoryPath = getMainCategoryPath('fi', 1);
      expect(mainCategoryPath).toBe('');
    });
  });

  describe('getMainCategory', () => {
    it('should return the main category', () => {
      (getNavigationTreeItems as Mock).mockReturnValue(mockTreeNavigationTreeItems);
      const mainCategory = getMainCategory('fi', 0);
      expect(mainCategory).toEqual(mockTreeNavigationTreeItems[0]);
    });

    it('should return null if main category is not found', () => {
      (getNavigationTreeItems as Mock).mockReturnValue(mockTreeNavigationTreeItems);
      const mainCategory = getMainCategory('fi', 1);
      expect(mainCategory).toBeNull();
    });
  });

  describe('getArticleCategoryTitlePathParts', () => {
    it('should return the path parts of the article category', () => {
      (getNavigationTreeItems as Mock).mockReturnValue(mockTreeNavigationTreeItems);
      const pathParts = getArticleCategoryTitlePathParts(1, 'fi');
      expect(pathParts).toEqual(['Category 1']);
    });
    it('should return an empty array if article is not found', () => {
      (getNavigationTreeItems as Mock).mockReturnValue(mockTreeNavigationTreeItems);
      const pathParts = getArticleCategoryTitlePathParts(3, 'fi');
      expect(pathParts).toEqual([]);
    });
  });
});
