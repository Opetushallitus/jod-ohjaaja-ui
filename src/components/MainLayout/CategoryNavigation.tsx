import { useCategoryRoute } from '@/hooks/useCategoryRoutes';
import { getLinkTo } from '@/utils/routeUtils';
import { type MenuSection, PageNavigation, useMediaQueries } from '@jod/design-system';
import { useTranslation } from 'react-i18next';
import { type RouteObject, useLocation } from 'react-router';

export const CategoryNavigation = () => {
  const categoryRoute = useCategoryRoute('CategoryMain');
  const { lg } = useMediaQueries();
  const { i18n, t } = useTranslation();
  const location = useLocation();

  const isCategory = (category: RouteObject) =>
    category.handle?.type.startsWith('Category') || category.handle?.type.startsWith('StudyPrograms');

  const hasChildren = categoryRoute?.children?.some(isCategory);
  const menuSection: MenuSection | undefined = categoryRoute
    ? {
        title: t('in-this-section'),
        linkItems: [
          {
            label: categoryRoute.handle.title,
            linkComponent: getLinkTo(`/${i18n.language}/${categoryRoute.path}`),
            selected: location.pathname === `/${i18n.language}/${categoryRoute.path}`,
            childItems: (categoryRoute.children ?? []).filter(isCategory).map((category) => {
              const path = `/${i18n.language}/${categoryRoute.path}/${category.path}`;
              return {
                label: category.handle?.title as string,
                linkComponent: getLinkTo(path),
                selected: location.pathname === path,
              };
            }),
          },
        ],
      }
    : undefined;

  return (
    menuSection &&
    hasChildren && (
      <PageNavigation menuSection={menuSection} collapsed={!lg} testId="category-navigation" itemClassname="mb-2" />
    )
  );
};
