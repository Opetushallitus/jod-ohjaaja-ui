import { MainLayout } from '@/components';
import { ContentList } from '@/components/ContentList/ContentList';
import { useCategoryContentListLoader } from '@/hooks/useCategoryContentListLoader';
import { LangCode } from '@/i18n/config';
import { useTranslation } from 'react-i18next';

/*
 *  This component is a placeholder for the CategoryContent page.
 *  It should be replaced with the actual implementation when we know how navigation and content should be displayed.
 */
const CategoryContent = () => {
  const { i18n } = useTranslation();
  const { contents, totalCount, hasMore, loadMore, isLoading } = useCategoryContentListLoader(
    undefined,
    2, //This should be changed to 6 when we have more articles
    i18n.language as LangCode,
  );
  return (
    <MainLayout navChildren={<div className="bg-todo">TODO: Navigation</div>}>
      <div>
        <ContentList
          contents={contents}
          totalCount={totalCount}
          hasMore={hasMore}
          loadMore={loadMore}
          isLoading={isLoading}
        />
      </div>
    </MainLayout>
  );
};

export default CategoryContent;
