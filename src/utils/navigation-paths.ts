import { getNavigationTreeItems } from '@/services/navigation-loader';
import { NavigationItemType, NavigationTreeItem } from '@/types/cms-navigation';

/*
 * Returns the path of the article with the given ID in the given language.
 * If the article is not found, the function should return the language path.
 */
export const getArticlePath = (articleId: number, lng: string): string => {
  const navigationItems = getNavigationTreeItems();

  const path =
    navigationItems
      .filter((item) => item.lng === lng)
      .map((item) => findArticlePath(item, articleId, lng))
      .find((path) => path !== null) ?? '';

  return `/${lng}/${path}`;
};

/*
 * Returns the path of the item with the given type and name in the given language.
 * If the item is not found, the function should return an empty string.
 */
export const getItemPath = (lng: string, type: NavigationItemType, name: string): string => {
  const navigationItems = getNavigationTreeItems();

  return (
    navigationItems
      .filter((item) => item.lng === lng)
      .map((item) => findItemPath(item, type, name))
      .find((path) => path !== null) ?? ''
  );
};

/*
 * Returns the path of the main category in the given language and order.
 * If the category is not found, the function should return an empty string.
 */
export const getMainCategoryPath = (lng: string, order: number): string => {
  const navigationItems = getNavigationTreeItems();

  return (
    navigationItems
      .filter((item, index) => item.lng === lng && index === order)
      .map((item) => item.path)
      .find((path) => path !== null) ?? ''
  );
};

/**
 * Get the main category of the navigation tree
 * @param lng The language code
 * @param order The order of the category
 * @returns The main category or null if not found
 */
export const getMainCategory = (lng: string, order: number): NavigationTreeItem | null => {
  const navigationItems = getNavigationTreeItems();
  const item = navigationItems.find((item, index) => item.lng === lng && index === order);
  if (item) {
    return {
      ...item,
    };
  }
  return null;
};

/**
 * Get the path parts of the article category with the given ID in the given language.
 * If the article is not found, the function should return an empty array.
 * @param articleId The ID of the article
 * @param lng The language code
 * @returns The path parts of the article category or an empty array if not found
 */
export const getArticleCategoryTitlePathParts = (articleId: number, lng: string): string[] => {
  const navigationItems = getNavigationTreeItems();

  for (const item of navigationItems) {
    if (item.lng === lng) {
      const path = findArticleCategoryTitlePath(item, articleId);
      if (path.length > 0) {
        return path;
      }
    }
  }

  return [];
};

const findArticlePath = (item: NavigationTreeItem, articleId: number, lng: string): string | null => {
  if (item.articleId === articleId && item.lng === lng) {
    return item.path;
  }

  for (const child of item.children) {
    const path = findArticlePath(child, articleId, lng);
    if (path) {
      return `${item.path}/${path}`;
    }
  }

  return null;
};

const findItemPath = (item: NavigationTreeItem, type: NavigationItemType, name: string): string | null => {
  if (item.type === type && item.name === name) {
    return item.path;
  }

  for (const child of item.children) {
    const path = findItemPath(child, type, name);
    if (path) {
      return path;
    }
  }

  return null;
};

const findArticleCategoryTitlePath = (item: NavigationTreeItem, articleId: number): string[] => {
  for (const child of item.children) {
    if (child.articleId === articleId) {
      return [item.title];
    }
    const path = findArticleCategoryTitlePath(child, articleId);
    if (path.length > 0) {
      return [item.title, ...path];
    }
  }

  return [];
};
