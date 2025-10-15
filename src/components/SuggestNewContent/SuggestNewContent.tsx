import React from 'react';
import { useTranslation } from 'react-i18next';
import { FeatureCard } from '../FeatureCard/FeatureCard';
import { SuggestNewContentModal } from '../SuggestNewContentModal/SuggestNewContentModal';

export const SuggestNewContent = () => {
  const { t } = useTranslation();
  const [showModal, setShowModal] = React.useState(false);
  return (
    <>
      <SuggestNewContentModal isOpen={showModal} onClose={() => setShowModal(false)} />
      <FeatureCard
        onClick={() => setShowModal(true)}
        buttonText={t('suggest-new-content-for-the-service-button')}
        level="h2"
        title={t('suggest-new-content-for-the-service')}
        content={t('suggest-new-content-for-the-service-content')}
        backgroundColor="var(--ds-color-secondary-2-dark-2)"
        data-testid="suggest-new-content-card"
        hideIcon
      />
    </>
  );
};
