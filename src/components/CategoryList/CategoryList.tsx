import { ArticleCard } from '@/components/ArticleCard/ArticleCard';
import { StructuredContent } from '@/types/cms-content';
import { Button } from '@jod/design-system';
import React from 'react';
import { useTranslation } from 'react-i18next';

interface CategoryListProps {
  category: string;
  articles: StructuredContent[];
}

export const CategoryList: React.FC<CategoryListProps> = ({ category, articles }) => {
  const { t } = useTranslation();
  const [visibleCount, setVisibleCount] = React.useState(3);

  const handleShowMore = () => {
    setVisibleCount((prev) => prev + 3);
  };

  const visibleArticles = articles.slice(0, visibleCount);
  const showMoreButton = visibleCount < articles.length;

  return (
    <div className="mb-5">
      <h3 className="text-heading-3 mb-5">
        {category} ({articles.length})
      </h3>
      <div className="grid grid-cols-1 gap-3">
        {visibleArticles.map((article) => (
          <ArticleCard key={article.id} article={article} variant="horizontal" isLoggedIn={true} />
        ))}
      </div>
      <div className="flex flex-row pt-4 justify-center">
        {showMoreButton && <Button onClick={handleShowMore} label={t('content-list.show-more')} variant="white" />}
      </div>
    </div>
  );
};
