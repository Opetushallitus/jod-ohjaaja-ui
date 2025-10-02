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
    path: `/${language}/${t('slugs.profile.index')}/${t('slugs.profile.front')}`,
    children: profileRoutes.map((route) => ({
      id: route.path,
      title: route.name,
      path: `/${language}/${t('slugs.profile.index')}/${route.path}`,
    })),
  };

  return (
    <div className={`bg-white rounded-lg ${lg ? 'p-6' : 'p-4'}`} data-testid="profile-navigation">
      {lg ? (
        <NavigationList rootItem={navigationListItem} menuTitle={t('in-this-section')} />
      ) : (
        <Accordion title={t('in-this-section')} initialState={false} data-testid="profile-accordion">
          <NavigationList rootItem={navigationListItem} />
        </Accordion>
      )}
    </div>
  );
};
