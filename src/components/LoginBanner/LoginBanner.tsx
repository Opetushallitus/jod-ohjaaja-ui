import { getLinkTo } from '@/utils/routeUtils';
import { useTranslation } from 'react-i18next';
import { FeatureCard } from '../FeatureCard/FeatureCard';

export const LoginBanner = () => {
  const {
    t,
    i18n: { language },
  } = useTranslation();
  return (
    <div className="col-span-3 lg:col-span-2">
      <FeatureCard
        linkComponent={getLinkTo(`/${language}/${t('slugs.profile.login')}`)}
        buttonText={t('log-in-to-the-service-button')}
        level="h2"
        title={t('log-in-to-the-service-title')}
        content={t('log-in-to-the-service-content')}
        backgroundColor="var(--ds-color-secondary-2-dark)"
        data-testid="login-banner-card"
      />
    </div>
  );
};
