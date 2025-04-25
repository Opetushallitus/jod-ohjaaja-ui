import { StructuredContent } from '@/types/cms-content';
import { Button, Spinner } from '@jod/design-system';
import { useTranslation } from 'react-i18next';
import { ArticleCard } from '../ArticleCard/ArticleCard';

interface ContentListProps {
  contents: StructuredContent[];
  totalCount: number;
  hasMore: boolean;
  isLoading: boolean;
  isLoggedIn: boolean;
  loadMore: () => void;
}

export const ContentList = ({ contents, totalCount, hasMore, isLoading, isLoggedIn, loadMore }: ContentListProps) => {
  const { t } = useTranslation();
  return (
    <div>
      <div className="mb-3 sm:mb-5 text-heading-2-mobile sm:text-heading-2">
        {t('content-list.article-count', { count: totalCount })}
      </div>
      <div className="flex flex-col flex-wrap gap-3 sm:gap-5">
        {contents.map((content) => (
          <ArticleCard key={content.id} article={content} variant="horizontal" isLoggedIn={isLoggedIn} />
        ))}
      </div>
      <div className="flex flex-row pt-4 justify-center">
        {hasMore && !isLoading && <Button onClick={loadMore} label={t('content-list.show-more')} variant="white" />}
        {isLoading && <Spinner color="white" size={24} />}
      </div>
    </div>
  );
};
