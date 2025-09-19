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

  const testId = `navlink-${shouldLogin ? 'login' : 'link'}-${sluggify(to.replace(/\//g, '-'))}`;

  return shouldLogin ? (
    <NavLink
      state={{ callbackURL: to }}
      to={`/${language}/${t('slugs.profile.login')}`}
      className={className}
      lang={language}
      onClick={onClose}
      data-testid={testId}
      aria-label={t('login')}
    >
      {children}
    </NavLink>
  ) : (
    <NavLink to={`/${language}/${to}`} className={className} lang={language} onClick={onClose} data-testid={testId}>
      {children}
    </NavLink>
  );
};
