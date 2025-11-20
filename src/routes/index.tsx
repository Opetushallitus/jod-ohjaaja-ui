import { withOhjaajaContext } from '@/auth';
import i18n, { supportedLanguageCodes } from '@/i18n/config';
import { ContentDetails, getContentDetailsLoader } from '@/routes/ContentDetails';
import { getNavigationTreeItems } from '@/services/navigation-loader';
import { NavigationTreeItem } from '@/types/cms-navigation';
import { RouteObject, replace } from 'react-router';
import { CategoryListing, CategoryMain, getCategoryContentLoader } from './Category';
import { Home, homeLoader } from './Home';
import { Details, Favorites, Preferences, Profile, profileDetailsLoader } from './Profile';

import { ModalProvider } from '@/hooks/useModal';
import { NoteStackProvider } from '@jod/design-system';
import articleRedirectLoader from './articleRedirectLoader';
import LoginPage from './LoginPage/LoginPage';
import ProfileFront from './Profile/ProfileFront/ProfileFront';
import { ErrorBoundary, NoMatch, Root, rootLoader } from './Root';
import { Search, searchLoader } from './Search';

export const profileRoutes = supportedLanguageCodes.map(
  (lng) =>
    ({
      id: `{slugs.profile.index}|${lng}`,
      path: i18n.t('slugs.profile.index', { lng }),
      element: <Profile />,
      handle: {
        title: i18n.t('profile.front.title', { lng }),
      },
      loader: withOhjaajaContext(() => null),
      children: [
        {
          index: true,
          loader: () => replace(i18n.t('slugs.profile.front', { lng })),
        },
        {
          id: `{slugs.profile.front}|${lng}`,
          path: i18n.t('slugs.profile.front', { lng }),
          element: <ProfileFront />,
        },
        {
          id: `{slugs.profile.details}|${lng}`,
          path: i18n.t('slugs.profile.details', { lng }),
          element: <Details />,
          handle: {
            title: i18n.t('profile.details.title', { lng }),
          },
          loader: withOhjaajaContext(profileDetailsLoader, true),
        },
        {
          id: `{slugs.profile.favorites}|${lng}`,
          path: i18n.t('slugs.profile.favorites', { lng }),
          element: <Favorites />,
          handle: {
            title: i18n.t('profile.favorites.title', { lng }),
          },
        },
        {
          id: `{slugs.profile.preferences}|${lng}`,
          path: i18n.t('slugs.profile.preferences', { lng }),
          element: <Preferences />,
          handle: {
            title: i18n.t('profile.preferences.title', { lng }),
          },
        },
      ],
    }) as RouteObject,
);

const shortArticleRoutes = supportedLanguageCodes.map(
  (lng) =>
    ({
      id: `article-short|${lng}`,
      path: i18n.t('slugs.article.short', { lng }),
      loader: articleRedirectLoader,
      element: <div></div>,
    }) as RouteObject,
);

const profileLoginPageRoutes = supportedLanguageCodes.map(
  (lng) =>
    ({
      id: `{slugs.profile.login}|${lng}`,
      path: i18n.t('slugs.profile.login', { lng }),
      element: <LoginPage />,
      handle: {
        title: i18n.t('login', { lng }),
      },
    }) as RouteObject,
);

const rootRoute: RouteObject = {
  id: 'root',
  path: '/:lng',
  loader: withOhjaajaContext(rootLoader, false),
  element: (
    <NoteStackProvider>
      <ModalProvider>
        <Root />
      </ModalProvider>
    </NoteStackProvider>
  ),
  errorElement: <ErrorBoundary />,
  children: [
    {
      index: true,
      element: <Home />,
      loader: withOhjaajaContext(homeLoader, false),
    },
    ...profileRoutes,
    ...shortArticleRoutes,
    ...profileLoginPageRoutes,
    { path: '*', element: <NoMatch /> },
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
    case 'CategoryListing':
    case 'StudyProgramsListing':
      return withOhjaajaContext(
        getCategoryContentLoader(navigationTreeItem.categoryId ?? 0, navigationTreeItem.type),
        false,
      );
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
