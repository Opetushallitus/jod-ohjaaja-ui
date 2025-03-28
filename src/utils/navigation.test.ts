import { LangCode } from '@/i18n/config';
import { CMSNavigationItem, NavigationItemType } from '@/types/cms-navigation';
import { describe, expect, it } from 'vitest';
import { getLocale, getNavigationItems } from './navigation';

describe('navigation utils', () => {
  describe('getLocale', () => {
    it('returns correct locale for Finnish', () => {
      expect(getLocale('fi')).toBe('fi_FI');
    });

    it('returns correct locale for English', () => {
      expect(getLocale('en')).toBe('en_US');
    });

    it('returns correct locale for Swedish', () => {
      expect(getLocale('sv')).toBe('sv_SE');
    });

    it('returns Finnish locale as default for unknown language', () => {
      expect(getLocale('unknown')).toBe('fi_FI');
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
        fi_FI: name,
        en_US: name,
        sv_SE: name,
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
        path: 'category-1',
        type: 'CategoryListing',
        children: [
          {
            name: 'article-1',
            path: 'article-1',
            type: 'Article',
            title: 'Article 1',
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
});
