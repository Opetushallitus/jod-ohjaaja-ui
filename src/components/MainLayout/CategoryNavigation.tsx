import { useCategoryRoute } from '@/hooks/useCategoryRoutes';
import { Accordion, useMediaQueries } from '@jod/design-system';
import { useTranslation } from 'react-i18next';
import { NavigationList } from './NavigationList';

export const CategoryNavigation = () => {
  const categoryRoute = useCategoryRoute();
  const { lg } = useMediaQueries();
  const { i18n, t } = useTranslation();

  const hasChildren = categoryRoute?.children?.some((category) => category.handle?.type.startsWith('Category'));

  return (
    categoryRoute &&
    hasChildren && (
      <div className="bg-secondary-2-25 rounded-md py-3 lg:py-6 px-[20px]">
        {lg ? (
          <NavigationList categoryRoute={categoryRoute} />
        ) : (
          <Accordion title={t('contents')} lang={i18n.language} initialState={false}>
            <NavigationList categoryRoute={categoryRoute} />
          </Accordion>
        )}
      </div>
    )
  );
};
