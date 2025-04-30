import { MainLayout } from '@/components';
import { ContentList } from '@/components/ContentList/ContentList';
import { CategoryNavigation } from '@/components/MainLayout/CategoryNavigation';
import React from 'react';
import { useLoaderData } from 'react-router';
import { LoaderData } from './loader';

const VISIBLE_ITEM_COUNT = 6;

const CategoryListing = () => {
  const { data, isLoggedIn } = useLoaderData<LoaderData>();
  const [visibleItemCount, setVisibleItemCount] = React.useState(VISIBLE_ITEM_COUNT);

  const handleLoadMore = () => {
    setVisibleItemCount((prevCount) => prevCount + VISIBLE_ITEM_COUNT);
  };

  const contents = data.items.slice(0, visibleItemCount);
  const totalCount = data.totalCount;
  const hasMore = data.items.length > visibleItemCount;
  const isLoading = false;

  return (
    <MainLayout navChildren={<CategoryNavigation />}>
      <div>
        <ContentList
          contents={contents}
          totalCount={totalCount}
          hasMore={hasMore}
          loadMore={handleLoadMore}
          isLoading={isLoading}
          isLoggedIn={isLoggedIn}
        />
      </div>
    </MainLayout>
  );
};

export default CategoryListing;
