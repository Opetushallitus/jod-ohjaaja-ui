import { MainLayout } from '@/components';
import { ContentList } from '@/components/ContentList/ContentList';
import React from 'react';
import { useLoaderData } from 'react-router';
import { LoaderData } from './loader';

const VISIBLE_ITEM_COUNT = 6;

/*
 *  This component is a placeholder for the CategoryContent page.
 *  It should be replaced with the actual implementation when we know how navigation and content should be displayed.
 */
const CategoryContent = () => {
  const { data } = useLoaderData<LoaderData>();
  const [visibleItemCount, setVisibleItemCount] = React.useState(VISIBLE_ITEM_COUNT);

  const handleLoadMore = () => {
    setVisibleItemCount((prevCount) => prevCount + VISIBLE_ITEM_COUNT);
  };

  const contents = data.items.slice(0, visibleItemCount);
  const totalCount = data.totalCount;
  const hasMore = data.items.length > visibleItemCount;
  const isLoading = false;

  return (
    <MainLayout navChildren={<div className="bg-todo">TODO: Navigation</div>}>
      <div>
        <ContentList
          contents={contents}
          totalCount={totalCount}
          hasMore={hasMore}
          loadMore={handleLoadMore}
          isLoading={isLoading}
        />
      </div>
    </MainLayout>
  );
};

export default CategoryContent;
