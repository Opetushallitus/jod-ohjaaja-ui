import { LangCode } from '@/i18n/config';

export const NavigationItemTypeArray = ['Main', 'Listing', 'Article'] as const;
export type NavigationItemType = (typeof NavigationItemTypeArray)[number];
export const isNavigationItemType = (value: unknown): value is NavigationItemType =>
  value !== undefined && typeof value === 'string' && NavigationItemTypeArray.includes(value as NavigationItemType);

export interface NavigationType {
  key: NavigationItemType;
}
export interface NavigationNameI18n {
  fi_FI: string;
  en_US: string;
  sv_SE: string;
}
export interface Navigation {
  id: number;
  name: string;
  name_i18n: NavigationNameI18n;
  type: NavigationType;
  r_parent_c_navigationId: number;
  order: number;
  categoryId: number;
  articleId: number;
}
export interface Navigations {
  items: Navigation[];
}

export interface NavigationTreeItem {
  name: string;
  path: string;
  type: NavigationItemType;
  children: NavigationTreeItem[];
  order: number;
  categoryId?: number;
  articleId?: number;
  lng: LangCode;
}
