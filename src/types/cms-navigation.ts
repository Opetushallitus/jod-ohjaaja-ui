import { LangCode } from '@/i18n/config';

export const NavigationItemTypeArray = ['Article', 'CategoryListing', 'CategoryMain'] as const;
export type NavigationItemType = (typeof NavigationItemTypeArray)[number];
export const isNavigationItemType = (value: unknown): value is NavigationItemType =>
  value !== undefined && typeof value === 'string' && NavigationItemTypeArray.includes(value as NavigationItemType);

export interface CMSNavigationNameI18n {
  fi_FI: string;
  en_US: string;
  sv_SE: string;
}
export interface CMSNavigationItem {
  id: number;
  name: string;
  name_i18n: CMSNavigationNameI18n;
  type: NavigationItemType;
  articleId: number | null;
  categoryId: number | null;
  parentNavigationId: number;
  children: CMSNavigationItem[];
}
export interface CMSNavigationMenu {
  id: number;
  siteId: number;
  navigationItems: CMSNavigationItem[];
}

export interface NavigationTreeItem {
  name: string;
  path: string;
  type: NavigationItemType;
  children: NavigationTreeItem[];
  categoryId?: number;
  articleId?: number;
  lng: LangCode;
}
