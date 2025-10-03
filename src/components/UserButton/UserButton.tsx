import { useMenuClickHandler } from '@/hooks/useMenuClickHandler';
import { useAuthStore } from '@/stores/useAuthStore';
import { PopupList, PopupListItem, useMediaQueries } from '@jod/design-system';
import { JodCaretDown, JodCaretUp, JodUser } from '@jod/design-system/icons';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link, NavLink } from 'react-router';

interface UserButtonProps {
  onLogout: () => void;
  onClick?: () => void;
}

export const UserButton = ({ onLogout, onClick }: UserButtonProps) => {
  const {
    t,
    i18n: { language },
  } = useTranslation();

  const { sm } = useMediaQueries();

  const user = useAuthStore((state) => state.user);

  const [userMenuOpen, setUserMenuOpen] = React.useState(false);
  const userMenuButtonRef = React.useRef<HTMLButtonElement>(null);
  const userMenuRef = useMenuClickHandler(() => setUserMenuOpen(false), userMenuButtonRef);

  const userMenuProfileFrontUrl = t('slugs.profile.index');

  // Highlight menu element when active
  const getActiveClassNames = ({ isActive }: { isActive: boolean }) => (isActive ? 'bg-secondary-1-50 rounded-sm' : '');

  const caret = sm ? <>{userMenuOpen ? <JodCaretUp size={20} /> : <JodCaretDown size={20} />}</> : null;

  return user ? (
    <div className="relative" data-testid="user-button">
      <button
        ref={userMenuButtonRef}
        onClick={() => setUserMenuOpen(!userMenuOpen)}
        className="flex flex-col md:flex-row justify-center items-center select-none cursor-pointer gap-2 md:gap-3"
        data-testid="user-button-trigger"
      >
        <JodUser className="mx-auto" />
        <span className="whitespace-nowrap md:text-[14px] sm:text-[12px] text-[10px]">{user.etunimi}</span>
        {caret}
      </button>
      {userMenuOpen && (
        <div
          ref={userMenuRef}
          className="z-60 absolute right-0 min-w-max translate-y-8 transform"
          data-testid="user-menu"
        >
          <PopupList classNames="gap-2">
            <NavLink
              to={userMenuProfileFrontUrl}
              onClick={() => setUserMenuOpen(false)}
              className={(props) => `w-full ${getActiveClassNames(props)}`.trim()}
              data-testid="user-menu-profile"
            >
              <PopupListItem>{t('profile.index')}</PopupListItem>
            </NavLink>
            <button type="button" onClick={onLogout} className="cursor-pointer w-full" data-testid="user-menu-logout">
              <PopupListItem classNames="w-full">{t('logout')}</PopupListItem>
            </button>
          </PopupList>
        </div>
      )}
    </div>
  ) : (
    <Link
      to={`/${language}/${t('slugs.profile.login')}`}
      className="flex flex-col md:flex-row gap-2 md:gap-3 justify-center items-center select-none cursor-pointer"
      onClick={() => {
        if (onClick) {
          onClick();
        }
      }}
      data-testid="user-login-link"
    >
      <JodUser className="mx-auto" />
      <span className="whitespace-nowrap md:text-[14px] sm:text-[12px] text-[10px]">{t('login')}</span>
    </Link>
  );
};
