import { useLoginLink } from '@/hooks/useLoginLink';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router';
import { FeatureCard } from '../FeatureCard/FeatureCard';

interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  to: string;
}

const Link = ({ to, children, ...rest }: LinkProps) => (
  <a href={to} {...rest}>
    {children}
  </a>
);

export const LoginBanner = () => {
  const {
    t,
    i18n: { language },
  } = useTranslation();
  const location = useLocation();
  const state = location.state;
  const loginLink = useLoginLink({
    callbackURL: state?.callbackURL ? `/${language}/${state?.callbackURL}` : `/${language}`,
  });

  return (
    <div className="col-span-3 lg:col-span-2">
      <FeatureCard
        to={loginLink}
        linkComponent={Link}
        level="h2"
        title={t('log-in-to-the-service')}
        content={t('log-in-to-the-service-content')}
        backgroundColor="#66CBD1"
        data-testid="login-banner-card"
      />
    </div>
  );
};
