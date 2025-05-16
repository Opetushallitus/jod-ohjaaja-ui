import { IconButton, tidyClasses } from '@jod/design-system';
import React from 'react';
import { MdClose } from 'react-icons/md';

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
    <div className={tidyClasses(`relative ${className}`)}>
      <IconButton icon={triggerIcon} label={triggerLabel} onClick={() => setMenuOpen(!menuOpen)} />
      {menuOpen && (
        <div
          className={tidyClasses(
            `bg-bg-gray-2 p-5 rounded absolute z-50 -translate-y-7 min-w-[250px] ${menuClassName}`,
          )}
          role="menu"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Escape' && setMenuOpen(false)}
          ref={menuRef}
        >
          <div className="flex flex-row items-center justify-between mb-5">
            <p className="text-body-sm tex">{triggerLabel}</p>
            <button onClick={() => setMenuOpen(false)} className="cursor-pointer">
              <MdClose size={24} className="text-secondary-gray" />
            </button>
          </div>
          {children}
        </div>
      )}
    </div>
  );
};
