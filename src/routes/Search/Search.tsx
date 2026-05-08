import React from 'react';
import { useTranslation } from 'react-i18next';
import { useLoaderData, useNavigate } from 'react-router';

import { useMediaQueries } from '@jod/design-system';
import { JodClose, JodSearch, JodSettings } from '@jod/design-system/icons';

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
  const [searchValue, setSearchValue] = React.useState(search);
  const [submitError, setSubmitError] = React.useState<string | null>(null);

  const handleLoadPage = (pageNumber: number) => {
    void navigate(getSearchUrl(t, language, tagIds, search, pageNumber));
  };

  const handleSearch = (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (searchValue.trim().length < 3) {
      setSubmitError(t('search.min-length', { count: 3 }));
      return;
    }
    setSubmitError(null);
    globalThis._paq?.push(['trackEvent', 'ohjaaja.Haku', 'Hakusana', searchValue]);
    void navigate(getSearchUrl(t, language, tagIds, searchValue));
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(event.target.value);
    setSubmitError(null);
  };

  React.useEffect(() => {
    setSearchValue(search);
  }, [search]);

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
        <form id="search" className="mb-7" onSubmit={handleSearch} noValidate data-testid="search-form">
          <div className="flex flex-row items-center">
            <div className="flex w-full items-center rounded-md border border-border-form bg-white p-2 text-primary-gray">
              <input
                type="text"
                name="search"
                className="rounded-l-xs mx-1 mr-3 w-full grow pl-3 font-arial outline-offset-6 outline-accent placeholder:text-body-md placeholder:text-inactive-gray focus:outline-2 focus:outline-accent"
                placeholder={t('search.placeholder')}
                onChange={handleInputChange}
                value={searchValue}
                required
                maxLength={400}
                data-testid="search-input"
              />

              <button
                type="button"
                className="ml-2 flex size-7 shrink cursor-pointer items-center justify-center rounded-sm bg-bg-gray outline-offset-2 outline-accent focus:outline-2 focus:outline-accent"
                onClick={() => {
                  setSearchValue('');
                }}
                aria-label={t('search.clear')}
              >
                <JodClose className="text-inactive-gray" />
              </button>

              <button
                type="submit"
                className="hover:bg-accent-dark ml-3 flex h-7 shrink cursor-pointer items-center gap-2 rounded-sm border-y bg-accent px-3 text-heading-4 text-[0.875rem] text-white outline-offset-2 outline-accent focus:outline-2 focus:outline-accent"
              >
                <JodSearch className="text-white" />
                {t('search.button')}
              </button>
            </div>
          </div>
          {submitError && (
            <div className="mt-2 block font-arial text-form-error text-alert-text-2" role="alert">
              {submitError}
            </div>
          )}
        </form>

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
