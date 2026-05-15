import { type TFunction } from 'i18next';

import { LangCode } from '@/i18n/config';
import { getNavigationTreeItems } from '@/services/navigation-loader';
import {
  NavigationItemType,
  type CMSNavigationItem,
  type CMSNavigationItemLocalization,
  type NavigationTreeItem,
} from '@/types/cms-navigation';

import { sluggify } from './string-utils';

export const getNavigationItems = (navigationItem: CMSNavigationItem, lng: LangCode): NavigationTreeItem => {
  const locale = getLocale(lng);

  return {
    title: navigationItem.name_i18n[locale] || navigationItem.name,
    name: sluggify(navigationItem.name),
    description: navigationItem.description_i18n[locale] || navigationItem.description,
    path: sluggify(navigationItem.name_i18n[locale] || navigationItem.name),
    hideFromHomePageNewestCarousel: navigationItem.hideFromHomePageNewestCarousel,
    hideFromHomePageMostViewedCarousel: navigationItem.hideFromHomePageMostViewedCarousel,
    hideFromMainCategoryPageNewestCarousel: navigationItem.hideFromMainCategoryPageNewestCarousel,
    hideFromMainCategoryPageMostViewedCarousel: navigationItem.hideFromMainCategoryPageMostViewedCarousel,
    type: navigationItem.type,
    children: navigationItem.children.map((child) => getNavigationItems(child, lng)),
    categoryId: navigationItem.categoryId ?? undefined,
    articleId: navigationItem.articleId ?? undefined,
    externalReferenceCode: navigationItem.externalReferenceCode,
    lng,
  };
};

export const getLocale = (lng: string): keyof CMSNavigationItemLocalization => {
  switch (lng) {
    case 'fi':
      return 'fi-FI';
    case 'en':
      return 'en-US';
    case 'sv':
      return 'sv-SE';
    default:
      return 'fi-FI';
  }
};

export const getSearchUrl = (
  translate: TFunction<'translation', undefined>,
  lng: string,
  tagIds?: string[],
  search?: string,
  page?: number,
): string => {
  const queryParams = new URLSearchParams();
  if (search) {
    queryParams.set('q', search);
  }
  if (tagIds) {
    tagIds.forEach((tagId) => {
      queryParams.append('t', tagId);
    });
  }
  if (page) {
    queryParams.set('p', `${page}`);
  }
  return `/${lng}/${translate('slugs.search')}?${queryParams.toString()}`;
};

/**
 * Get the all article IDs from a category navigation item and its child categories
 * @param {NavigationTreeItem} navigationItem - The navigation item to search
 * @returns {number[]} - An array of article IDs
 */
export const getCategoryArticleIds = (navigationItem: NavigationTreeItem): number[] => {
  return (
    navigationItem.children?.reduce((acc, item) => {
      if (item.type === 'Article' && item.articleId) {
        acc.push(item.articleId);
      } else if (item.children) {
        acc.push(...getCategoryArticleIds(item));
      }
      return acc;
    }, [] as number[]) ?? []
  );
};

/**
 * Get the all article ERCs from a category navigation item and its child categories
 * @param {number} categoryId - The category ID to search
 * @param {LangCode} language - The language code to filter navigation items
 * @param {number[]} excludedCategories - An array of category IDs to exclude from the search
 * @returns {string[]} - An array of article ERCs
 */
export const getCategoryArticleErcs = (
  categoryId: number,
  language: LangCode,
  excludedCategories: number[] = [],
): string[] => {
  const navigationItem = getNavigationTreeItems().find(
    (item) => item.categoryId === categoryId && item.lng === language,
  );
  return navigationItem ? getArticleErcs(navigationItem, excludedCategories) : [];
};

const getArticleErcs = (navigationItem: NavigationTreeItem, excludedCategories: number[] = []): string[] => {
  if (navigationItem.categoryId && excludedCategories.includes(navigationItem.categoryId)) {
    return [];
  }

  return (
    navigationItem.children?.reduce((acc, item) => {
      if (item.type === 'Article' && item.externalReferenceCode) {
        acc.push(item.externalReferenceCode);
      } else if (item.children && item.categoryId && !excludedCategories.includes(item.categoryId)) {
        acc.push(...getArticleErcs(item, excludedCategories));
      }
      return acc;
    }, [] as string[]) ?? []
  );
};

export const getExcludedCategoryIds = (
  navigationItems: readonly NavigationTreeItem[],
  from:
    | 'hideFromHomePageNewestCarousel'
    | 'hideFromHomePageMostViewedCarousel'
    | 'hideFromMainCategoryPageNewestCarousel'
    | 'hideFromMainCategoryPageMostViewedCarousel',
  lng: LangCode,
): number[] => {
  return navigationItems
    .filter((item) => item.lng === lng)
    .reduce((acc, item) => {
      if (item[from]) {
        if (item.categoryId) {
          acc.push(item.categoryId);
        }
        acc.push(...getExcludedCategoryIds(item.children, from, lng));
      } else {
        acc.push(...getExcludedCategoryIds(item.children, from, lng));
      }
      return acc;
    }, [] as number[]);
};

export const getNavigationItemsByType = (
  navigationItems: readonly NavigationTreeItem[],
  type: NavigationItemType,
  lng: LangCode,
): NavigationTreeItem[] => {
  return [
    ...navigationItems.filter((item) => item.type === type && item.lng === lng),
    ...navigationItems
      .filter((item) => item.children.length > 0)
      .flatMap((item) => getNavigationItemsByType(item.children, type, lng)),
  ];
};
