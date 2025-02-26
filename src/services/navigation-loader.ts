import { supportedLanguageCodes } from '@/i18n/config';
import { Navigations, NavigationTreeItem } from '@/types/cms-navigation';
import { getNavigationItems } from '@/utils/navigation';
import { getNavigations } from './cms-api';

let navigationItems: NavigationTreeItem[] = [];

export const loadNavigation = async () => {
  if (navigationItems.length > 0) return;

  const navigations: Navigations = await getNavigations();
  const rootNavigations = navigations.items.filter((n) => n.r_parent_c_navigationId === 0);

  navigationItems = supportedLanguageCodes.flatMap((lng) =>
    rootNavigations.map((navigation) => getNavigationItems(navigation, navigations.items, lng)),
  );
};

export const getNavigationTreeItems = (): readonly NavigationTreeItem[] => {
  if (navigationItems.length === 0) {
    throw new Error('Navigation has not been loaded yet. Call loadNavigation() first.');
  }
  return navigationItems;
};
