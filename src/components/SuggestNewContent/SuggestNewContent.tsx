import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { FeatureCard } from '../FeatureCard/FeatureCard';

export const SuggestNewContent = () => {
  const { t } = useTranslation();
  return (
    <FeatureCard
      to="/"
      linkComponent={Link}
      level="h2"
      title={t('suggest-new-content-for-the-service')}
      content={t('suggest-new-content-for-the-service-content')}
      backgroundColor="#EBB8E1"
      data-testid="suggest-new-content-card"
    />
  );
};
