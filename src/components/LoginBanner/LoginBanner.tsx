import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { FeatureCard } from '../FeatureCard/FeatureCard';

interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  to: string;
}

const LinkComponent = ({ to, children, ...rest }: LinkProps) => (
  <Link to={to} {...rest}>
    {children}
  </Link>
);

export const LoginBanner = () => {
  const {
    t,
    i18n: { language },
  } = useTranslation();
  return (
    <div className="col-span-3 lg:col-span-2">
      <FeatureCard
        to={`/${language}/${t('slugs.profile.login')}`}
        linkComponent={LinkComponent}
        level="h2"
        title={t('log-in-to-the-service')}
        content={t('log-in-to-the-service-content')}
        backgroundColor="#66CBD1"
        data-testid="login-banner-card"
      />
    </div>
  );
};
