import i18n from '@/i18n/config';
import { ContentDetails, contentDetailsLoader } from '@/routes/ContentDetails';
import { RouteObject, redirect } from 'react-router';
import { Home, homeLoader } from './Home';
import { NoMatch, Root } from './Root';

const rootRoute: RouteObject = {
  id: 'root',
  path: '/:lng',
  element: <Root />,
  children: [
    {
      index: true,
      element: <Home />,
      loader: homeLoader,
    },
    {
      path: `${i18n.t('slugs.content-details')}/:id`,
      element: <ContentDetails />,
      loader: contentDetailsLoader,
    },
  ],
};

export const routes: RouteObject[] = [
  {
    path: '/',
    loader: () => redirect(`/${i18n.language}`),
  },
  rootRoute,
  { path: '*', element: <NoMatch /> },
];
