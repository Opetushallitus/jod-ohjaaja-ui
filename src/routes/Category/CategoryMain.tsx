import { ArticleCarousel } from '@/components/ArticleCarousel/ArticleCarousel';
import { Breadcrumb } from '@/components/Breadcrumb/Breadcrumb';
import { LoginBanner } from '@/components/LoginBanner/LoginBanner';
import { CategoryNavigation } from '@/components/MainLayout/CategoryNavigation';
import { RecentlyWatchedContent } from '@/components/RecentlyWatchedContent/RecentlyWatchedContent';
import { SuggestNewContent } from '@/components/SuggestNewContent/SuggestNewContent';
import { useCategoryRoute } from '@/hooks/useCategoryRoutes';
import { tidyClasses as tc } from '@jod/design-system';
import { useTranslation } from 'react-i18next';
import { useLoaderData } from 'react-router';
import { LoaderData } from './loader';

const CategoryMain = () => {
  const { newestCategoryContent, mostViewedCategoryContent, bestMatchingCategoryContent, isLoggedIn } =
    useLoaderData<LoaderData>();
  const categoryRoute = useCategoryRoute('CategoryMain');
  const { t } = useTranslation();

  const title = categoryRoute?.handle?.title;
  const description = categoryRoute?.handle?.description;

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
  ]);

  return (
    <main
      role="main"
      className="mx-auto grid w-full max-w-[1140px] grow grid-cols-3 gap-6 px-5 pb-6 pt-5 sm:px-6 print:p-0"
      data-testid="category-main"
    >
      <Breadcrumb />
      <aside
        className="col-span-3 lg:row-start-2 lg:col-start-3 lg:col-span-1 print:hidden position-relative lg:position-static z-10 lg:z-auto h-[47px] lg:h-auto"
        data-testid="category-main-aside"
      >
        <nav
          role="navigation"
          className="sticky position-absolute top-0 left-0 w-full lg:top-[96px] lg:position-static max-h-[calc(100vh-196px)] overflow-y-auto scrollbar-hidden"
          data-testid="category-nav"
        >
          <CategoryNavigation />
        </nav>
      </aside>
      <section
        className="col-span-3 lg:row-start-2 lg:col-start-1 lg:col-span-2 print:col-span-3"
        data-testid="category-main-content"
      >
        {title && (
          <h1 className="text-heading-1-mobile sm:text-heading-1 mb-5" data-testid="category-title">
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

      <ArticleCarousel title={t('home.new-content')} isLoggedIn={isLoggedIn} articles={newestCategoryContent.items} />

      <ArticleCarousel title={t('home.popular-content')} isLoggedIn={isLoggedIn} articles={mostViewedCategoryContent} />

      <ArticleCarousel title={t('home.best-matching')} isLoggedIn={isLoggedIn} articles={bestMatchingCategoryContent} />

      {isLoggedIn ? (
        <div className="col-span-3">
          <div className="col-span-3 grid grid-cols-3 gap-x-6 xl:gap-x-7">
            <RecentlyWatchedContent />
            <div className="col-span-3 lg:col-span-1 content-end">
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
