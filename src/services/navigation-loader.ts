import { supportedLanguageCodes } from '@/i18n/config';
import { CMSNavigationMenu, NavigationTreeItem } from '@/types/cms-navigation';
import { getNavigationItems } from '@/utils/navigation';
import { getNavigations } from './cms-navigation-api';

let navigationItems: NavigationTreeItem[] = [];

export const loadNavigation = async () => {
  if (navigationItems.length > 0) return;

  const navigationMenu: CMSNavigationMenu = await getNavigations();

  navigationItems = supportedLanguageCodes.flatMap((lng) =>
    navigationMenu.navigationItems.map((naviogationItem) => getNavigationItems(naviogationItem, lng)),
  );
};

export const getNavigationTreeItems = (): readonly NavigationTreeItem[] => {
  if (navigationItems.length === 0) {
    throw new Error('Navigation has not been loaded yet. Call loadNavigation() first.');
  }
  return navigationItems;
};
