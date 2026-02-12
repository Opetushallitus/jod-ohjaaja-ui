import { CategoryList, EmptyStateWithCategoryLinks, MainLayout, SortMenu } from '@/components';
import { ButtonMenu } from '@/components/ButtonMenu/ButtonMenu';
import { ProfileNavigation } from '@/components/MainLayout/ProfileNavigation';
import { SuggestNewContent } from '@/components/SuggestNewContent/SuggestNewContent';
import TagFilterList from '@/routes/Search/TagFilterList';
import { getArticlesByErcs } from '@/services/cms-article-api';
import { getNavigationTreeItems } from '@/services/navigation-loader';
import { useAuthStore } from '@/stores/useAuthStore';
import { useSuosikitStore } from '@/stores/useSuosikitStore';
import { type Category, type StructuredContent } from '@/types/cms-content';
import { isSort, type Sort } from '@/types/sort';
import { filterArticlesByTags, getKeywords, groupArticlesByCategory, sortSuosikkiArticles } from '@/utils/cms';
import { useMediaQueries } from '@jod/design-system';
import { JodSettings } from '@jod/design-system/icons';

import React from 'react';
import { useTranslation } from 'react-i18next';

import { useShallow } from 'zustand/react/shallow';

const Favorites = () => {
  const {
    t,
    i18n: { language },
  } = useTranslation();

  const { lg } = useMediaQueries();
  const [articlesByCategory, setArticlesByCategory] = React.useState<Record<string, StructuredContent[]> | null>(null);
  const [selectedTagIds, setSelectedTagIds] = React.useState<string[]>([]);
  const user = useAuthStore((state) => state.user);
  const isLoggedIn = !!user;

  const [sort, setSort] = React.useState<Sort>('a-z');
  const suosikit = useSuosikitStore(useShallow((state) => state.suosikit));

  const sortOptions = [
    { label: t('profile.favorites.sort.a-z'), value: 'a-z' },
    { label: t('profile.favorites.sort.z-a'), value: 'z-a' },
    { label: t('profile.favorites.sort.latest'), value: 'latest' },
    { label: t('profile.favorites.sort.oldest'), value: 'oldest' },
    { label: t('profile.favorites.sort.latest-added'), value: 'latest-added-to-favorites' },
  ];

  React.useEffect(() => {
    const navigationTreeItems = getNavigationTreeItems().filter((item) => item.lng === language);

    const fetchArticles = async () => {
      const fetchedArticles = await getArticlesByErcs(suosikit.map((suosikki) => suosikki.artikkeliErc));
      if (fetchedArticles.items.length === 0) {
        setArticlesByCategory(null);
      } else {
        setArticlesByCategory(groupArticlesByCategory(fetchedArticles.items, navigationTreeItems));
      }
    };
    if (suosikit.length > 0) {
      fetchArticles();
    } else {
      setArticlesByCategory(null);
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
    if (!articlesByCategory) return {};
    if (selectedTagIds.length === 0)
      return Object.fromEntries(
        Object.entries(articlesByCategory).map(([k, v]) => [k, sortSuosikkiArticles(v, sort, suosikit)]),
      );

    return Object.entries(articlesByCategory).reduce(
      (acc, [category, articles]) => {
        const filteredArticles = filterArticlesByTags(articles, selectedTagIds);
        if (filteredArticles.length > 0) {
          acc[category] = sortSuosikkiArticles(filteredArticles, sort, suosikit);
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
              <div className="bg-white p-6 rounded-lg" data-testid="favorites-tag-sidebar">
                <span className="text-body-sm mb-4 mt-2 flex" data-testid="favorites-tag-title" id="favorites-tag-list">
                  {t('search.tag-list.title')}
                </span>
                <TagFilterList
                  tags={tags ?? []}
                  selectedTagIds={selectedTagIds}
                  onTagSelectionChange={handleTagSelectionChange}
                  ariaLabelId="favorites-tag-list"
                  emptyText={t('profile.favorites.no-tags')}
                />
              </div>
            }
            <SuggestNewContent />
          </>
        )
      }
    >
      <div data-testid="favorites-route">
        <title>{t('profile.favorites.title')}</title>
        <h1 className="text-heading-1-mobile lg:text-heading-1 mb-6" data-testid="favorites-title">
          {t('profile.favorites.title')}
        </h1>
        <p className="text-body-lg mb-8" data-testid="favorites-description">
          {t('profile.favorites.description')}
        </p>
        {suosikit.length > 0 && (
          <div className="grid grid-cols-2 gap-5 mb-5">
            <p className="text-body-md col-span-2 lg:col-span-1" data-testid="favorites-count">
              {t('profile.favorites.favorite-count', { count: suosikit.length })}
            </p>
            {visibleArticlesByCategory && (
              <SortMenu
                label={t('profile.favorites.sort.label')}
                sort={sort}
                onSortChange={handleSelectSort}
                options={sortOptions}
              />
            )}
            {!lg && visibleArticlesByCategory && (
              <ButtonMenu
                triggerIcon={<JodSettings size={18} />}
                triggerLabel={t('profile.favorites.filter')}
                className="justify-items-end relative"
                menuClassName="right-0"
                data-testid="favorites-filter-menu"
              >
                <span className="sr-only" id="favorites-tag-list">
                  {t('search.tag-list.title')}
                </span>
                <TagFilterList
                  tags={tags ?? []}
                  selectedTagIds={selectedTagIds}
                  onTagSelectionChange={handleTagSelectionChange}
                  mode="accordion"
                  ariaLabelId="favorites-tag-list"
                />
              </ButtonMenu>
            )}
          </div>
        )}
        <div data-testid="favorites-content">
          {suosikit.length > 0 ? (
            Object.entries(visibleArticlesByCategory).map(([category, articles]) => (
              <CategoryList
                key={category}
                category={category}
                articles={articles}
                isLoggedIn={isLoggedIn}
                data-testid={`favorites-category-${category}`}
              />
            ))
          ) : (
            <EmptyStateWithCategoryLinks
              emptyStateText={t('profile.favorites.no-favorites')}
              testIdPrefix="favorites"
            />
          )}
        </div>
        {!lg && <SuggestNewContent />}
      </div>
    </MainLayout>
  );
};

export default Favorites;
