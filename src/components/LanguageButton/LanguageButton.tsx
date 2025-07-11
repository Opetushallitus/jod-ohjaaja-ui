import { langLabels } from '@/i18n/config';
import { JodCaretDown, JodCaretUp, JodLanguage } from '@jod/design-system/icons';
import { useTranslation } from 'react-i18next';
import { LanguageMenu } from '../LanguageMenu/LanguageMenu';

interface LanguageButtonProps {
  onClick: () => void;
  langMenuOpen: boolean;
  menuRef: React.RefObject<HTMLDivElement | null>;
  onMenuBlur: (event: React.FocusEvent<HTMLDivElement>) => void;
  onMenuClick: () => void;
}

export const LanguageButton = ({ onClick, langMenuOpen, menuRef, onMenuBlur, onMenuClick }: LanguageButtonProps) => {
  const {
    i18n: { language: languageKey },
  } = useTranslation();
  return (
    <div className="relative">
      <button onClick={onClick} className="flex gap-2 justify-center items-center select-none cursor-pointer">
        <span className="size-7 flex justify-center items-center">
          <JodLanguage />
        </span>
        <span className="py-3 whitespace-nowrap">{langLabels[languageKey as keyof typeof langLabels]}</span>
        <span className="size-7 flex justify-center items-center">
          {langMenuOpen ? <JodCaretUp /> : <JodCaretDown />}
        </span>
      </button>
      {langMenuOpen && (
        <div ref={menuRef} onBlur={onMenuBlur} className="absolute right-0 translate-y-8">
          <LanguageMenu onClick={onMenuClick} />
        </div>
      )}
    </div>
  );
};
