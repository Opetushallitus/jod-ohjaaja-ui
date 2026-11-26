import { isFeatureEnabled } from '@/api/features';
import { supportedLanguageCodes } from '@/i18n/config';
import { CMSNavigationItem, CMSNavigationMenu, NavigationTreeItem } from '@/types/cms-navigation';
import { getNavigationItems } from '@/utils/navigation';

import { getNavigations } from './cms-navigation-api';

let navigationItems: NavigationTreeItem[] = [];

/** Leaves out the news listing and everything under it while the NEWS feature is off. */
const withoutNewsListing = (items: CMSNavigationItem[]): CMSNavigationItem[] =>
  items
    .filter((item) => item.type !== 'NewsListing')
    .map((item) => ({ ...item, children: withoutNewsListing(item.children) }));

export const loadNavigation = async () => {
  if (navigationItems.length > 0) return;

  const [navigationMenu, newsEnabled]: [CMSNavigationMenu, boolean] = await Promise.all([
    getNavigations(),
    isFeatureEnabled('NEWS'),
  ]);
  const cmsNavigationItems = newsEnabled
    ? navigationMenu.navigationItems
    : withoutNewsListing(navigationMenu.navigationItems);

  navigationItems = supportedLanguageCodes.flatMap((lng) =>
    cmsNavigationItems.map((navigationItem) => getNavigationItems(navigationItem, lng)),
  );
};

export const getNavigationTreeItems = (): readonly NavigationTreeItem[] => {
  if (navigationItems.length === 0) {
    throw new Error('Navigation has not been loaded yet. Call loadNavigation() first.');
  }
  return navigationItems;
};
