import i18n, { supportedLanguageCodes } from '@/i18n/config';
import { ContentDetails, getContentDetailsLoader } from '@/routes/ContentDetails';
import { getNavigationTreeItems } from '@/services/navigation-loader';
import { NavigationTreeItem } from '@/types/cms-navigation';
import { RouteObject, replace } from 'react-router';
import { CategoryContent, getCategoryContentLoader } from './CategoryContent';
import { Home, homeLoader } from './Home';
import { NoMatch, Root, rootLoader } from './Root';
import { Search, searchLoader } from './Search';

const rootRoute: RouteObject = {
  id: 'root',
  path: '/:lng',
  loader: rootLoader,
  element: <Root />,
  children: [
    {
      index: true,
      element: <Home />,
      loader: homeLoader,
    },
  ],
};

const searchRoutes: RouteObject[] = supportedLanguageCodes.map((lng) => ({
  id: `search|${lng}`,
  path: i18n.t('slugs.search', { lng }),
  handle: {
    title: i18n.t('search.title', { lng }),
  },
  element: <Search />,
  loader: searchLoader,
}));

let routes: RouteObject[] = [];

export const getRoutes = (): RouteObject[] => {
  if (routes.length === 0) {
    routes = createRoutes();
  }

  return routes;
};

const createRoutes = (): RouteObject[] => {
  const navigationTreeItems = getNavigationTreeItems();

  const routes = navigationTreeItems.map(getRoute);
  rootRoute.children?.push(...routes, ...searchRoutes);
  return [
    {
      path: '/',
      loader: () => replace(`/${i18n.language}`),
    },
    rootRoute,
    { path: '*', element: <NoMatch /> },
  ];
};

const getRoute = (navigationTreeItem: NavigationTreeItem): RouteObject => {
  const route = {
    id: `${navigationTreeItem.type}|${navigationTreeItem.name}|${navigationTreeItem.lng}`,
    path: navigationTreeItem.path,
    handle: {
      type: navigationTreeItem.type,
      title: navigationTreeItem.title,
    },
  };

  if (navigationTreeItem.children.length === 0) {
    return {
      ...route,
      loader: getLoader(navigationTreeItem),
      element: getElement(navigationTreeItem),
    };
  } else {
    return {
      ...route,
      children: [
        {
          index: true,
          element: getElement(navigationTreeItem),
          loader: getLoader(navigationTreeItem),
        },
        ...navigationTreeItem.children.map(getRoute),
      ],
    };
  }
};

const getLoader = (navigationTreeItem: NavigationTreeItem) => {
  switch (navigationTreeItem.type) {
    case 'CategoryMain':
      return rootLoader;
    case 'CategoryListing':
      return getCategoryContentLoader(navigationTreeItem.categoryId ?? 0);
    case 'Article':
      return getContentDetailsLoader(navigationTreeItem.articleId ?? 0);
  }
};

const getElement = (navigationTreeItem: NavigationTreeItem) => {
  switch (navigationTreeItem.type) {
    case 'CategoryMain':
      return <Home />;
    case 'CategoryListing':
      return <CategoryContent />;
    case 'Article':
      return <ContentDetails />;
  }
  return undefined;
};
