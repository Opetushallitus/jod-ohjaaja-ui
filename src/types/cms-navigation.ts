import { LangCode } from '@/i18n/config';

export const NavigationItemTypeArray = ['Article', 'CategoryListing', 'CategoryMain', 'StudyProgramsListing'] as const;
export type NavigationItemType = (typeof NavigationItemTypeArray)[number];
export const isNavigationItemType = (value: unknown): value is NavigationItemType =>
  value !== undefined && typeof value === 'string' && NavigationItemTypeArray.includes(value as NavigationItemType);

export interface CMSNavigationItemLocalization {
  'fi-FI': string;
  'en-US': string;
  'sv-SE': string;
}

export interface CMSNavigationItem {
  id: number;
  name: string;
  name_i18n: CMSNavigationItemLocalization;
  description: string;
  description_i18n: CMSNavigationItemLocalization;
  type: NavigationItemType;
  articleId: number | null;
  categoryId: number | null;
  externalReferenceCode?: string;
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
  description: string;
  type: NavigationItemType;
  children: NavigationTreeItem[];
  categoryId?: number;
  articleId?: number;
  externalReferenceCode?: string;
  lng: LangCode;
}

export interface RouteMatchHandle {
  type: NavigationItemType;
  title: string;
}

export const isRouteMatchHandle = (value: unknown): value is RouteMatchHandle =>
  value !== null && value !== undefined && typeof value === 'object' && 'type' in value && 'title' in value;
