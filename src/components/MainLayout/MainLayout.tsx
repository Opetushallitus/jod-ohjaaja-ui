import { tidyClasses } from '@jod/design-system';
import React from 'react';
import { Breadcrumb } from '../Breadcrumb/Breadcrumb';
import { SearchBanner } from '../SearchBanner/SearchBanner';

interface MainLayoutProps {
  children: React.ReactNode;
  hideSearch?: boolean;
  navChildren?: React.ReactNode;
  asideChildren?: React.ReactNode;
}

export const MainLayout = ({ children, hideSearch, navChildren, asideChildren }: MainLayoutProps) => {
  return (
    <>
      {!hideSearch && <SearchBanner />}
      <div className="mx-auto grid w-full max-w-[1140px] grow grid-cols-3 gap-6 px-5 pb-6 pt-5 sm:px-6 print:p-0 auto-rows-max">
        <Breadcrumb />

        {(navChildren || asideChildren) && (
          <aside className="lg:flex lg:flex-col lg:gap-6 lg:order-last col-span-3 lg:col-span-1 print:hidden position-relative lg:position-static z-10 lg:z-auto h-[47px] lg:h-auto">
            {navChildren && (
              <nav
                role="navigation"
                className={tidyClasses(
                  `${!asideChildren && 'sticky lg:position-static'} position-absolute top-0 left-0 w-full lg:top-[96px] max-h-[calc(100vh-196px)] overflow-y-auto scrollbar-hidden`,
                )}
              >
                {navChildren}
              </nav>
            )}
            {asideChildren}
          </aside>
        )}
        <main role="main" className="col-span-3 lg:col-span-2 print:col-span-3" id="jod-main">
          {children}
        </main>
      </div>
    </>
  );
};
