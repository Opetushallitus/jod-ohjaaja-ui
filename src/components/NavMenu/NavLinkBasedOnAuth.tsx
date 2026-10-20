import { useTranslation } from 'react-i18next';
import { NavLink } from 'react-router';

/** The paths are already ASCII slugs, so only the slashes and other separators need replacing. */
const toTestId = (path: string) =>
  path
    .toLowerCase()
    .replaceAll(/[^a-z0-9]+/g, '-')
    .replaceAll(/(^-|-$)/g, '');

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

  const testId = `navlink-${shouldLogin ? 'login' : 'link'}-${toTestId(to)}`;

  return shouldLogin ? (
    <NavLink
      state={{ callbackURL: to }}
      to={`/${language}/${t('slugs.profile.login')}`}
      className={className}
      lang={language}
      onClick={onClose}
      data-testid={testId}
    >
      {children}
    </NavLink>
  ) : (
    <NavLink to={`/${language}/${to}`} className={className} lang={language} onClick={onClose} data-testid={testId}>
      {children}
    </NavLink>
  );
};
