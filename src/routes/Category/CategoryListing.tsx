import { MainLayout } from '@/components';
import { ContentList } from '@/components/ContentList/ContentList';
import { CategoryNavigation } from '@/components/MainLayout/CategoryNavigation';
import { useCategoryRoute } from '@/hooks/useCategoryRoutes';
import { tidyClasses as tc } from '@jod/design-system';
import React from 'react';
import { useLoaderData } from 'react-router';
import { LoaderData } from './loader';

const VISIBLE_ITEM_COUNT = 6;

const CategoryListing = () => {
  const { newestCategoryContent, isLoggedIn } = useLoaderData<LoaderData>();
  const [visibleItemCount, setVisibleItemCount] = React.useState(VISIBLE_ITEM_COUNT);
  const categoryRoute = useCategoryRoute('CategoryListing');
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

  const contents = newestCategoryContent.items.slice(0, visibleItemCount);
  const totalCount = newestCategoryContent.totalCount;
  const hasMore = newestCategoryContent.items.length > visibleItemCount;
  const isLoading = false;

  return (
    <MainLayout navChildren={<CategoryNavigation />}>
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
          />
        </section>
      </div>
    </MainLayout>
  );
};

export default CategoryListing;
