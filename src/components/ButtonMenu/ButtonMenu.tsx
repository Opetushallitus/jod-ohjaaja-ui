import { tidyClasses } from '@jod/design-system';
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
    <div className={tidyClasses(`relative ${className}`)} data-testid="button-menu">
      <button
        type="button"
        onClick={handleOpenMenu}
        className="group flex flex-row justify-center items-center gap-4 cursor-pointer"
        id={buttonId}
        aria-expanded={menuOpen}
        aria-controls={menuId}
        data-testid="button-menu-trigger"
        ref={buttonRef}
      >
        <span className="text-button-md group-hover:text-accent group-hover:underline"> {triggerLabel}</span>
        <div aria-hidden="true" className="bg-white rounded-full flex items-center justify-center select-none size-7">
          {triggerIcon}
        </div>
      </button>
      {menuOpen && (
        <div
          className={tidyClasses(
            `bg-bg-gray-2 p-5 rounded absolute z-50 -translate-y-7 min-w-[250px] ${menuClassName}`,
          )}
          id={menuId}
          role="region"
          ref={menuRef}
          aria-labelledby={buttonId}
          data-testid="button-menu-popup"
        >
          <div className="flex flex-row items-center justify-between mb-5">
            <p className="text-body-sm tex" aria-hidden>
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
