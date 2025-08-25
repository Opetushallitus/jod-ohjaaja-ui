import { useAppRoutes } from '@/hooks/useAppRoutes';
import { Accordion, useMediaQueries } from '@jod/design-system';
import { useTranslation } from 'react-i18next';
import { NavigationList } from './NavigationList';

export const ProfileNavigation = () => {
  const {
    t,
    i18n: { language },
  } = useTranslation();
  const { lg } = useMediaQueries();
  const { profileRoutes } = useAppRoutes();
  const navigationListItem = {
    id: 'index',
    title: t('profile.index'),
    children: profileRoutes.map((route) => ({
      id: route.path,
      title: route.name,
      path: `/${language}/${t('slugs.profile.index')}/${route.path}`,
    })),
  };

  return (
    <div className="bg-secondary-2-25 rounded-md py-3 lg:py-6 px-[20px]" data-testid="profile-navigation">
      {lg ? (
        <NavigationList rootItem={navigationListItem} />
      ) : (
        <Accordion title={t('profile.index')} lang={language} initialState={false} data-testid="profile-accordion">
          <NavigationList rootItem={navigationListItem} />
        </Accordion>
      )}
    </div>
  );
};
