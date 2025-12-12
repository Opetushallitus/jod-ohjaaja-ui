import heroSrc from '@/../assets/ohjaaja-hero.jpg';
import { ArticleCarousel } from '@/components/ArticleCarousel/ArticleCarousel';
import { FeatureCard } from '@/components/FeatureCard/FeatureCard';
import { LoginBanner } from '@/components/LoginBanner/LoginBanner';
import { RecentlyWatchedContent } from '@/components/RecentlyWatchedContent/RecentlyWatchedContent';
import { SuggestNewContent } from '@/components/SuggestNewContent/SuggestNewContent';
import { LangCode } from '@/i18n/config';
import { LoaderData } from '@/routes/Home/loader';
import { useAuthStore } from '@/stores/useAuthStore';
import { getMainCategoryPath } from '@/utils/navigation-paths';
import { getLinkTo } from '@/utils/routeUtils';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useLoaderData } from 'react-router';

const Home = () => {
  const {
    t,
    i18n: { language },
  } = useTranslation();
  const { newestContent, mostViewedContent, bestMatchingContent } = useLoaderData<LoaderData>();
  const user = useAuthStore((state) => state.user);
  const isLoggedIn = !!user;

  const firstCardRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (firstCardRef.current) {
      const resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
          if (entry.target.isSameNode(firstCardRef.current) && firstCardRef.current?.style) {
            firstCardRef.current.style.marginTop = `-${(2 * entry.contentRect.height) / 3}px`;
          }
        }
      });
      resizeObserver.observe(firstCardRef.current);
      return () => resizeObserver.disconnect();
    }
  }, []);

  return (
    <main id="jod-main" className="w-full max-w-(--breakpoint-xl) mx-auto" data-testid="home">
      <title>{t('front-page')}</title>

      <img
        src={heroSrc}
        alt=""
        role="none"
        className="w-(--breakpoint-xl) sm:h-[617px] h-[calc(100vh-104px)] object-cover xl:object-[50%_50%] lg:object-[20%_50%] md:object-[41%_50%] sm:object-[44%_50%] object-[50%_50%] -z-10"
        data-testid="home-hero"
      />

      <div ref={firstCardRef} className="max-w-[1140px] mx-auto px-5 sm:px-6 mb-6 lg:mb-8 relative">
        <FeatureCard
          level="h1"
          hero
          title={t('home.card-1-title')}
          content={t('home.card-1-content')}
          backgroundColor="var(--ds-color-secondary-2-dark-2)"
          className="lg:w-1/2"
        />
      </div>
      <div className="max-w-[1140px] flex flex-col lg:flex-row gap-6 xl:gap-7 mx-auto px-5 sm:px-6 pb-8 mb-8">
        <FeatureCard
          linkComponent={getLinkTo(getMainCategoryPath(language as LangCode, 0))}
          level="h2"
          title={t('home.card-2-title')}
          content={t('home.card-2-content')}
          backgroundColor="var(--ds-color-secondary-2-dark)"
          className="flex-1"
          buttonText={t('home.card-2-button-text')}
        />
        <FeatureCard
          linkComponent={getLinkTo(getMainCategoryPath(language as LangCode, 1))}
          level="h2"
          title={t('home.card-3-title')}
          content={t('home.card-3-content')}
          backgroundColor="var(--ds-color-secondary-2-dark-2)"
          className="flex-1"
          buttonText={t('home.card-3-button-text')}
        />
        <FeatureCard
          linkComponent={getLinkTo(getMainCategoryPath(language as LangCode, 2))}
          level="h2"
          title={t('home.card-4-title')}
          content={t('home.card-4-content')}
          backgroundColor="var(--ds-color-secondary-2-dark)"
          className="flex-1"
          buttonText={t('home.card-4-button-text')}
        />
      </div>
      <div
        className="grid gap-8 grid-cols-3 max-w-[1140px] mx-auto px-5 sm:px-6 pb-7 md:pb-[40px] lg:pb-[75px]"
        data-testid="home-content"
      >
        <ArticleCarousel title={t('home.popular-content')} isLoggedIn={isLoggedIn} articles={mostViewedContent} />
        {isLoggedIn && (
          <div className="col-span-3 lg:col-span-2">
            <FeatureCard
              linkComponent={getLinkTo(`/${language}/${t('slugs.profile.index')}/${t('slugs.profile.favorites')}`)}
              level="h2"
              title={t('home.favorites')}
              content={t('home.favorites-content')}
              buttonText={t('home.favorites-button-label')}
              backgroundColor="var(--ds-color-secondary-2-dark)"
            />
          </div>
        )}

        <ArticleCarousel title={t('home.new-content')} isLoggedIn={isLoggedIn} articles={newestContent} />
        {isLoggedIn && bestMatchingContent.length === 0 ? (
          <div className="col-span-3 lg:col-span-2">
            <FeatureCard
              linkComponent={getLinkTo(`/${language}/${t('slugs.profile.index')}/${t('slugs.profile.details')}`)}
              level="h2"
              title={t('want-to-see-interesting-content-title')}
              content={t('want-to-see-interesting-content-content')}
              buttonText={t('want-to-see-interesting-content-button')}
              backgroundColor="var(--ds-color-secondary-2-dark)"
            />
          </div>
        ) : (
          <ArticleCarousel title={t('home.best-matching')} isLoggedIn={isLoggedIn} articles={bestMatchingContent} />
        )}

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
  );
};

export default Home;
