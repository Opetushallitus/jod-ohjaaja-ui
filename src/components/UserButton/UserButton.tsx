import { components } from '@/api/schema';
import { useLoginLink } from '@/hooks/useLoginLink';
import { useMenuClickHandler } from '@/hooks/useMenuClickHandler';
import { PopupList, PopupListItem } from '@jod/design-system';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { MdExpandLess, MdExpandMore, MdPersonOutline } from 'react-icons/md';
import { NavLink, useLoaderData, useLocation } from 'react-router';

interface UserButtonProps {
  onLogout: () => void;
  onClick?: () => void;
}

export const UserButton = ({ onLogout, onClick }: UserButtonProps) => {
  const {
    t,
    i18n: { language },
  } = useTranslation();

  const data = useLoaderData() as components['schemas']['OhjaajaCsrfDto'] | null;
  const location = useLocation();

  const [userMenuOpen, setUserMenuOpen] = React.useState(false);
  const userMenuButtonRef = React.useRef<HTMLButtonElement>(null);
  const userMenuRef = useMenuClickHandler(() => setUserMenuOpen(false), userMenuButtonRef);

  const userMenuProfileFrontUrl = t('slugs.profile.index');

  // Highlight menu element when active
  const getActiveClassNames = ({ isActive }: { isActive: boolean }) => (isActive ? 'bg-secondary-1-50 rounded-sm' : '');

  const fullName = `${data?.etunimi} ${data?.sukunimi}`;

  const state = location.state;
  const loginLink = useLoginLink({
    callbackURL: state?.callbackURL ? `/${language}/${state?.callbackURL}` : `/${language}`,
  });

  return data?.csrf ? (
    <div className="relative">
      <button
        ref={userMenuButtonRef}
        onClick={() => setUserMenuOpen(!userMenuOpen)}
        className="flex gap-2 justify-center items-center select-none cursor-pointer"
      >
        <span className="size-7 flex justify-center items-center">
          <MdPersonOutline size={24} />
        </span>
        <span className="py-3 whitespace-nowrap">{fullName}</span>
        <span className="size-7 flex justify-center items-center">
          {userMenuOpen ? <MdExpandLess size={24} /> : <MdExpandMore size={24} />}
        </span>
      </button>
      {userMenuOpen && (
        <div ref={userMenuRef} className="absolute right-0 min-w-max translate-y-8 transform">
          <PopupList classNames="gap-2">
            <NavLink
              to={userMenuProfileFrontUrl}
              onClick={() => setUserMenuOpen(false)}
              className={(props) => `w-full ${getActiveClassNames(props)}`.trim()}
            >
              <PopupListItem>{t('profile.index')}</PopupListItem>
            </NavLink>
            <button type="button" onClick={onLogout} className="cursor-pointer w-full">
              <PopupListItem classNames="w-full">{t('logout')}</PopupListItem>
            </button>
          </PopupList>
        </div>
      )}
    </div>
  ) : (
    <a
      href={loginLink}
      className="flex gap-2 justify-center items-center select-none cursor-pointer"
      onClick={() => {
        if (onClick) {
          onClick();
        }
      }}
    >
      <span className="size-7 flex justify-center items-center">
        <MdPersonOutline size={24} />
      </span>
      <span className="py-3 pr-2 whitespace-nowrap">{t('login')}</span>
    </a>
  );
};
