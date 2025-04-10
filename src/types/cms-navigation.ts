import { LangCode } from '@/i18n/config';

export const NavigationItemTypeArray = ['Article', 'CategoryListing', 'CategoryMain'] as const;
export type NavigationItemType = (typeof NavigationItemTypeArray)[number];
export const isNavigationItemType = (value: unknown): value is NavigationItemType =>
  value !== undefined && typeof value === 'string' && NavigationItemTypeArray.includes(value as NavigationItemType);

export interface CMSNavigationNameI18n {
  'fi-FI': string;
  'en-US': string;
  'sv-SE': string;
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
  title: string;
  name: string;
  path: string;
  type: NavigationItemType;
  children: NavigationTreeItem[];
  categoryId?: number;
  articleId?: number;
  lng: LangCode;
}

export interface RouteMatchHandle {
  type: NavigationItemType;
  title: string;
}

export const isRouteMatchHandle = (value: unknown): value is RouteMatchHandle =>
  value !== null && value !== undefined && typeof value === 'object' && 'type' in value && 'title' in value;
