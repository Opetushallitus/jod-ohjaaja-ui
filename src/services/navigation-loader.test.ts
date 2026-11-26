import { beforeEach, describe, expect, it, vi } from 'vitest';

import { type CMSNavigationItem, type CMSNavigationMenu } from '@/types/cms-navigation';

const getNavigations = vi.fn<() => Promise<CMSNavigationMenu>>();
const isFeatureEnabled = vi.fn<(feature: string) => Promise<boolean>>();

vi.mock('./cms-navigation-api', () => ({ getNavigations: () => getNavigations() }));
vi.mock('@/api/features', () => ({ isFeatureEnabled: (feature: string) => isFeatureEnabled(feature) }));

const item = (id: number, type: CMSNavigationItem['type'], children: CMSNavigationItem[] = []): CMSNavigationItem => ({
  id,
  name: `item-${id}`,
  name_i18n: { 'fi-FI': `item-${id}`, 'en-US': `item-${id}`, 'sv-SE': `item-${id}` },
  slug: `item-${id}`,
  slug_i18n: {},
  description: '',
  description_i18n: { 'fi-FI': '', 'en-US': '', 'sv-SE': '' },
  hideFromHomePageNewestCarousel: false,
  hideFromHomePageMostViewedCarousel: false,
  hideFromMainCategoryPageNewestCarousel: false,
  hideFromMainCategoryPageMostViewedCarousel: false,
  type,
  articleId: null,
  categoryId: null,
  parentNavigationId: 0,
  children,
});

const menu: CMSNavigationMenu = {
  id: 1,
  siteId: 1,
  navigationItems: [item(1, 'CategoryMain', [item(2, 'NewsListing')]), item(3, 'NewsListing')],
};

const loadTypes = async () => {
  // The loader keeps the navigation in module state, so every test needs a fresh module.
  vi.resetModules();
  const { loadNavigation, getNavigationTreeItems } = await import('./navigation-loader');
  await loadNavigation();
  return getNavigationTreeItems()
    .filter((navigationItem) => navigationItem.lng === 'fi')
    .map((navigationItem) => [navigationItem.type, navigationItem.children.map((child) => child.type)]);
};

describe('loadNavigation', () => {
  beforeEach(() => {
    getNavigations.mockReset().mockResolvedValue(menu);
    isFeatureEnabled.mockReset();
  });

  it('leaves out the news listings when the NEWS feature is off', async () => {
    isFeatureEnabled.mockResolvedValue(false);

    expect(await loadTypes()).toEqual([['CategoryMain', []]]);
    expect(isFeatureEnabled).toHaveBeenCalledWith('NEWS');
  });

  it('keeps the news listings when the NEWS feature is on', async () => {
    isFeatureEnabled.mockResolvedValue(true);

    expect(await loadTypes()).toEqual([
      ['CategoryMain', ['NewsListing']],
      ['NewsListing', []],
    ]);
  });
});
