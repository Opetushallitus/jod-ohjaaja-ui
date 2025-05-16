import { MainLayout } from '@/components';
import { ButtonMenu } from '@/components/ButtonMenu/ButtonMenu';
import { CategoryList } from '@/components/CategoryList/CategoryList';
import { ProfileNavigation } from '@/components/MainLayout/ProfileNavigation';
import { SuggestNewContent } from '@/components/SuggestNewContent/SuggestNewContent';
import TagFilterList from '@/routes/Search/TagFilterList';
import { getArticles } from '@/services/cms-api';
import { getNavigationTreeItems } from '@/services/navigation-loader';
import { useSuosikitStore } from '@/stores/useSuosikitStore';
import { type Category, type StructuredContent } from '@/types/cms-content';
import { isSort, type Sort } from '@/types/sort';

import { filterArticlesByTags, getKeywords, groupArticlesByCategory, sortArticles } from '@/utils/cms';
import { getMainCategory, getMainCategoryPath } from '@/utils/navigation-paths';
import { RadioButton, RadioButtonGroup, useMediaQueries } from '@jod/design-system';

import React from 'react';
import { useTranslation } from 'react-i18next';

import { MdArrowForward, MdSort, MdTune } from 'react-icons/md';
import { Link } from 'react-router';
import { useShallow } from 'zustand/react/shallow';

const Favorites = () => {
  const {
    t,
    i18n: { language },
  } = useTranslation();

  const { lg } = useMediaQueries();
  const [articlesByCategory, setArticlesByCategory] = React.useState<Record<string, StructuredContent[]> | null>(null);
  const [selectedTagIds, setSelectedTagIds] = React.useState<string[]>([]);

  const [sort, setSort] = React.useState<Sort>('a-z');
  const suosikit = useSuosikitStore(useShallow((state) => state.suosikit));

  React.useEffect(() => {
    const navigationTreeItems = getNavigationTreeItems().filter((item) => item.lng === language);

    const fetchArticles = async () => {
      const fetchedArticles = await getArticles(suosikit.map((suosikki) => suosikki.artikkeliId));
      if (fetchedArticles.items.length === 0) {
        setArticlesByCategory(null);
      } else {
        setArticlesByCategory(groupArticlesByCategory(fetchedArticles.items, navigationTreeItems));
      }
    };
    if (suosikit.length > 0) {
      fetchArticles();
    }
  }, [suosikit, language]);

  const handleTagSelectionChange = (tag: Category) => {
    const updatedTagIds = selectedTagIds.includes(`${tag.id}`)
      ? selectedTagIds.filter((id) => id !== `${tag.id}`)
      : [...selectedTagIds, `${tag.id}`];
    setSelectedTagIds(updatedTagIds);
  };

  const handleSelectSort = (value: string) => {
    if (isSort(value)) {
      setSort(value);
    }
  };

  const getFilteredAndSortedArticles = () => {
    if (!articlesByCategory) return null;
    if (selectedTagIds.length === 0)
      return Object.fromEntries(
        Object.entries(articlesByCategory).map(([k, v]) => [k, sortArticles(v, sort, suosikit)]),
      );

    return Object.entries(articlesByCategory).reduce(
      (acc, [category, articles]) => {
        const filteredArticles = filterArticlesByTags(articles, selectedTagIds);
        if (filteredArticles.length > 0) {
          acc[category] = sortArticles(filteredArticles, sort, suosikit);
        }
        return acc;
      },
      {} as Record<string, StructuredContent[]>,
    );
  };

  const visibleArticlesByCategory = getFilteredAndSortedArticles();

  const tags = visibleArticlesByCategory
    ? Object.entries(visibleArticlesByCategory)
        .reduce((acc, [_, articles]) => {
          const categoryTags = articles.flatMap(getKeywords);
          acc.push(...categoryTags);
          return acc;
        }, [] as Category[])
        .filter((tag, index, self) => {
          //remove duplicates
          return index === self.findIndex((t) => t.id === tag.id);
        })
        .sort((a, b) => a.name.localeCompare(b.name))
    : null;

  return (
    <MainLayout
      navChildren={<ProfileNavigation />}
      asideChildren={
        lg && (
          <>
            {
              <div className="bg-bg-gray-2 p-6 rounded">
                <h3 className="text-heading-3-mobile sm:text-heading-3 mb-4">{t('search.tag-list.title')}</h3>
                <TagFilterList
                  tags={tags ?? []}
                  selectedTagIds={selectedTagIds}
                  onTagSelectionChange={handleTagSelectionChange}
                  emptyText={t('profile.favorites.no-tags')}
                />
              </div>
            }
            <SuggestNewContent />
          </>
        )
      }
    >
      <h1 className="text-heading-1 mb-5">{t('profile.favorites.title')}</h1>
      <p className="text-body-lg mb-5">{t('profile.favorites.description')}</p>
      <div className="grid grid-cols-2 gap-5 mb-5">
        <p className="text-body-md col-span-2 lg:col-span-1">
          {t('profile.favorites.favorite-count', { count: suosikit.length })}
        </p>
        {visibleArticlesByCategory && (
          <ButtonMenu
            triggerIcon={<MdSort size={18} />}
            triggerLabel={t('profile.favorites.sort.label')}
            className="justify-items-start lg:justify-items-end relative"
            menuClassName="left-0 lg:right-0"
          >
            <div className="bg-bg-gray-2 px-6 pb-3 pt-0 rounded">
              <RadioButtonGroup label="" value={sort} onChange={handleSelectSort}>
                <RadioButton label={t('profile.favorites.sort.a-z')} value="a-z" />
                <RadioButton label={t('profile.favorites.sort.z-a')} value="z-a" />
                <RadioButton label={t('profile.favorites.sort.latest')} value="latest" />
                <RadioButton label={t('profile.favorites.sort.oldest')} value="oldest" />
                <RadioButton label={t('profile.favorites.sort.latest-added')} value="latest-added-to-favorites" />
              </RadioButtonGroup>
            </div>
          </ButtonMenu>
        )}
        {!lg && visibleArticlesByCategory && (
          <ButtonMenu
            triggerIcon={<MdTune size={18} />}
            triggerLabel={t('profile.favorites.filter')}
            className="justify-items-end relative"
            menuClassName="right-0 "
          >
            <TagFilterList
              tags={tags ?? []}
              selectedTagIds={selectedTagIds}
              onTagSelectionChange={handleTagSelectionChange}
              mode="accordion"
            />
          </ButtonMenu>
        )}
      </div>
      <div>
        {visibleArticlesByCategory ? (
          Object.entries(visibleArticlesByCategory).map(([category, articles]) => (
            <CategoryList key={category} category={category} articles={articles} />
          ))
        ) : (
          <div className="flex flex-col gap-5">
            <p>{t('profile.favorites.no-favorites')}</p>

            <Link
              to={`/${language}/${getMainCategoryPath(language, 0)}`}
              className="flex items-center gap-2 text-accent text-button-md"
            >
              {getMainCategory(language, 0)?.title ?? ''} <MdArrowForward size={20} />
            </Link>

            <Link
              to={`/${language}/${getMainCategoryPath(language, 1)}`}
              className="flex items-center gap-2 text-accent text-button-md"
            >
              {getMainCategory(language, 1)?.title ?? ''} <MdArrowForward size={20} />
            </Link>

            <Link
              to={`/${language}/${getMainCategoryPath(language, 2)}`}
              className="flex items-center gap-2 text-accent text-button-md"
            >
              {getMainCategory(language, 2)?.title ?? ''} <MdArrowForward size={20} />
            </Link>
          </div>
        )}
      </div>
      {!lg && <SuggestNewContent />}
    </MainLayout>
  );
};

export default Favorites;
