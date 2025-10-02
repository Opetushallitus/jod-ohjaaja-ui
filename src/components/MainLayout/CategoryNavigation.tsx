import { useCategoryRoute } from '@/hooks/useCategoryRoutes';
import { Accordion, useMediaQueries } from '@jod/design-system';
import { useTranslation } from 'react-i18next';
import { RouteObject } from 'react-router';
import { NavigationList } from './NavigationList';

export const CategoryNavigation = () => {
  const categoryRoute = useCategoryRoute('CategoryMain');
  const { lg } = useMediaQueries();
  const { i18n, t } = useTranslation();

  const isCategory = (category: RouteObject) =>
    category.handle?.type.startsWith('Category') || category.handle?.type.startsWith('StudyPrograms');

  const hasChildren = categoryRoute?.children?.some(isCategory);
  const navigationListItem =
    categoryRoute !== undefined
      ? {
          id: categoryRoute.id ?? '0',
          title: categoryRoute.handle.title as string,
          path: `/${i18n.language}/${categoryRoute?.path ?? ''}`,
          children: categoryRoute.children?.filter(isCategory).map((category) => ({
            id: category.id ?? '0',
            title: category.handle?.title as string,
            path: `/${i18n.language}/${categoryRoute?.path ?? ''}/${category?.path ?? ''}`,
          })),
        }
      : undefined;

  return (
    navigationListItem &&
    hasChildren && (
      <div className={`bg-white rounded-lg ${lg ? 'p-6' : 'p-4'}`} data-testid="category-navigation">
        {lg ? (
          <NavigationList rootItem={navigationListItem} menuTitle={t('in-this-section')} />
        ) : (
          <Accordion title={t('in-this-section')} initialState={false} data-testid="category-accordion">
            <NavigationList rootItem={navigationListItem} />
          </Accordion>
        )}
      </div>
    )
  );
};
