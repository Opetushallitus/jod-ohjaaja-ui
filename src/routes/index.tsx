import i18n from '@/i18n/config';
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
