import { LangCode } from '@/i18n/config';
import { Navigation, NavigationNameI18n, NavigationTreeItem } from '@/types/cms-navigation';
import { sluggify } from './string-utils';

export const getNavigationItems = (
  navigation: Navigation,
  navigationsTree: Navigation[],
  lng: LangCode,
): NavigationTreeItem => {
  const children = getNavigationChildren(navigation.id, navigationsTree);
  const locale = getLocale(lng);

  return {
    name: sluggify(navigation.name),
    path: sluggify(navigation.name_i18n[locale] || navigation.name),
    type: navigation.type.key,
    children: children.map((child) => getNavigationItems(child, navigationsTree, lng)),
    order: navigation.order,
    categoryId: navigation.categoryId,
    articleId: navigation.articleId,
    lng,
  };
};

export const getNavigationChildren = (parentId: number, navigationsTree: Navigation[]): Navigation[] => {
  return navigationsTree.filter((navigation) => navigation.r_parent_c_navigationId === parentId);
};

export const getLocale = (lng: string): keyof NavigationNameI18n => {
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
