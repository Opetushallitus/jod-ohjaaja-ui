import React from 'react';
import { useTranslation } from 'react-i18next';

import { Button } from '@jod/design-system';

import { ArticleCard } from '@/components/ArticleCard/ArticleCard';
import { StructuredContent } from '@/types/cms-content';

interface CategoryListProps {
  category: string;
  articles: StructuredContent[];
  isLoggedIn: boolean;
  testId?: string;
}

export const CategoryList: React.FC<CategoryListProps> = ({ category, articles, isLoggedIn, testId }) => {
  const { t } = useTranslation();
  const [visibleCount, setVisibleCount] = React.useState(3);

  const handleShowMore = () => {
    setVisibleCount((prev) => prev + 3);
  };

  const visibleArticles = articles.slice(0, visibleCount);
  const showMoreButton = visibleCount < articles.length;

  const getTestId = (suffix: string) => (testId ? `${testId}-${suffix}` : suffix);

  return (
    <div className="mb-5" data-testid={getTestId('category-list')}>
      <h2 className="mb-5 text-heading-3" data-testid={getTestId('category-list-title')}>
        {category} ({articles.length})
      </h2>
      <div className="grid grid-cols-1 gap-3" data-testid={getTestId('category-list-items')}>
        {visibleArticles.map((article) => (
          <ArticleCard key={article.id} article={article} variant="horizontal" isLoggedIn={isLoggedIn} />
        ))}
      </div>
      <div className="flex flex-row justify-start pt-7 pl-2" data-testid={getTestId('category-list-footer')}>
        {showMoreButton && (
          <Button
            onClick={handleShowMore}
            label={t('content-list.show-more')}
            variant="plain"
            serviceVariant="ohjaaja"
            testId={getTestId('category-list-show-more')}
          />
        )}
      </div>
    </div>
  );
};
