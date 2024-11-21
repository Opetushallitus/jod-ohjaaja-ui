import i18n from '@/i18n/config';
import { RouteObject, redirect } from 'react-router-dom';
import { Home } from './Home';
import { NoMatch, Root } from './Root';

const rootRoute: RouteObject = {
  id: 'root',
  path: '/:lng',
  element: <Root />,
  children: [
    {
      index: true,
      element: <Home />,
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
