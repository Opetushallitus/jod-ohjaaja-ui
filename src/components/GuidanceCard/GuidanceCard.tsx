import { getLinkTo } from '@/utils/routeUtils';
import { JodOpenInNew } from '@jod/design-system/icons';
import { useTranslation } from 'react-i18next';
import { FeatureCard } from '../FeatureCard/FeatureCard';

const GuidanceCard = () => {
  const { t } = useTranslation();
  return (
    <FeatureCard
      linkComponent={getLinkTo(t('guidance-card.link-url'), {
        useAnchor: true,
        target: '_blank',
      })}
      level="h2"
      title={t('guidance-card.title')}
      content={t('guidance-card.description')}
      buttonText={t('guidance-card.link-text')}
      backgroundColor="var(--ds-color-secondary-2-dark)"
      icon={<JodOpenInNew ariaLabel={t('external-link')} />}
    />
  );
};

export default GuidanceCard;
