import { getRoutes } from '@/routes';
import { isRouteMatchHandle } from '@/types/cms-navigation';
import { type RouteObject, type UIMatch, useMatches } from 'react-router';

export const useCategoryRoute = () => {
  const matches = useMatches();
  const routes = getRoutes();

  const rootCategoryMatch = matches.find(
    (match) => isRouteMatchHandle(match.handle) && match.handle.type.startsWith('Category'),
  );
  const categoryRoute = rootCategoryMatch !== undefined ? findCategoryRoute(routes, rootCategoryMatch) : undefined;

  return categoryRoute;
};

const findCategoryRoute = (routes: RouteObject[], match: UIMatch): RouteObject | undefined => {
  for (const route of routes) {
    if (route.id === match.id) {
      return route;
    }
    if (route.children) {
      const childRoute = findCategoryRoute(route.children, match);
      if (childRoute) {
        return childRoute;
      }
    }
  }
  return undefined;
};
