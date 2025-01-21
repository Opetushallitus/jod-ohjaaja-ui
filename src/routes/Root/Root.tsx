import { LanguageMenu } from '@/components';
import i18n from '@/i18n/config';
import { Footer, NavigationBar, SkipLink, useMediaQueries } from '@jod/design-system';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { MdClose, MdMenu } from 'react-icons/md';
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
  const [userMenuOpen, setUserMenuOpen] = React.useState(false);
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

  const toggleMenu = (menu: 'mega' | 'user' | 'lang') => () => {
    setMegaMenuOpen(false);
    setUserMenuOpen(false);
    setLangMenuOpen(false);
    switch (menu) {
      case 'mega':
        setMegaMenuOpen(!megaMenuOpen);
        break;
      case 'user':
        setUserMenuOpen(!userMenuOpen);
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
    <div className="bg-bg-gray">
      <link rel="manifest" href={`/ohjaaja/manifest-${language}.json`} crossOrigin="use-credentials" />
      <header role="banner" className="sticky top-0 z-30 print:hidden">
        <SkipLink hash="#jod-main" label={t('skiplinks.main')} />
        <NavigationBar
          logo={{
            to: `/${language}`,
            language,
            srText: t('osaamispolku'),
          }}
          menuComponent={
            sm ? (
              <button
                className="flex gap-4 justify-center items-center select-none"
                aria-label={t('open-menu')}
                onClick={toggleMenu('mega')}
              >
                <span className="py-3 pl-3">{t('menu')}</span>
                <span className="size-7 flex justify-center items-center">
                  <MdMenu size={24} />
                </span>
              </button>
            ) : (
              <button className="flex justify-self-end p-3" aria-label={t('open-menu')} onClick={toggleMenu('mega')}>
                {megaMenuOpen ? (
                  <span className="size-7 flex justify-center items-center">
                    <MdClose size={24} />
                  </span>
                ) : (
                  <span className="size-7 flex justify-center items-center">
                    <MdMenu size={24} />
                  </span>
                )}
              </button>
            )
          }
          renderLink={({ to, className, children }) => (
            <NavLink to={to} className={className}>
              {children as React.ReactNode}
            </NavLink>
          )}
        />
        {langMenuOpen && (
          <div className="relative xl:container mx-auto">
            <div className="absolute right-[50px] translate-y-7">
              <LanguageMenu onClick={changeLanguage} />
            </div>
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
      <ScrollRestoration />
    </div>
  );
};

export default Root;
