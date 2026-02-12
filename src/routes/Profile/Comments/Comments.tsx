import { CategoryList, EmptyStateWithCategoryLinks, MainLayout, SortMenu } from '@/components';
import { ProfileNavigation } from '@/components/MainLayout/ProfileNavigation';
import { SuggestNewContent } from '@/components/SuggestNewContent/SuggestNewContent';
import { getArticlesByErcs } from '@/services/cms-article-api';
import { getNavigationTreeItems } from '@/services/navigation-loader';
import { useAuthStore } from '@/stores/useAuthStore';
import { StructuredContent } from '@/types/cms-content';
import { isSort, Sort } from '@/types/sort';
import { groupArticlesByCategory, sortKommenttiArticles } from '@/utils/cms';
import { useMediaQueries } from '@jod/design-system';
import React from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { useLoaderData } from 'react-router';
import { LoaderData } from './loader';

const Comments = () => {
  const {
    t,
    i18n: { language },
  } = useTranslation();

  const { lg } = useMediaQueries();
  const [articlesByCategory, setArticlesByCategory] = React.useState<Record<string, StructuredContent[]> | null>(null);
  const user = useAuthStore((state) => state.user);
  const isLoggedIn = !!user;

  const { omatKommentit } = useLoaderData<LoaderData>();

  const [sort, setSort] = React.useState<Sort>('latest');

  const sortOptions = [
    { label: t('profile.comments.sort.a-z'), value: 'a-z' },
    { label: t('profile.comments.sort.z-a'), value: 'z-a' },
    { label: t('profile.comments.sort.latest'), value: 'latest' },
    { label: t('profile.comments.sort.oldest'), value: 'oldest' },
  ];

  React.useEffect(() => {
    const navigationTreeItems = getNavigationTreeItems().filter((item) => item.lng === language);

    const fetchArticles = async () => {
      const fetchedArticles = await getArticlesByErcs(omatKommentit.map((kommentti) => kommentti.artikkeliErc));
      if (fetchedArticles.items.length === 0) {
        setArticlesByCategory(null);
      } else {
        setArticlesByCategory(groupArticlesByCategory(fetchedArticles.items, navigationTreeItems));
      }
    };
    if (omatKommentit.length > 0) {
      fetchArticles();
    } else {
      setArticlesByCategory(null);
    }
  }, [omatKommentit, language]);

  const handleSelectSort = (value: string) => {
    if (isSort(value)) {
      setSort(value);
    }
  };

  const getSortedArticles = () => {
    if (!articlesByCategory) return {};

    return Object.fromEntries(
      Object.entries(articlesByCategory).map(([k, v]) => [k, sortKommenttiArticles(v, sort, omatKommentit)]),
    );
  };

  const visibleArticlesByCategory = getSortedArticles();

  return (
    <MainLayout navChildren={<ProfileNavigation />} asideChildren={lg && <SuggestNewContent />}>
      <div data-testid="favorites-route">
        <title>{t('profile.comments.title')}</title>
        <h1 className="text-heading-1-mobile lg:text-heading-1 mb-6" data-testid="favorites-title">
          {t('profile.comments.title')}
        </h1>
        <p className="text-body-lg mb-8" data-testid="favorites-description">
          <Trans i18nKey="profile.comments.description" />
        </p>
        {omatKommentit.length > 0 && (
          <div className="grid grid-cols-2 gap-5 mb-5">
            <p className="text-body-md col-span-2 lg:col-span-1" data-testid="favorites-count">
              {t('profile.comments.comment-count', { count: omatKommentit.length })}
            </p>
            {visibleArticlesByCategory && (
              <SortMenu
                label={t('profile.comments.sort.label')}
                sort={sort}
                onSortChange={handleSelectSort}
                options={sortOptions}
              />
            )}
          </div>
        )}
        <div data-testid="favorites-content">
          {omatKommentit.length > 0 ? (
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
            <EmptyStateWithCategoryLinks emptyStateText={t('profile.comments.no-comments')} testIdPrefix="comments" />
          )}
        </div>
        {!lg && <SuggestNewContent />}
      </div>
    </MainLayout>
  );
};

export default Comments;
