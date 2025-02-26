import { LangCode } from '@/i18n/config';
import { Navigation, NavigationItemType } from '@/types/cms-navigation';
import { describe, expect, it } from 'vitest';
import { getLocale, getNavigationChildren, getNavigationItems } from './navigation';

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

  const createNavigation = (
    id: number,
    name: string,
    parentId: number,
    type: NavigationItemType,
    order: number,
    categoryId: number,
    articleId: number,
  ): Navigation => {
    return {
      id,
      name,
      name_i18n: {
        fi_FI: name,
        en_US: name,
        sv_SE: name,
      },
      r_parent_c_navigationId: parentId,
      type: { key: type },
      order,
      categoryId,
      articleId,
    };
  };

  describe('getNavigationChildren', () => {
    const mockNavigations: Navigation[] = [
      createNavigation(1, 'Main', 0, 'Main', 0, 1, 0),
      createNavigation(2, 'Category 1', 1, 'Listing', 0, 2, 0),
      createNavigation(3, 'Category 2', 1, 'Listing', 1, 3, 0),
      createNavigation(4, 'Article 1', 2, 'Article', 0, 0, 1),
    ];

    it('returns children for given parent id', () => {
      const children = getNavigationChildren(1, mockNavigations);
      expect(children).toHaveLength(2);
      expect(children.map((c) => c.id)).toEqual([2, 3]);
    });

    it('returns empty array when no children found', () => {
      const children = getNavigationChildren(999, mockNavigations);
      expect(children).toHaveLength(0);
    });
  });

  describe('getNavigationItems', () => {
    const mockNavigations: Navigation[] = [
      createNavigation(1, 'Main', 0, 'Main', 0, 1, 0),
      createNavigation(2, 'Category 1', 1, 'Listing', 0, 2, 0),
      createNavigation(3, 'Category 2', 1, 'Listing', 1, 3, 0),
      createNavigation(4, 'Article 1', 2, 'Article', 0, 0, 1),
    ];

    it('returns correct navigation tree item when there is only one item in navigation tree', () => {
      const result = getNavigationItems(mockNavigations[0], [mockNavigations[0]], 'fi' as LangCode);
      expect(result).toEqual({
        name: 'main',
        path: 'main',
        type: 'Main',
        children: [],
        order: 0,
        categoryId: 1,
        articleId: 0,
        lng: 'fi',
      });
    });
    it('returns correct navigation tree item with children', () => {
      const result = getNavigationItems(mockNavigations[0], mockNavigations, 'fi' as LangCode);

      expect(result.children).toHaveLength(2);
      expect(result.children[0]).toEqual({
        name: 'category-1',
        path: 'category-1',
        type: 'Listing',
        children: [
          {
            name: 'article-1',
            path: 'article-1',
            type: 'Article',
            children: [],
            order: 0,
            categoryId: 0,
            articleId: 1,
            lng: 'fi',
          },
        ],
        order: 0,
        categoryId: 2,
        articleId: 0,
        lng: 'fi',
      });
    });
  });
});
