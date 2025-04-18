import { LanguageButton, LanguageMenu } from '@/components';
import { MegaMenu } from '@/components/MegaMenu/MegaMenu';
import { Toaster } from '@/components/Toaster/Toaster';
import { useMenuClickHandler } from '@/hooks/useMenuClickHandler';
import i18n from '@/i18n/config';
import { Footer, NavigationBar, SkipLink, useMediaQueries } from '@jod/design-system';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { MdMenu } from 'react-icons/md';
import { NavLink, Outlet, ScrollRestoration } from 'react-router';

const NavigationBarItem = (to: string, text: string) => ({
  key: to,
  component: ({ className }: { className: string }) => (
    <NavLink to={to} className={className}>
      {text}
    </NavLink>
  ),
});

const Root = () => {
  const {
    t,
    i18n: { language },
  } = useTranslation();
  const { sm } = useMediaQueries();
  const [megaMenuOpen, setMegaMenuOpen] = React.useState(false);
  const [langMenuOpen, setLangMenuOpen] = React.useState(false);

  const userGuide = t('slugs.user-guide.index');
  const basicInformation = t('slugs.basic-information');
  const footerItems: React.ComponentProps<typeof Footer>['items'] = [
    NavigationBarItem(`${userGuide}/${t('slugs.user-guide.what-is-the-service')}`, t('about-us-and-user-guide')),
    NavigationBarItem(`${basicInformation}/${t('slugs.cookie-policy')}`, t('cookie-policy')),
    NavigationBarItem(`${basicInformation}/${t('slugs.data-sources')}`, t('data-sources')),
    NavigationBarItem(`${basicInformation}/${t('slugs.terms-of-service')}`, t('terms-of-service')),
    NavigationBarItem(`${basicInformation}/${t('slugs.accessibility-statement')}`, t('accessibility-statement')),
    NavigationBarItem(`${basicInformation}/${t('slugs.privacy-policy')}`, t('privacy-policy')),
  ];

  const megaMenuButtonRef = React.useRef<HTMLButtonElement>(null);
  const langMenuButtonRef = React.useRef<HTMLLIElement>(null);

  const megaMenuRef = useMenuClickHandler(() => setMegaMenuOpen(false), megaMenuButtonRef);
  const langMenuRef = useMenuClickHandler(() => setLangMenuOpen(false), langMenuButtonRef);

  const toggleMenu = (menu: 'mega' | 'lang') => () => {
    setMegaMenuOpen(false);
    setLangMenuOpen(false);
    switch (menu) {
      case 'mega':
        setMegaMenuOpen(!megaMenuOpen);
        break;
      case 'lang':
        setLangMenuOpen(!langMenuOpen);
        break;
    }
  };

  const changeLanguage = () => {
    setLangMenuOpen(false);
    setMegaMenuOpen(false);
  };

  React.useEffect(() => {
    document.documentElement.setAttribute('lang', i18n.language);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i18n.language]);

  return (
    <>
      <link rel="manifest" href={`/ohjaaja/manifest-${language}.json`} crossOrigin="use-credentials" />
      <header role="banner" className="sticky top-0 z-30 print:hidden">
        <SkipLink hash="#jod-main" label={t('skiplinks.main')} />
        <NavigationBar
          languageButtonComponent={<LanguageButton onClick={toggleMenu('lang')} />}
          logo={{
            to: `/${language}`,
            language,
            srText: t('osaamispolku'),
          }}
          menuComponent={
            sm ? (
              <button
                className="cursor-pointer flex gap-4 justify-center items-center select-none"
                aria-label={megaMenuOpen ? t('close-menu') : t('open-menu')}
                onClick={toggleMenu('mega')}
                ref={megaMenuButtonRef}
              >
                <span className="py-3 pl-3">{t('menu')}</span>
                <span className="size-7 flex justify-center items-center">
                  <MdMenu size={24} />
                </span>
              </button>
            ) : (
              !megaMenuOpen && (
                <button
                  className="cursor-pointer flex justify-self-end p-3"
                  aria-label={t('open-menu')}
                  onClick={toggleMenu('mega')}
                  ref={megaMenuButtonRef}
                >
                  <span className="size-7 flex justify-center items-center">
                    <MdMenu size={24} />
                  </span>
                </button>
              )
            )
          }
          refs={{ langMenuButtonRef: langMenuButtonRef }}
          renderLink={({ to, className, children }) => (
            <NavLink to={to} className={className}>
              {children as React.ReactNode}
            </NavLink>
          )}
        />
        {langMenuOpen && (
          <div className="relative xl:container mx-auto">
            <div ref={langMenuRef} className="absolute right-[50px] translate-y-7">
              <LanguageMenu onClick={changeLanguage} />
            </div>
          </div>
        )}
        {megaMenuOpen && (
          <div ref={megaMenuRef}>
            <MegaMenu onClose={() => setMegaMenuOpen(false)} onLanguageClick={changeLanguage} />
          </div>
        )}
      </header>
      <Outlet />
      <Footer
        items={footerItems}
        language={language}
        copyright={t('copyright')}
        variant="light"
        className={!sm ? 'py-7' : undefined}
      />
      <Toaster />
      <ScrollRestoration />
    </>
  );
};

export default Root;
