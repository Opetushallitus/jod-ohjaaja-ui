import { StructuredContent } from '@/types/cms-content';
import { Button, Spinner } from '@jod/design-system';
import { useTranslation } from 'react-i18next';
import { ArticleCard } from '../ArticleCard/ArticleCard';
import { SortMenu } from '../ButtonMenu/SortMenu';

export type ContentListSort = 'a-z' | 'z-a' | 'latest' | 'oldest';
interface ContentListProps {
  contents: StructuredContent[];
  totalCount: number;
  hasMore: boolean;
  isLoading: boolean;
  isLoggedIn: boolean;
  loadMore: () => void;
  sort: ContentListSort;
  handleSelectSort: (value: string) => void;
}

export const ContentList = ({
  contents,
  totalCount,
  hasMore,
  isLoading,
  isLoggedIn,
  loadMore,
  sort,
  handleSelectSort,
}: ContentListProps) => {
  const { t } = useTranslation();

  const sortOptions = [
    { label: t('profile.favorites.sort.a-z'), value: 'a-z' },
    { label: t('profile.favorites.sort.z-a'), value: 'z-a' },
    { label: t('profile.favorites.sort.latest'), value: 'latest' },
    { label: t('profile.favorites.sort.oldest'), value: 'oldest' },
  ];

  return (
    <div data-testid="content-list">
      <div className="mb-3 sm:mb-5 flex flex-row justify-between items-center">
        <div className="mb-3 sm:mb-5 text-heading-2-mobile sm:text-heading-2" data-testid="content-list-count">
          {t('content-list.article-count', { count: totalCount })}
        </div>
        <SortMenu
          label={t('profile.favorites.sort.label')}
          sort={sort}
          onSortChange={handleSelectSort}
          options={sortOptions}
          menuClassName="right-0"
        />
      </div>
      <div className="flex flex-col flex-wrap gap-3 sm:gap-5" data-testid="content-list-items">
        {contents.map((content) => (
          <ArticleCard
            key={content.id}
            article={content}
            variant="horizontal"
            isLoggedIn={isLoggedIn}
            data-testid={`content-list-item-${content.id}`}
          />
        ))}
      </div>
      <div className="flex flex-row pl-2 pt-7 justify-start" data-testid="content-list-footer">
        {hasMore && !isLoading && (
          <Button
            onClick={loadMore}
            label={t('content-list.show-more')}
            variant="plain"
            serviceVariant="ohjaaja"
            data-testid="content-list-show-more"
          />
        )}
        {isLoading && <Spinner color="white" size={24} data-testid="content-list-loading" />}
      </div>
    </div>
  );
};
