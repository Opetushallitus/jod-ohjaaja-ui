import { useAppRoutes } from '@/hooks/useAppRoutes';
import { getLinkTo } from '@/utils/routeUtils';
import { type MenuSection, PageNavigation, useMediaQueries } from '@jod/design-system';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router';

export const ProfileNavigation = () => {
  const {
    t,
    i18n: { language },
  } = useTranslation();
  const location = useLocation();
  const { lg } = useMediaQueries();
  const { profileRoutes } = useAppRoutes();

  const menuSection: MenuSection = {
    title: t('in-this-section'),
    linkItems: [
      {
        label: t('profile.index'),
        linkComponent: getLinkTo(`/${language}/${t('slugs.profile.index')}/${t('slugs.profile.front')}`),
        selected: location.pathname === `/${language}/${t('slugs.profile.index')}/${t('slugs.profile.front')}`,
        collapsed: false,
        childItems: profileRoutes.map((route) => ({
          label: route.name,
          selected: location.pathname.includes(`/${route.path}`),
          linkComponent: getLinkTo(`/${language}/${t('slugs.profile.index')}/${route.path}`),
        })),
      },
    ],
  };

  return <PageNavigation menuSection={menuSection} collapsed={!lg} testId="profile-navigation" itemClassname="mb-2" />;
};
