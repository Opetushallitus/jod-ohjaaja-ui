import i18n, { supportedLanguageCodes } from '@/i18n/config';
import { ContentDetails, contentDetailsLoader } from '@/routes/ContentDetails';
import { RouteObject, replace } from 'react-router';
import { Home, homeLoader } from './Home';
import { NoMatch, Root, rootLoader } from './Root';

const contentDetailsRoutes: RouteObject[] = supportedLanguageCodes.map((lng) => ({
  id: `{slugs.content-details}/:id|${lng}`,
  path: `${i18n.t('slugs.content-details', { lng })}/:id`,
  element: <ContentDetails />,
  loader: contentDetailsLoader,
}));

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
    ...contentDetailsRoutes,
  ],
};

export const routes: RouteObject[] = [
  {
    path: '/',
    loader: () => replace(`/${i18n.language}`),
  },
  rootRoute,
  { path: '*', element: <NoMatch /> },
];
