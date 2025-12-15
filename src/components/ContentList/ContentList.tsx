import { StructuredContent } from '@/types/cms-content';
import { Sort } from '@/types/sort';
import { Button, RadioButton, RadioButtonGroup, Spinner } from '@jod/design-system';
import { JodSort } from '@jod/design-system/icons';
import { useTranslation } from 'react-i18next';
import { ArticleCard } from '../ArticleCard/ArticleCard';
import { ButtonMenu } from '../ButtonMenu/ButtonMenu';

interface ContentListProps {
  contents: StructuredContent[];
  totalCount: number;
  hasMore: boolean;
  isLoading: boolean;
  isLoggedIn: boolean;
  loadMore: () => void;
  sort: Omit<Sort, 'latest-added-to-favorites'>;
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
  return (
    <div data-testid="content-list">
      <div className="mb-3 sm:mb-5 flex flex-row justify-between items-center">
        <div className="mb-3 sm:mb-5 text-heading-2-mobile sm:text-heading-2" data-testid="content-list-count">
          {t('content-list.article-count', { count: totalCount })}
        </div>
        <ButtonMenu
          triggerIcon={<JodSort size={18} />}
          triggerLabel={t('profile.favorites.sort.label')}
          className="justify-items-start lg:justify-items-end relative"
          menuClassName="right-0"
          data-testid="favorites-sort-menu"
        >
          <div className="bg-bg-gray-2 px-6 pb-3 pt-0 rounded">
            <RadioButtonGroup
              label={t('profile.favorites.sort.label')}
              value={sort.toString()}
              onChange={handleSelectSort}
              hideLabel
            >
              <RadioButton label={t('profile.favorites.sort.a-z')} value="a-z" data-testid="favorites-sort-a-z" />
              <RadioButton label={t('profile.favorites.sort.z-a')} value="z-a" data-testid="favorites-sort-z-a" />
              <RadioButton
                label={t('profile.favorites.sort.latest')}
                value="latest"
                data-testid="favorites-sort-latest"
              />
              <RadioButton
                label={t('profile.favorites.sort.oldest')}
                value="oldest"
                data-testid="favorites-sort-oldest"
              />
            </RadioButtonGroup>
          </div>
        </ButtonMenu>
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
      <div className="flex flex-row pt-4 justify-center" data-testid="content-list-footer">
        {hasMore && !isLoading && (
          <Button
            onClick={loadMore}
            label={t('content-list.show-more')}
            variant="white"
            serviceVariant="ohjaaja"
            data-testid="content-list-show-more"
          />
        )}
        {isLoading && <Spinner color="white" size={24} data-testid="content-list-loading" />}
      </div>
    </div>
  );
};
