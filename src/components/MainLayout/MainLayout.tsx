import React from 'react';
import { useTranslation } from 'react-i18next';

import { Breadcrumb, tidyClasses, useMediaQueries } from '@jod/design-system';

import { useBreadcrumbItems } from '@/hooks/useBreadcrumbItems';

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
      className="mx-auto grid w-full max-w-[1140px] grow auto-rows-max grid-cols-3 gap-6 px-5 pt-11 pb-9 sm:px-6 print:flex print:p-0"
      data-testid="main-layout"
    >
      <div className="col-span-3">
        <Breadcrumb
          items={breadcrumbItems}
          serviceVariant="ohjaaja"
          linkComponent={BreadcrumbLink}
          ariaLabel={t('common:breadcrumb')}
        />
      </div>

      {(navChildren || asideChildren || (lg && featuredContentChildren)) && (
        <aside
          className="relative z-10 col-span-3 h-[47px] lg:static lg:z-auto lg:order-last lg:col-span-1 lg:flex lg:h-auto lg:flex-col lg:gap-6 print:hidden"
          data-testid="main-layout-aside"
        >
          {navChildren && (
            <div className={tidyClasses(`${!asideChildren && 'sticky'} bg-bg-gray lg:top-[60px] lg:-mt-10`)}>
              <nav
                className={tidyClasses(
                  `scrollbar-hidden top-0 left-0 max-h-[calc(100vh-196px)] w-full overflow-y-auto lg:mt-10`,
                )}
                data-testid="main-layout-nav"
              >
                {navChildren}
              </nav>
            </div>
          )}
          {asideChildren}
          {lg && featuredContentChildren}
        </aside>
      )}
      <main
        role="main"
        className="col-span-3 mb-11 lg:col-span-2 print:col-span-3"
        id="jod-main"
        data-testid="main-layout-main"
      >
        {children}
        {!lg && <div className="mt-3 flex flex-col gap-3">{featuredContentChildren}</div>}
      </main>
    </div>
  );
};
