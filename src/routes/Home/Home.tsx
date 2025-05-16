import heroSrc from '@/../assets/ohjaaja-hero.avif';
import { ArticleCard } from '@/components/ArticleCard/ArticleCard';
import { FeatureCard } from '@/components/FeatureCard/FeatureCard';
import { LoginBanner } from '@/components/LoginBanner/LoginBanner';
import { RecentlyWatchedContent } from '@/components/RecentlyWatchedContent/RecentlyWatchedContent';
import { SearchBanner } from '@/components/SearchBanner/SearchBanner';
import { SuggestNewContent } from '@/components/SuggestNewContent/SuggestNewContent';
import { LangCode } from '@/i18n/config';
import { LoaderData } from '@/routes/Home/loader';
import { getMainCategoryPath } from '@/utils/navigation-paths';
import { CardCarousel, CardCarouselItem } from '@jod/design-system';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLoaderData } from 'react-router';

const Home = () => {
  const {
    t,
    i18n: { language },
  } = useTranslation();
  const { data, isLoggedIn } = useLoaderData<LoaderData>();
  const [carouselItems, setCarouselItems] = React.useState<CardCarouselItem[]>([]);

  React.useEffect(() => {
    const items = data.items.map((article) => {
      return {
        id: `${article.id ?? ''}`,
        component: <ArticleCard article={article} variant="vertical" isLoggedIn={isLoggedIn} />,
      };
    });
    setCarouselItems(items);
  }, [data, isLoggedIn]);

  return (
    <>
      <SearchBanner />
      <main id="jod-main" className="w-full max-w-(--breakpoint-xl) mx-auto">
        <title>{t('osaamispolku')}</title>

        <img
          src={heroSrc}
          alt=""
          role="none"
          className="absolute w-(--breakpoint-xl) h-[320px] md:h-[454px] object-cover object-object-[50%] lg:object-[0_20%] -z-10"
        />

        <div className="grid gap-8 grid-cols-3 max-w-[1140px] mx-auto px-5 sm:px-6 pt-[186px] md:pt-[72px] pb-7 md:pb-[40px] lg:pb-[75px]">
          <div className="col-span-3 flex flex-col gap-3 md:gap-5 lg:gap-8">
            <FeatureCard
              level="h1"
              hero
              title={t('home.card-1-title')}
              content={t('home.card-1-content')}
              backgroundColor="#00A8B3BF"
              className="md:w-min"
            />
            <div className="flex flex-col lg:flex-row gap-3 md:gap-5 xl:gap-7">
              <FeatureCard
                to={getMainCategoryPath(language as LangCode, 0)}
                linkComponent={Link}
                level="h2"
                title={t('home.card-2-title')}
                content={t('home.card-2-content')}
                backgroundColor="var(--ds-color-secondary-1)"
                collapseOnSmallScreen={true}
                opacity={0.95}
                className="flex-1"
              />
              <FeatureCard
                to={getMainCategoryPath(language as LangCode, 1)}
                linkComponent={Link}
                level="h2"
                title={t('home.card-3-title')}
                content={t('home.card-3-content')}
                backgroundColor="var(--ds-color-secondary-3)"
                collapseOnSmallScreen={true}
                opacity={0.95}
                className="flex-1"
              />
              <FeatureCard
                to={getMainCategoryPath(language as LangCode, 2)}
                linkComponent={Link}
                level="h2"
                title={t('home.card-4-title')}
                content={t('home.card-4-content')}
                backgroundColor="var(--ds-color-secondary-4)"
                collapseOnSmallScreen={true}
                opacity={0.95}
                className="flex-1"
              />
            </div>
          </div>
          <div className="col-span-3">
            <h2 className="text-heading-2-mobile sm:text-heading-2 mb-5">{t('home.new-content')}</h2>
            <CardCarousel
              itemWidth={261}
              items={carouselItems}
              translations={{
                prevTrigger: t('carousel.prev'),
                nextTrigger: t('carousel.next'),
                indicator: (index: number) => t('carousel.indicator', { index: index + 1 }),
              }}
              className="max-[640px]:px-5 max-[640px]:-mx-5 max-[1148px]:px-6 max-[1148px]:-mx-6 p-3 -m-3"
            />
          </div>

          {isLoggedIn && (
            <div className="col-span-3 lg:col-span-2">
              <FeatureCard
                to="/"
                linkComponent={Link}
                level="h2"
                title={t('home.favorites')}
                content={t('home.favorites-content')}
                backgroundColor="#85C4EC"
              />
            </div>
          )}

          <div className="col-span-3">
            <h2 className="text-heading-2-mobile sm:text-heading-2 mb-5">{t('home.popular-content')}</h2>
            <CardCarousel
              itemWidth={261}
              items={carouselItems}
              translations={{
                prevTrigger: t('carousel.prev'),
                nextTrigger: t('carousel.next'),
                indicator: (index: number) => t('carousel.indicator', { index: index + 1 }),
              }}
              className="max-[640px]:px-5 max-[640px]:-mx-5 max-[1148px]:px-6 max-[1148px]:-mx-6 p-3 -m-3"
            />
          </div>

          {isLoggedIn ? (
            <div className="col-span-3 grid grid-cols-3 gap-x-6 xl:gap-x-7">
              <RecentlyWatchedContent />
              <div className="col-span-3 lg:col-span-1 content-end">
                <SuggestNewContent />
              </div>
            </div>
          ) : (
            <LoginBanner />
          )}
        </div>
      </main>
    </>
  );
};

export default Home;
