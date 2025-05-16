import { IconButton, tidyClasses } from '@jod/design-system';
import React from 'react';

interface ButtonMenuProps {
  triggerIcon: React.ReactNode;
  triggerLabel: string;
  children: React.ReactNode;
  className?: string;
  menuClassName?: string;
}

export const ButtonMenu = ({ triggerIcon, triggerLabel, children, className, menuClassName }: ButtonMenuProps) => {
  const [menuOpen, setMenuOpen] = React.useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);

  const handleClickOutside = (event: MouseEvent) => {
    if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
      setMenuOpen(false);
    }
  };

  React.useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [menuRef]);

  return (
    <div className={className}>
      <IconButton icon={triggerIcon} label={triggerLabel} onClick={() => setMenuOpen(!menuOpen)} />
      {menuOpen && (
        <div
          className={tidyClasses(`absolute translate-y-3 z-50 ${menuClassName}`)}
          role="menu"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Escape' && setMenuOpen(false)}
          ref={menuRef}
        >
          {children}
        </div>
      )}
    </div>
  );
};
