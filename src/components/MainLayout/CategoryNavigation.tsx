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
      <div className="bg-secondary-2-25 rounded-md py-3 lg:py-6 px-[20px]">
        {lg ? (
          <NavigationList rootItem={navigationListItem} />
        ) : (
          <Accordion title={t('contents')} lang={i18n.language} initialState={false}>
            <NavigationList rootItem={navigationListItem} />
          </Accordion>
        )}
      </div>
    )
  );
};
