import { useTranslation } from 'react-i18next';
import { useMatches, useNavigate } from 'react-router';

import { ServiceBarSearch } from '@jod/design-system';

import { getSearchUrl } from '@/utils/navigation';

interface HeaderSearchProps {
  searchInputVisible: boolean;
  setSearchInputVisible: (visible: boolean) => void;
}

export const HeaderSearch = ({ searchInputVisible, setSearchInputVisible }: HeaderSearchProps) => {
  const {
    t,
    i18n: { language },
  } = useTranslation();
  const navigate = useNavigate();
  const hideSearch = useMatches().some((m) => m.id.startsWith('search|'));

  const handleSearch = (value: string) => {
    const trimmedValue = value.trim();
    const hasValidSearch = trimmedValue.length >= 3;
    if (hasValidSearch) {
      globalThis._paq?.push(['trackEvent', 'ohjaaja.Haku', 'Hakusana', trimmedValue]);
    }
    void navigate(getSearchUrl(t, language, [], hasValidSearch ? trimmedValue : undefined));
  };

  return (
    !hideSearch && (
      <ServiceBarSearch
        expanded={searchInputVisible}
        onExpandedChange={setSearchInputVisible}
        onSubmit={handleSearch}
        placeholder={t('search.global-placeholder')}
        ariaLabel={t('search.label')}
        searchLabel={t('search.button')}
        testId="header-search"
      />
    )
  );
};
