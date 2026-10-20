import React from 'react';
import { useTranslation } from 'react-i18next';
import { useLoaderData, useNavigate } from 'react-router';

import { SearchBar, useMediaQueries } from '@jod/design-system';
import { JodSettings } from '@jod/design-system/icons';

import { MainLayout } from '@/components';
import { ButtonMenu } from '@/components/ButtonMenu/ButtonMenu';
import { SearchResults } from '@/components/SearchResults/SearchResults';
import { useTags } from '@/hooks/useTags';
import { type Category } from '@/types/cms-content';
import { getSearchUrl } from '@/utils/navigation';

import { LoaderData } from './loader';
import TagFilterList from './TagFilterList';

const Search = () => {
  const { lg } = useMediaQueries();
  const { data, search, tagIds } = useLoaderData<LoaderData>();
  const { tags, loading: tagsLoading } = useTags();
  const {
    t,
    i18n: { language },
  } = useTranslation();
  const navigate = useNavigate();
  const [searchState, setSearchState] = React.useState({ search, value: search });
  const searchValue = searchState.search === search ? searchState.value : search;
  const [submitError, setSubmitError] = React.useState<string | null>(null);

  const handleLoadPage = (pageNumber: number) => {
    void navigate(getSearchUrl(t, language, tagIds, search, pageNumber));
  };

  const handleSearch = (value: string) => {
    if (value.trim().length < 3) {
      setSubmitError(t('search.min-length', { count: 3 }));
      return;
    }
    setSubmitError(null);
    globalThis._paq?.push(['trackEvent', 'ohjaaja.Haku', 'Hakusana', value]);
    void navigate(getSearchUrl(t, language, tagIds, value));
  };

  const handleInputChange = (value: string) => {
    setSearchState({ search, value });
    setSubmitError(null);
  };

  const handleTagSelectionChange = (tag: Category) => {
    const selectedTagIds = tagIds?.includes(`${tag.id}`)
      ? tagIds.filter((id) => id !== `${tag.id}`)
      : [...(tagIds ?? []), `${tag.id}`];
    void navigate(getSearchUrl(t, language, selectedTagIds, searchValue));
  };

  const contents = data.items;
  const totalCount = data.totalCount;
  const currentPage = data.page;
  const pageSize = data.pageSize;

  return (
    <MainLayout
      asideChildren={
        lg &&
        !tagsLoading && (
          <div className="rounded-lg bg-white p-6" data-testid="search-tag-sidebar">
            <span className="mt-2 mb-4 flex text-body-sm" data-testid="search-tag-title" id="search-tag-list">
              {t('search.tag-list.title')}
            </span>
            <TagFilterList
              tags={tags}
              selectedTagIds={tagIds}
              ariaLabelId="search-tag-list"
              onTagSelectionChange={handleTagSelectionChange}
            />
          </div>
        )
      }
    >
      <div data-testid="search-route">
        <title>{t('search.title')}</title>
        <h1 className="mb-5 text-heading-1-mobile sm:text-heading-1" data-testid="search-title">
          {t('search.title')}
        </h1>
        <p className="mb-6 text-body-lg" data-testid="search-description">
          {t('search.description')}
        </p>
        <SearchBar
          id="search"
          className="mb-7"
          value={searchValue}
          onChange={handleInputChange}
          onSubmit={handleSearch}
          placeholder={t('search.placeholder')}
          searchLabel={t('search.button')}
          clearLabel={t('search.clear')}
          errorMessage={submitError ?? undefined}
          serviceVariant="ohjaaja"
          testId="search"
        />

        <SearchResults
          contents={contents}
          totalCount={totalCount}
          currentPage={currentPage}
          pageSize={pageSize}
          loadPage={handleLoadPage}
          filterMenu={
            !lg &&
            !tagsLoading && (
              <ButtonMenu
                triggerLabel={t('search.filter', { count: tagIds.length })}
                triggerIcon={<JodSettings size={18} />}
                menuClassName="right-0"
                data-testid="search-filter-menu"
              >
                <span className="sr-only" id="search-tag-list">
                  {t('search.tag-list.title')}
                </span>
                <TagFilterList
                  tags={tags}
                  selectedTagIds={tagIds}
                  ariaLabelId="search-tag-list"
                  onTagSelectionChange={handleTagSelectionChange}
                  mode="accordion"
                />
              </ButtonMenu>
            )
          }
        />
      </div>
    </MainLayout>
  );
};

export default Search;
