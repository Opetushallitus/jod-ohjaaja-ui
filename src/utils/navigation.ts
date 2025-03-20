import { LangCode } from '@/i18n/config';
import { CMSNavigationItem, CMSNavigationNameI18n, NavigationTreeItem } from '@/types/cms-navigation';
import { sluggify } from './string-utils';

export const getNavigationItems = (navigationItem: CMSNavigationItem, lng: LangCode): NavigationTreeItem => {
  const locale = getLocale(lng);

  return {
    name: sluggify(navigationItem.name),
    path: sluggify(navigationItem.name_i18n[locale] || navigationItem.name),
    type: navigationItem.type,
    children: navigationItem.children.map((child) => getNavigationItems(child, lng)),
    categoryId: navigationItem.categoryId ?? undefined,
    articleId: navigationItem.articleId ?? undefined,
    lng,
  };
};

export const getLocale = (lng: string): keyof CMSNavigationNameI18n => {
  switch (lng) {
    case 'fi':
      return 'fi_FI';
    case 'en':
      return 'en_US';
    case 'sv':
      return 'sv_SE';
    default:
      return 'fi_FI';
  }
};
