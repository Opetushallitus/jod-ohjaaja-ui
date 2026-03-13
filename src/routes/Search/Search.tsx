import { MainLayout } from '@/components';
import { ButtonMenu } from '@/components/ButtonMenu/ButtonMenu';
import { SearchResults } from '@/components/SearchResults/SearchResults';
import { useTags } from '@/hooks/useTags';
import { type Category } from '@/types/cms-content';
import { getSearchUrl } from '@/utils/navigation';
import { useMediaQueries } from '@jod/design-system';
import { JodClose, JodSearch, JodSettings } from '@jod/design-system/icons';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useLoaderData, useNavigate } from 'react-router';
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

  const handleLoadPage = (pageNumber: number) => {
    navigate(getSearchUrl(t, language, tagIds, search, pageNumber));
  };

  const handleSearch = (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    globalThis._paq?.push(['trackEvent', 'ohjaaja.Haku', 'Hakusana', searchValue]);
    navigate(getSearchUrl(t, language, tagIds, searchValue));
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(event.target.value);
  };

  React.useEffect(() => {
    setSearchValue(search);
  }, [search]);

  const handleTagSelectionChange = (tag: Category) => {
    const selectedTagIds = tagIds?.includes(`${tag.id}`)
      ? tagIds.filter((id) => id !== `${tag.id}`)
      : [...(tagIds ?? []), `${tag.id}`];
    navigate(getSearchUrl(t, language, selectedTagIds, searchValue));
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
          <div className="bg-white p-6 rounded-lg" data-testid="search-tag-sidebar">
            <span className="text-body-sm mb-4 mt-2 flex" data-testid="search-tag-title" id="search-tag-list">
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
        <h1 className="text-heading-1-mobile sm:text-heading-1 mb-5" data-testid="search-title">
          {t('search.title')}
        </h1>
        <p className="text-body-lg mb-6" data-testid="search-description">
          {t('search.description')}
        </p>
        <form id="search" className="mb-7 flex flex-row items-center" onSubmit={handleSearch} data-testid="search-form">
          <div className="flex items-center w-full rounded-md border border-border-form bg-white text-primary-gray p-2">
            <input
              type="text"
              name="search"
              className="font-arial grow w-full mr-3 placeholder:text-inactive-gray placeholder:text-body-md focus:outline-2 focus:outline-accent pl-3 outline-accent outline-offset-6 rounded-l-xs mx-1"
              placeholder={t('search.placeholder')}
              onChange={handleInputChange}
              value={searchValue}
              required
              minLength={3}
              maxLength={400}
              data-testid="search-input"
            />

            <button
              type="button"
              className="shrink rounded-sm bg-bg-gray focus:outline-2 focus:outline-accent cursor-pointer size-7 justify-center flex items-center outline-accent outline-offset-2 ml-2"
              onClick={() => {
                setSearchValue('');
              }}
              aria-label={t('search.clear')}
            >
              <JodClose className="text-inactive-gray" />
            </button>

            <button
              type="submit"
              className="flex items-center gap-2 shrink ml-3 rounded-sm h-7 bg-accent border-y px-3 text-white hover:bg-accent-dark focus:outline-2 focus:outline-accent cursor-pointer text-heading-4 text-[14px] outline-accent outline-offset-2"
            >
              <JodSearch className="text-white" />
              {t('search.button')}
            </button>
          </div>
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
