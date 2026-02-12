import { GuidanceCard, MainLayout } from '@/components';
import { ContentList, ContentListSort } from '@/components/ContentList/ContentList';
import { CategoryNavigation } from '@/components/MainLayout/CategoryNavigation';
import { SuggestNewContent } from '@/components/SuggestNewContent/SuggestNewContent';
import { useCategoryRoute } from '@/hooks/useCategoryRoutes';
import { getCategoryContent } from '@/services/cms-article-api';
import { useAuthStore } from '@/stores/useAuthStore';
import { type StructuredContentPage } from '@/types/cms-content';
import { tidyClasses as tc } from '@jod/design-system';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useLoaderData } from 'react-router';
import { LoaderData } from './loader';

const VISIBLE_ITEM_COUNT = 10;

const CategoryListing = () => {
  const {
    i18n: { language },
  } = useTranslation();
  const { categoryId, navigationItemType } = useLoaderData<LoaderData>();
  const user = useAuthStore((state) => state.user);
  const isLoggedIn = !!user;
  const [visibleItemCount, setVisibleItemCount] = React.useState(VISIBLE_ITEM_COUNT);
  const [sortOrder, setSortOrder] = React.useState<ContentListSort>('latest');
  const [categoryContent, setCategoryContent] = React.useState<StructuredContentPage | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchCategoryContent = async () => {
      const content = await getCategoryContent(categoryId, sortOrder);
      setCategoryContent(content);
      setIsLoading(false);
    };
    setIsLoading(true);
    fetchCategoryContent();
  }, [categoryId, sortOrder, language]);

  React.useEffect(() => {
    setVisibleItemCount(VISIBLE_ITEM_COUNT);
  }, [categoryId, language]);

  const categoryRoute = useCategoryRoute(navigationItemType);
  const title = categoryRoute?.handle?.title;
  const description = categoryRoute?.handle?.description;

  const richTextClasses = tc([
    '[&_p]:my-5',
    '[&_p]:first:my-0',
    '[&_li]:my-2',
    '[&_li]:ml-6',
    '[&_li]:list-item',
    '[&_ul]:list-disc',
    '[&_ol]:list-decimal',
    '[&_strong]:font-bold',
    '[&_img]:inline',
    '[&_h1]:text-heading-1',
    '[&_h2]:text-heading-2',
    '[&_h3]:text-heading-3',
    '[&_h4]:text-heading-4',
    'text-body-lg',
  ]);

  const handleLoadMore = () => {
    setVisibleItemCount((prevCount) => prevCount + VISIBLE_ITEM_COUNT);
  };

  const contents = categoryContent?.items.slice(0, visibleItemCount) ?? [];
  const totalCount = categoryContent?.totalCount ?? 0;
  const hasMore = (categoryContent?.items.length ?? 0) > visibleItemCount;

  return (
    <MainLayout
      navChildren={<CategoryNavigation />}
      featuredContentChildren={
        <>
          <GuidanceCard />
          <SuggestNewContent />
        </>
      }
    >
      <title>{title}</title>
      <div data-testid="category-listing-route">
        <section
          className="col-span-3 lg:row-start-2 lg:col-start-1 lg:col-span-2 print:col-span-3"
          data-testid="category-listing-header"
        >
          {title && (
            <h1 className="text-heading-1-mobile sm:text-heading-1 mb-5" data-testid="category-listing-title">
              {title}
            </h1>
          )}
          {description && (
            <div
              className={richTextClasses}
              dangerouslySetInnerHTML={{ __html: description }}
              data-testid="category-listing-description"
            />
          )}
        </section>
        <section className="my-6" data-testid="category-listing-content">
          <ContentList
            contents={contents}
            totalCount={totalCount}
            hasMore={hasMore}
            loadMore={handleLoadMore}
            isLoading={isLoading}
            isLoggedIn={isLoggedIn}
            sort={sortOrder}
            handleSelectSort={(value) => setSortOrder(value as ContentListSort)}
          />
        </section>
      </div>
    </MainLayout>
  );
};

export default CategoryListing;
