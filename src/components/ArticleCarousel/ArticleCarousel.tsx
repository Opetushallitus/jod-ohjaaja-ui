import React from 'react';
import { useTranslation } from 'react-i18next';
import { Await } from 'react-router';

import { CardCarousel, CardCarouselItem } from '@jod/design-system';

import { useCardCarouselItems } from '@/hooks/useCardCarouselItems';
import { StructuredContent } from '@/types/cms-content';

import { ArticleCard } from '../ArticleCard/ArticleCard';

// Shared by the carousel and its skeleton, so that the skeleton has the dimensions of the carousel
const CARD_WIDTH = 261;
const CARD_GAP = 16;
const CAROUSEL_CLASS_NAME = '-m-3 p-3 max-[1148px]:-mx-6 max-[1148px]:px-6 max-[640px]:-mx-5 max-[640px]:px-5';

const getTestId = (testId: string | undefined, suffix: string) => (testId ? `${testId}-${suffix}` : suffix);

interface ArticleCarouselProps {
  title: string;
  isLoggedIn: boolean;
  articles: StructuredContent[];
  testId?: string;
}

export const ArticleCarousel = ({ title, isLoggedIn, articles, testId }: ArticleCarouselProps) => {
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
      <div className="col-span-3" data-testid={getTestId(testId, 'article-carousel')}>
        <h2
          className="mb-5 text-heading-2-mobile sm:text-heading-2"
          data-testid={getTestId(testId, 'article-carousel-title')}
        >
          {title}
        </h2>
        <CardCarousel
          itemWidth={CARD_WIDTH}
          gap={CARD_GAP}
          items={carouselItems}
          translations={{
            prevTrigger: t('carousel.prev'),
            nextTrigger: t('carousel.next'),
            indicator: (index: number) => t('carousel.indicator', { index: index + 1 }),
          }}
          className={CAROUSEL_CLASS_NAME}
          data-testid={getTestId(testId, 'article-carousel-cards')}
        />
      </div>
    )
  );
};

const SKELETON_CARD_COUNT = 5;

/** Props of the placeholders shown instead of the carousel while loading or after an error. */
interface ArticleCarouselPlaceholderProps {
  title: string;
  testId?: string;
}

/** Placeholder with the dimensions of the vertical article cards, shown while the articles are loading. */
const ArticleCarouselSkeleton = ({ title, testId }: ArticleCarouselPlaceholderProps) => {
  return (
    <div className="col-span-3" aria-busy="true" data-testid={getTestId(testId, 'article-carousel-skeleton')}>
      <h2 className="mb-5 text-heading-2-mobile sm:text-heading-2">{title}</h2>
      <div className={`flex overflow-hidden ${CAROUSEL_CLASS_NAME}`} style={{ gap: CARD_GAP }} aria-hidden="true">
        {Array.from({ length: SKELETON_CARD_COUNT }, (_, index) => (
          <div
            key={index}
            className="animate-pulse flex min-h-[380px] shrink-0 flex-col gap-4 overflow-clip rounded bg-white pb-5 shadow-border"
            style={{ width: CARD_WIDTH }}
          >
            <div className="h-[147px] bg-bg-gray-2" />
            <div className="mx-5 h-6 w-4/5 rounded bg-bg-gray-2" />
            <div className="mx-5 flex flex-col gap-2">
              <div className="h-4 rounded bg-bg-gray-2" />
              <div className="h-4 rounded bg-bg-gray-2" />
              <div className="h-4 w-3/5 rounded bg-bg-gray-2" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const ArticleCarouselError = ({ title, testId }: ArticleCarouselPlaceholderProps) => {
  const { t } = useTranslation();

  return (
    <div className="col-span-3" data-testid={getTestId(testId, 'article-carousel-error')}>
      <h2 className="mb-5 text-heading-2-mobile sm:text-heading-2">{title}</h2>
      <p className="text-body-md">{t('common:error-boundary.unexpected')}</p>
    </div>
  );
};

interface DeferredArticleCarouselProps extends Omit<ArticleCarouselProps, 'articles'> {
  articles: Promise<StructuredContent[]>;
  /** Rendered instead of the carousel when there are no articles. */
  emptyContent?: React.ReactNode;
}

/**
 * Article carousel for articles that are still loading, shows a skeleton until they are available
 * and an error message if loading them fails.
 */
export const DeferredArticleCarousel = ({ articles, emptyContent, ...props }: DeferredArticleCarouselProps) => (
  <React.Suspense fallback={<ArticleCarouselSkeleton title={props.title} testId={props.testId} />}>
    <Await resolve={articles} errorElement={<ArticleCarouselError title={props.title} testId={props.testId} />}>
      {(resolvedArticles: StructuredContent[]) =>
        resolvedArticles.length === 0 && emptyContent ? (
          emptyContent
        ) : (
          <ArticleCarousel {...props} articles={resolvedArticles} />
        )
      }
    </Await>
  </React.Suspense>
);
