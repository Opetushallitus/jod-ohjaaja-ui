import { useTranslation } from 'react-i18next';
import { useLoaderData } from 'react-router';

import { Breadcrumb, tidyClasses as tc } from '@jod/design-system';

import { ArticleCarousel } from '@/components/ArticleCarousel/ArticleCarousel';
import { BreadcrumbLink } from '@/components/BreadcrumbLink/BreadcrumbLink';
import { LoginBanner } from '@/components/LoginBanner/LoginBanner';
import { CategoryNavigation } from '@/components/MainLayout/CategoryNavigation';
import { RecentlyWatchedContent } from '@/components/RecentlyWatchedContent/RecentlyWatchedContent';
import { SuggestNewContent } from '@/components/SuggestNewContent/SuggestNewContent';
import { useBreadcrumbItems } from '@/hooks/useBreadcrumbItems';
import { useCategoryRoute } from '@/hooks/useCategoryRoutes';
import { useOhjaajaProfile } from '@/stores/useSessionManagerStore';

import { LoaderData } from './loader';

const CategoryMain = () => {
  const { newestCategoryContent, mostViewedCategoryContent, bestMatchingCategoryContent } = useLoaderData<LoaderData>();
  const user = useOhjaajaProfile();
  const isLoggedIn = !!user;

  const categoryRoute = useCategoryRoute('CategoryMain');
  const { t } = useTranslation();

  const title = categoryRoute?.handle?.title;
  const description = categoryRoute?.handle?.description;

  const breadcrumbItems = useBreadcrumbItems();

  const richTextClasses = tc([
    '[&_p]:my-5',
    '[&_p]:first:my-0',
    '[&_li]:my-2',
    '[&_li]:ml-6',
    '[&_li]:list-item',
    '[&_ul]:list-disc',
    '[&_ol]:list-decimal',
    '[&_strong]:font-bold',
    '[&_img]:inline',
    '[&_h1]:text-heading-1',
    '[&_h2]:text-heading-2',
    '[&_h3]:text-heading-3',
    '[&_h4]:text-heading-4',
    'text-body-lg',
    '[&_a]:text-accent',
  ]);

  return (
    <main
      role="main"
      className="mx-auto grid w-full max-w-[1140px] grow grid-cols-3 gap-6 px-5 pt-11 pb-9 sm:px-6 print:p-0"
      data-testid="category-main"
    >
      <div className="col-span-3">
        <Breadcrumb
          items={breadcrumbItems}
          serviceVariant="ohjaaja"
          linkComponent={BreadcrumbLink}
          ariaLabel={t('common:breadcrumb')}
        />
      </div>
      <aside
        className="position-relative lg:position-static z-10 col-span-3 h-[47px] lg:z-auto lg:col-span-1 lg:col-start-3 lg:row-start-2 lg:h-auto print:hidden"
        data-testid="category-main-aside"
      >
        <nav
          className="position-absolute lg:position-static scrollbar-hidden sticky top-0 left-0 max-h-[calc(100vh-196px)] w-full overflow-y-auto lg:top-[96px]"
          data-testid="category-nav"
        >
          <CategoryNavigation />
        </nav>
      </aside>
      <section
        className="col-span-3 mb-11 lg:col-span-2 lg:col-start-1 lg:row-start-2 print:col-span-3"
        data-testid="category-main-content"
      >
        <title>{title}</title>
        {title && (
          <h1 className="mb-5 text-heading-1-mobile sm:text-heading-1" data-testid="category-title">
            {title}
          </h1>
        )}
        {description && (
          <div
            className={richTextClasses}
            dangerouslySetInnerHTML={{ __html: description }}
            data-testid="category-description"
          />
        )}
      </section>

      <ArticleCarousel title={t('home.popular-content')} isLoggedIn={isLoggedIn} articles={mostViewedCategoryContent} />

      <ArticleCarousel title={t('home.new-content')} isLoggedIn={isLoggedIn} articles={newestCategoryContent.items} />

      <ArticleCarousel title={t('home.best-matching')} isLoggedIn={isLoggedIn} articles={bestMatchingCategoryContent} />

      {isLoggedIn ? (
        <div className="col-span-3">
          <div className="col-span-3 grid grid-cols-3 gap-x-6 xl:gap-x-7">
            <RecentlyWatchedContent />
            <div className="col-span-3 content-end lg:col-span-1">
              <SuggestNewContent />
            </div>
          </div>
        </div>
      ) : (
        <LoginBanner />
      )}
    </main>
  );
};

export default CategoryMain;
