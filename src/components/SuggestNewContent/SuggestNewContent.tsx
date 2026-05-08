import { useTranslation } from 'react-i18next';

import { useModal } from '@/hooks/useModal';
import { useOhjaajaProfile } from '@/stores/useSessionManagerStore';
import { getLinkTo } from '@/utils/routeUtils';

import { FeatureCard } from '../FeatureCard/FeatureCard';
import { SuggestNewContentModal } from '../SuggestNewContentModal/SuggestNewContentModal';

export const SuggestNewContent = () => {
  const { t, i18n } = useTranslation();
  const { showModal } = useModal();
  const user = useOhjaajaProfile();
  const isLoggedIn = !!user;

  const handleOpenModal = () => {
    showModal(SuggestNewContentModal);
  };

  return isLoggedIn ? (
    <FeatureCard
      onClick={handleOpenModal}
      buttonOpensModal
      buttonText={t('suggest-new-content-for-the-service-button')}
      level="h2"
      title={t('suggest-new-content-for-the-service')}
      content={t('suggest-new-content-for-the-service-content')}
      backgroundColor="var(--ds-color-secondary-2-dark-2)"
      data-testid="suggest-new-content-card"
      hideIcon
    />
  ) : (
    <FeatureCard
      buttonText={t('profile.login-page.page-title')}
      level="h2"
      title={t('suggest-new-content-for-the-service')}
      content={t('suggest-new-content-for-the-service-content')}
      backgroundColor="var(--ds-color-secondary-2-dark-2)"
      data-testid="suggest-new-content-card-anonymous"
      linkComponent={getLinkTo(`/${i18n.language}/${t('slugs.profile.login')}`)}
    />
  );
};
