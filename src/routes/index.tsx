import { withOhjaajaContext } from '@/auth';
import i18n, { supportedLanguageCodes } from '@/i18n/config';
import { ContentDetails, getContentDetailsLoader } from '@/routes/ContentDetails';
import { getNavigationTreeItems } from '@/services/navigation-loader';
import { NavigationTreeItem } from '@/types/cms-navigation';
import { RouteObject, replace } from 'react-router';
import { CategoryListing, CategoryMain, getCategoryContentLoader } from './Category';
import { Home, homeLoader } from './Home';
import { Details, Favorites, Preferences, Profile, profileDetailsLoader } from './Profile';

import { ErrorBoundary, NoMatch, Root, rootLoader } from './Root';
import { Search, searchLoader } from './Search';

export const profileRoutes = supportedLanguageCodes.map(
  (lng) =>
    ({
      id: `{slugs.profile.index}|${lng}`,
      path: i18n.t('slugs.profile.index', { lng }),
      element: <Profile />,
      loader: withOhjaajaContext(() => null),
      children: [
        {
          index: true,
          loader: () => replace(i18n.t('slugs.profile.details', { lng })),
        },
        {
          id: `{slugs.profile.details}|${lng}`,
          path: i18n.t('slugs.profile.details', { lng }),
          element: <Details />,
          loader: withOhjaajaContext(profileDetailsLoader, true),
        },
        {
          id: `{slugs.profile.favorites}|${lng}`,
          path: i18n.t('slugs.profile.favorites', { lng }),
          element: <Favorites />,
        },
        {
          id: `{slugs.profile.preferences}|${lng}`,
          path: i18n.t('slugs.profile.preferences', { lng }),
          element: <Preferences />,
        },
      ],
    }) as RouteObject,
);

const rootRoute: RouteObject = {
  id: 'root',
  path: '/:lng',
  loader: withOhjaajaContext(rootLoader, false),
  element: <Root />,
  errorElement: <ErrorBoundary />,
  children: [
    {
      index: true,
      element: <Home />,
      loader: withOhjaajaContext(homeLoader, false),
    },
    ...profileRoutes,
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
      description: navigationTreeItem.description,
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
      return withOhjaajaContext(getCategoryContentLoader(navigationTreeItem.categoryId ?? 0), false);
    case 'CategoryListing':
    case 'StudyProgramsListing':
      return withOhjaajaContext(getCategoryContentLoader(navigationTreeItem.categoryId ?? 0), false);
    case 'Article':
      return withOhjaajaContext(
        getContentDetailsLoader(navigationTreeItem.articleId ?? 0, navigationTreeItem.externalReferenceCode),
        false,
      );
  }
};

const getElement = (navigationTreeItem: NavigationTreeItem) => {
  switch (navigationTreeItem.type) {
    case 'CategoryMain':
      return <CategoryMain />;
    case 'CategoryListing':
    case 'StudyProgramsListing':
      return <CategoryListing />;
    case 'Article':
      return <ContentDetails />;
  }
  return undefined;
};
