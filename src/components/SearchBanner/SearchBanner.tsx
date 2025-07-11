import { getSearchUrl } from '@/utils/navigation';
import { Button, InputField, Spinner } from '@jod/design-system';
import { JodSearch } from '@jod/design-system/icons';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';

export const SearchBanner = () => {
  const {
    t,
    i18n: { language },
  } = useTranslation();
  const [searchValue, setSearchValue] = React.useState('');
  const [isSearching, setIsSearching] = React.useState(false);
  const navigate = useNavigate();

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (isSearching) return;
    setSearchValue(event.target.value);
  };

  const handleSearch = (e: React.FormEvent) => {
    if (isSearching) return;
    setIsSearching(true);
    e.preventDefault();
    navigate(getSearchUrl(t, language, [], searchValue));
  };
  return (
    <div className="bg-[#66CBD1]">
      <div className="mx-auto w-full max-w-[1140px] h-[48px] print:hidden grid lg:grid-cols-3 px-5">
        <form id="search" className="lg:col-start-3 flex items-center gap-4 justify-end" onSubmit={handleSearch}>
          <InputField
            placeholder={t('search.placeholder')}
            onChange={handleInputChange}
            value={searchValue}
            hideLabel={true}
            className="ds:py-3 ds:text-body-sm max-w-[224px]"
          />

          <Button
            label={t('search.button')}
            variant="white"
            form="search"
            iconSide="right"
            icon={isSearching ? <Spinner size={24} color="accent" /> : <JodSearch />}
            className="ds:text-button-sm"
          />
        </form>
      </div>
    </div>
  );
};
