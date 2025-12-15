import { useBreadcrumbItems } from '@/hooks/useBreadcrumbItems';
import { Breadcrumb, tidyClasses, useMediaQueries } from '@jod/design-system';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { BreadcrumbLink } from '../BreadcrumbLink/BreadcrumbLink';

interface MainLayoutProps {
  children: React.ReactNode;
  navChildren?: React.ReactNode;
  asideChildren?: React.ReactNode;
  featuredContentChildren?: React.ReactNode;
}

export const MainLayout = ({ children, navChildren, asideChildren, featuredContentChildren }: MainLayoutProps) => {
  const { lg } = useMediaQueries();
  const breadcrumbItems = useBreadcrumbItems();
  const { t } = useTranslation();
  return (
    <div
      className="mx-auto grid w-full max-w-[1140px] grow grid-cols-3 gap-6 px-5 pb-9 pt-11 sm:px-6 print:p-0 auto-rows-max"
      data-testid="main-layout"
    >
      <Breadcrumb
        items={breadcrumbItems}
        serviceVariant="ohjaaja"
        linkComponent={BreadcrumbLink}
        ariaLabel={t('breadcrumb')}
      />

      {(navChildren || asideChildren || (lg && featuredContentChildren)) && (
        <aside
          className="lg:flex lg:flex-col lg:gap-6 lg:order-last col-span-3 lg:col-span-1 print:hidden position-relative lg:position-static z-10 lg:z-auto h-[47px] lg:h-auto"
          data-testid="main-layout-aside"
        >
          {navChildren && (
            <nav
              role="navigation"
              className={tidyClasses(
                `${!asideChildren && 'sticky lg:position-static'} position-absolute top-0 left-0 w-full lg:top-[96px] max-h-[calc(100vh-196px)] overflow-y-auto scrollbar-hidden`,
              )}
              data-testid="main-layout-nav"
            >
              {navChildren}
            </nav>
          )}
          {asideChildren}
          {lg && featuredContentChildren}
        </aside>
      )}
      <main
        role="main"
        className="col-span-3 lg:col-span-2 print:col-span-3 mb-11"
        id="jod-main"
        data-testid="main-layout-main"
      >
        {children}
        {!lg && <div className="flex flex-col gap-3">{featuredContentChildren}</div>}
      </main>
    </div>
  );
};
