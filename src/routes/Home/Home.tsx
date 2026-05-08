import React from 'react';
import { useTranslation } from 'react-i18next';
import { useLoaderData } from 'react-router';

import { useMediaQueries } from '@jod/design-system';

import heroSrc1 from '@/../assets/ohjaaja-hero-1.jpg';
import heroSrc2 from '@/../assets/ohjaaja-hero-2.jpg';
import heroSrc3 from '@/../assets/ohjaaja-hero-3.jpg';
import heroSrc4 from '@/../assets/ohjaaja-hero-4.jpg';
import { ArticleCarousel } from '@/components/ArticleCarousel/ArticleCarousel';
import { FeatureCard } from '@/components/FeatureCard/FeatureCard';
import { LoginBanner } from '@/components/LoginBanner/LoginBanner';
import { RecentlyWatchedContent } from '@/components/RecentlyWatchedContent/RecentlyWatchedContent';
import { SuggestNewContent } from '@/components/SuggestNewContent/SuggestNewContent';
import { LangCode } from '@/i18n/config';
import { LoaderData } from '@/routes/Home/loader';
import { useOhjaajaProfile } from '@/stores/useSessionManagerStore';
import { getMainCategoryPath } from '@/utils/navigation-paths';
import { getLinkTo } from '@/utils/routeUtils';

const Home = () => {
  const {
    t,
    i18n: { language },
  } = useTranslation();

  const { sm } = useMediaQueries();

  const { newestContent, mostViewedContent, bestMatchingContent } = useLoaderData<LoaderData>();
  const user = useOhjaajaProfile();
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

  // Rotate hero image weekly
  const heroSrc = React.useMemo(() => {
    const heroImages = [heroSrc1, heroSrc2, heroSrc3, heroSrc4];
    const weekNumber = Math.floor(Date.now() / (7 * 24 * 60 * 60 * 1000));
    return heroImages[weekNumber % heroImages.length];
  }, []);

  const heroHeight = React.useMemo(() => {
    return window.innerHeight - 68;
    // oxlint-disable-next-line eslint-plugin-react-hooks/exhaustive-deps
  }, [window.innerWidth]);

  return (
    <main id="jod-main" className="mx-auto w-full max-w-(--breakpoint-xl)" data-testid="home">
      <title>{t('front-page')}</title>

      <img
        src={heroSrc}
        alt=""
        role="none"
        className="pointer-events-none -z-10 w-(--breakpoint-xl) touch-none object-cover object-[50%_50%] select-none sm:h-[617px] sm:object-[44%_50%] md:object-[41%_50%] lg:object-[20%_50%] xl:object-[50%_50%]"
        style={sm ? undefined : { height: heroHeight }}
        data-testid="home-hero"
      />

      <div ref={firstCardRef} className="relative mx-auto mb-6 max-w-[1140px] px-5 sm:px-6 lg:mb-8">
        <FeatureCard
          level="h1"
          hero
          title={t('home.card-1-title')}
          content={t('home.card-1-content')}
          backgroundColor="var(--ds-color-secondary-2-dark-2)"
          className="lg:w-1/2"
        />
      </div>
      <div className="mx-auto mb-8 flex max-w-[1140px] flex-col gap-6 px-5 pb-8 sm:px-6 lg:flex-row xl:gap-7">
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
        className="mx-auto grid max-w-[1140px] grid-cols-3 gap-8 px-5 pb-7 sm:px-6 md:pb-[40px] lg:pb-[75px]"
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
            <div className="col-span-3 content-end lg:col-span-1">
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
