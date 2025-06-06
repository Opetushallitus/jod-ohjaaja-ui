import { LangCode } from '@/i18n/config';
import {
  type CMSNavigationItem,
  type CMSNavigationItemLocalization,
  type NavigationTreeItem,
} from '@/types/cms-navigation';
import { type TFunction } from 'i18next';
import { sluggify } from './string-utils';

export const getNavigationItems = (navigationItem: CMSNavigationItem, lng: LangCode): NavigationTreeItem => {
  const locale = getLocale(lng);

  return {
    title: navigationItem.name_i18n[locale] || navigationItem.name,
    name: sluggify(navigationItem.name),
    description: navigationItem.description_i18n[locale] || navigationItem.description,
    path: sluggify(navigationItem.name_i18n[locale] || navigationItem.name),
    type: navigationItem.type,
    children: navigationItem.children.map((child) => getNavigationItems(child, lng)),
    categoryId: navigationItem.categoryId ?? undefined,
    articleId: navigationItem.articleId ?? undefined,
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
