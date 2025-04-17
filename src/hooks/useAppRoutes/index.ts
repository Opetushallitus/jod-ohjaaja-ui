import { useTranslation } from 'react-i18next';

export const useAppRoutes = () => {
  const { t } = useTranslation();

  const profileRoutes = [
    {
      name: t('profile.preferences.title'),
      path: t('slugs.profile.preferences'),
    },
  ];

  return { profileRoutes };
};
