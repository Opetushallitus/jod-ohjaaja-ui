import { LangCode } from '@/i18n/config';
import { getNavigationTreeItems } from '@/services/navigation-loader';
import { NavigationItemType, NavigationTreeItem } from '@/types/cms-navigation';
import { beforeEach, describe, expect, it, Mock, vi } from 'vitest';
import { getArticlePath, getItemPath } from './navigation-paths';

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
