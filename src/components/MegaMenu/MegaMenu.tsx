import { LanguageButton, LanguageMenu } from '@/components';
import { useMediaQueries } from '@jod/design-system';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { MdClose, MdKeyboardBackspace, MdOutlineCancel } from 'react-icons/md';
export { LanguageButton, UserButton } from '@/components';

interface MegaMenuProps {
  onClose: () => void;
  onLanguageClick: () => void;
}

export const MegaMenu = ({ onClose, onLanguageClick }: MegaMenuProps) => {
  const { sm } = useMediaQueries();
  const { t } = useTranslation();
  const [megaMenuState, setMegaMenuState] = React.useState<'main' | 'lang'>('main');

  const onLanguageButtonClick = () => {
    setMegaMenuState('lang');
  };

  const doClose = () => {
    setMegaMenuState('main');
    onClose();
  };

  return (
    <div className="fixed top-0 sm:top-11 left-0 right-0 m-auto max-w-[1092px] bg-white shadow-border rounded-b-lg overflow-hidden">
      <ul className="flex flex-row justify-end items-center px-5 pt-3 sm:pt-5 pb-3 sm:pb-0">
        {!sm && megaMenuState === 'main' && (
          <>
            <li>
              <LanguageButton onClick={onLanguageButtonClick} />
            </li>
          </>
        )}
        {megaMenuState === 'main' && (
          <li>
            <button aria-label={t('close-menu')} onClick={doClose} className="cursor-pointer flex items-center ml-5">
              <span aria-hidden className={`text-black sm:text-secondary-gray p-3 sm:p-0`}>
                {sm ? <MdOutlineCancel size={32} /> : <MdClose size={32} />}
              </span>
            </button>
          </li>
        )}
      </ul>

      <div className="overflow-y-auto max-h-[calc(100vh-172px)] sm:max-h-[calc(100vh-56px)] overscroll-contain">
        <div className="px-5 sm:px-10 pb-7 grid grid-cols-1 sm:grid-cols-3 sm:gap-8">
          {(megaMenuState === 'main' || sm) && <></>}
          {megaMenuState === 'lang' && !sm && (
            <>
              <button
                type="button"
                className="cursor-pointer flex select-none mb-8"
                onClick={() => setMegaMenuState('main')}
                aria-label={t('return-menu')}
              >
                <MdKeyboardBackspace size={32} />
              </button>
              <LanguageMenu onClick={onLanguageClick} inline />
            </>
          )}
        </div>
      </div>
    </div>
  );
};
