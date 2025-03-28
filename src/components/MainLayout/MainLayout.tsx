interface MainLayoutProps {
  children: React.ReactNode;
  navChildren?: React.ReactNode;
}

export const MainLayout = ({ children, navChildren }: MainLayoutProps) => {
  return (
    <div className="mx-auto grid w-full max-w-[1140px] grow grid-cols-3 gap-6 px-5 pb-6 pt-8 sm:px-6 print:p-0">
      {navChildren && (
        <aside className="lg:order-last col-span-3 lg:col-span-1 print:hidden position-relative lg:position-static z-10 lg:z-auto h-[47px] lg:h-auto">
          <nav
            role="navigation"
            className="sticky position-absolute top-0 left-0 w-full lg:top-[96px] lg:position-static max-h-[calc(100vh-196px)] overflow-y-auto scrollbar-hidden "
          >
            {navChildren}
          </nav>
        </aside>
      )}
      <main role="main" className="col-span-3 lg:col-span-2 print:col-span-3" id="jod-main">
        {children}
      </main>
    </div>
  );
};
