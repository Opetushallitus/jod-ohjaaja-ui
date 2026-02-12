import { tidyClasses as tc } from '@jod/design-system';
import { JodClose } from '@jod/design-system/icons';
import React from 'react';
import { useTranslation } from 'react-i18next';

interface ButtonMenuProps {
  triggerIcon: React.ReactNode;
  triggerLabel: string;
  children: React.ReactNode;
  className?: string;
  menuClassName?: string;
}

export const ButtonMenu = ({ triggerIcon, triggerLabel, children, className, menuClassName }: ButtonMenuProps) => {
  const { t } = useTranslation();
  const [menuOpen, setMenuOpen] = React.useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);
  const buttonRef = React.useRef<HTMLButtonElement>(null);
  const buttonId = React.useId();
  const menuId = React.useId();

  const handleCloseMenu = () => {
    setMenuOpen(false);
    buttonRef.current?.focus();
  };
  const handleOpenMenu = () => {
    setMenuOpen(true);
  };

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        handleCloseMenu();
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handleCloseMenu();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [menuRef]);

  return (
    <div className={tc(`relative ${className}`)} data-testid="button-menu">
      <button
        type="button"
        onClick={handleOpenMenu}
        className={tc(
          `cursor-pointer flex items-center gap-x-3 text-nowrap rounded-2xl px-5 py-3 text-button-sm hover:underline bg-bg-gray-2 ${className}`,
        )}
        id={buttonId}
        aria-label={triggerLabel}
        aria-expanded={menuOpen}
        aria-controls={menuId}
        data-testid="button-menu-trigger"
        ref={buttonRef}
      >
        {triggerIcon}
        {triggerLabel}
      </button>
      {menuOpen && (
        <div
          className={tc(`bg-bg-gray-2 p-6 rounded absolute z-50 top-0 w-max max-w-[350px] ${menuClassName}`)}
          id={menuId}
          role="region"
          ref={menuRef}
          aria-labelledby={buttonId}
          data-testid="button-menu-popup"
        >
          <div className="flex flex-row items-center justify-between mb-5">
            <p className="text-body-sm" aria-hidden>
              {triggerLabel}
            </p>
            <button
              onClick={handleCloseMenu}
              className="cursor-pointer"
              aria-label={t('button-menu.close')}
              data-testid="button-menu-close"
            >
              <JodClose className="text-secondary-gray" />
            </button>
          </div>
          {children}
        </div>
      )}
    </div>
  );
};
