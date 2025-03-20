import i18n from '@/i18n/config';
import { ContentDetails, getContentDetailsLoader } from '@/routes/ContentDetails';
import { getNavigationTreeItems } from '@/services/navigation-loader';
import { NavigationTreeItem } from '@/types/cms-navigation';
import { RouteObject, replace } from 'react-router';
import { CategoryContent, getCategoryContentLoader } from './CategoryContent';
import { Home, homeLoader } from './Home';
import { NoMatch, Root, rootLoader } from './Root';

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
  rootRoute.children?.push(...routes);
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
