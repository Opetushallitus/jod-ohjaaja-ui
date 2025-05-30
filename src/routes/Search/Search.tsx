import { MainLayout } from '@/components';
import { ButtonMenu } from '@/components/ButtonMenu/ButtonMenu';
import { SearchResults } from '@/components/SearchResults/SearchResults';
import { useTags } from '@/hooks/useTags';
import { type Category } from '@/types/cms-content';
import { getSearchUrl } from '@/utils/navigation';
import { Button, InputField, useMediaQueries } from '@jod/design-system';
import React, { type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { MdSearch, MdTune } from 'react-icons/md';
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

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
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
      hideSearch
      navChildren={
        lg &&
        !tagsLoading && (
          <div className="bg-bg-gray-2 p-6 rounded">
            <h3 className="text-heading-3-mobile sm:text-heading-3 mb-4">{t('search.tag-list.title')}</h3>
            <TagFilterList tags={tags} selectedTagIds={tagIds} onTagSelectionChange={handleTagSelectionChange} />
          </div>
        )
      }
    >
      <div>
        <h1 className="text-heading-1-mobile sm:text-heading-1 mb-5">{t('search.title')}</h1>
        <p className="text-body-lg mb-6">{t('search.description')}</p>
        <form id="search" className="mb-8 flex flex-row" onSubmit={handleSearch}>
          <InputField
            placeholder={t('search.placeholder')}
            onChange={handleInputChange}
            value={searchValue}
            hideLabel={true}
            className="w-full mr-4"
          />

          <Button
            label={t('search.button')}
            variant="accent"
            form="search"
            iconSide="right"
            icon={<MdSearch size={24} />}
          />
        </form>

        <SearchResults
          contents={contents}
          totalCount={totalCount}
          currentPage={currentPage}
          pageSize={pageSize}
          loadPage={handleLoadPage}
          filterMenu={
            !lg &&
            !tagsLoading &&
            totalCount > 0 && (
              <ButtonMenu
                className=""
                triggerLabel={t('search.filter')}
                triggerIcon={<MdTune size={18} />}
                menuClassName="right-0"
              >
                <TagFilterList
                  tags={tags}
                  selectedTagIds={tagIds}
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
