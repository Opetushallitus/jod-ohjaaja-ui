import { useLoginLink } from '@/hooks/useLoginLink';
import { sluggify } from '@/utils/string-utils';
import { useTranslation } from 'react-i18next';
import { NavLink } from 'react-router';

export const NavLinkBasedOnAuth = ({
  to,
  shouldLogin,
  className,
  children,
  onClose,
}: {
  to: string;
  shouldLogin: boolean;
  className: string;
  children: React.ReactNode;
  onClose: () => void;
}) => {
  const {
    t,
    i18n: { language },
  } = useTranslation();
  const loginPageUrl = useLoginLink({
    callbackURL: `/${language}/${to}`,
  });

  const testId = `navlink-${shouldLogin ? 'login' : 'link'}-${sluggify(to.replace(/\//g, '-'))}`;

  return shouldLogin ? (
    <a
      href={loginPageUrl}
      className={className}
      lang={language}
      aria-label={t('login')}
      onClick={onClose}
      data-testid={testId}
    >
      {children}
    </a>
  ) : (
    <NavLink to={`/${language}/${to}`} className={className} lang={language} onClick={onClose} data-testid={testId}>
      {children}
    </NavLink>
  );
};
