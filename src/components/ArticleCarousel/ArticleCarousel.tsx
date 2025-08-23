import { useCardCarouselItems } from '@/hooks/useCardCarouselItems';
import { StructuredContent } from '@/types/cms-content';
import { CardCarousel, CardCarouselItem } from '@jod/design-system';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { ArticleCard } from '../ArticleCard/ArticleCard';

interface ArticleCarouselProps {
  title: string;
  isLoggedIn: boolean;
  articles: StructuredContent[];
}

export const ArticleCarousel = ({ title, isLoggedIn, articles }: ArticleCarouselProps) => {
  const { t } = useTranslation();
  const carouselItems: CardCarouselItem[] = useCardCarouselItems(
    React.useCallback(() => {
      return articles.map((article) => ({
        id: `${article.id ?? ''}`,
        component: <ArticleCard article={article} variant="vertical" isLoggedIn={isLoggedIn} />,
      }));
    }, [articles, isLoggedIn]),
  );

  return (
    carouselItems.length > 0 && (
      <div className="col-span-3" data-testid="article-carousel">
        <h2 className="text-heading-2-mobile sm:text-heading-2 mb-5" data-testid="article-carousel-title">
          {title}
        </h2>
        <CardCarousel
          itemWidth={261}
          items={carouselItems}
          translations={{
            prevTrigger: t('carousel.prev'),
            nextTrigger: t('carousel.next'),
            indicator: (index: number) => t('carousel.indicator', { index: index + 1 }),
          }}
          className="max-[640px]:px-5 max-[640px]:-mx-5 max-[1148px]:px-6 max-[1148px]:-mx-6 p-3 -m-3"
          data-testid="article-carousel-cards"
        />
      </div>
    )
  );
};
