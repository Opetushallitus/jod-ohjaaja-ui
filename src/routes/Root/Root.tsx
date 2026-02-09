import { FeedbackModal } from '@/components';
import { NavMenu } from '@/components/NavMenu/NavMenu';
import { SearchBar } from '@/components/SearchBar/SearchBar';
import { Toaster } from '@/components/Toaster/Toaster';
import { useLocalizedRoutes } from '@/hooks/useLocalizedRoutes';
import i18n, { LangCode, langLabels, supportedLanguageCodes } from '@/i18n/config';
import { useAuthStore } from '@/stores/useAuthStore';
import { useNoteStore } from '@/stores/useNoteStore';
import { getNotifications } from '@/utils/notifications';
import { getLinkTo } from '@/utils/routeUtils';
import {
  Button,
  Chatbot,
  Footer,
  LanguageButton,
  MatomoTracker,
  MenuButton,
  NavigationBar,
  SkipLink,
  useMediaQueries,
  useNoteStack,
  UserButton,
} from '@jod/design-system';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link, NavLink, Outlet, ScrollRestoration, useLocation, useMatch } from 'react-router';
import { useShallow } from 'zustand/react/shallow';
import { LogoutFormContext } from '.';

const Root = () => {
  const {
    t,
    i18n: { language },
  } = useTranslation();
  const { note, clearNote } = useNoteStore(useShallow((state) => ({ note: state.note, clearNote: state.clearNote })));
  const [navMenuOpen, setNavMenuOpen] = React.useState(false);
  const [feedbackVisible, setFeedbackVisible] = React.useState(false);
  const [searchInputVisible, setSearchInputVisible] = React.useState(false);
  const { sm } = useMediaQueries();
  const location = useLocation();
  const { generateLocalizedPath } = useLocalizedRoutes();
  const { addPermanentNote, addTemporaryNote } = useNoteStack();

  const hostname = window.location.hostname;
  const { siteId } = React.useMemo(() => {
    if (hostname === 'osaamispolku.fi') {
      return { siteId: 36 };
    } else if (hostname === 'jodtestaus.fi') {
      return { siteId: 38 };
    } else {
      return { siteId: 37 };
    }
  }, [hostname]);

  const moreInfoLinks = [
    {
      href: `/${language}/${t('slugs.about-service')}`,
      label: t('footer.more-info-links.about-service'),
    },
    {
      href: `/${language}/${t('slugs.privacy-and-cookies')}`,
      label: t('footer.more-info-links.privacy-and-cookies'),
    },
    {
      href: `/${language}/${t('slugs.data-sources')}`,
      label: t('footer.more-info-links.data-sources'),
    },
    {
      href: `/${language}/${t('slugs.ai-usage')}`,
      label: t('footer.more-info-links.ai-usage'),
    },
    {
      href: `/${language}/${t('slugs.accessibility')}`,
      label: t('footer.more-info-links.accessibility'),
    },
  ];

  const logoutForm = React.useRef<HTMLFormElement>(null);

  const user = useAuthStore((state) => state.user);

  const isProfileActive = !!useMatch(`/${language}/${t('slugs.profile.index')}/*`);

  const logout = () => {
    logoutForm.current?.submit();
  };

  React.useEffect(() => {
    document.documentElement.setAttribute('lang', i18n.language);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i18n.language]);

  React.useEffect(() => {
    if (!note) {
      return;
    }

    if (note.permanent) {
      addPermanentNote(() => ({
        // Prevent multiple session-expired notes with fixed id
        id: note.description.includes('session-expired') ? 'session-expired' : undefined,
        title: note.title,
        description: note.description,
        variant: 'error',
      }));
    } else {
      addTemporaryNote(() => ({
        // Prevent multiple session-expired notes with fixed id
        id: note.description.includes('session-expired') ? 'session-expired' : undefined,
        title: note.title,
        description: note.description,
        variant: 'error',
        isCollapsed: false,
      }));
    }
    clearNote();
  }, [addPermanentNote, addTemporaryNote, clearNote, note, t]);

  const showServiceName = sm || !searchInputVisible;

  React.useEffect(() => {
    getNotifications().forEach((notification) => {
      addTemporaryNote(() => ({
        id: notification.id,
        title: notification.title[language as LangCode],
        description: notification.description[language as LangCode],
        variant: notification.variant,
        readMoreComponent: notification.link ? (
          <Button
            size="sm"
            variant="white"
            label={notification.link.label[language as LangCode]}
            linkComponent={getLinkTo(notification.link.url[language as LangCode], {
              useAnchor: true,
              target: '_blank',
            })}
          />
        ) : undefined,
        isCollapsed: false,
      }));
    });
  }, [addTemporaryNote, t, language]);

  return (
    <>
      <link rel="manifest" href={`/manifest-${language}.json`} crossOrigin="use-credentials" />
      <header role="banner" className="sticky top-0 z-30 print:hidden" data-testid="app-header">
        <SkipLink hash="#jod-main" label={t('skiplinks.main')} />
        <form action="/ohjaaja/logout" method="POST" hidden ref={logoutForm}>
          <input type="hidden" name="_csrf" value={user?.csrf.token ?? ''} />
          <input type="hidden" name="lang" value={language} />
        </form>
        <NavigationBar
          logo={{ to: `/${language}`, language, srText: t('osaamispolku') }}
          menuComponent={<MenuButton label={t('menu')} onClick={() => setNavMenuOpen(!navMenuOpen)} />}
          languageButtonComponent={
            <LanguageButton
              serviceVariant="ohjaaja"
              testId="language-button"
              language={language as LangCode}
              supportedLanguageCodes={supportedLanguageCodes}
              generateLocalizedPath={generateLocalizedPath}
              linkComponent={Link}
              translations={{
                fi: { change: 'Vaihda kieli.', label: langLabels.fi },
                sv: { change: 'Andra språk.', label: langLabels.sv },
                en: { change: 'Change language.', label: langLabels.en },
              }}
            />
          }
          userButtonComponent={
            <UserButton
              serviceVariant="ohjaaja"
              firstName={user?.etunimi}
              isProfileActive={isProfileActive}
              profileLabel={t('profile.index')}
              // eslint-disable-next-line react/no-unstable-nested-components
              profileLinkComponent={(props) => <NavLink to={t('slugs.profile.index')} {...props} />}
              isLoggedIn={!!user}
              loginLabel={t('login')}
              // eslint-disable-next-line react/no-unstable-nested-components
              loginLinkComponent={(props) => <NavLink to={`/${language}/${t('slugs.profile.login')}`} {...props} />}
              logoutLabel={t('logout')}
              onLogout={logout}
            />
          }
          renderLink={({ to, className, children }) => (
            <Link to={to} className={className} data-testid="navbar-link">
              {children}
            </Link>
          )}
          serviceBarVariant="ohjaaja"
          serviceBarTitle={showServiceName ? t('service-name') : ' '}
          serviceBarContent={
            <SearchBar searchInputVisible={searchInputVisible} setSearchInputVisible={setSearchInputVisible} />
          }
          translations={{
            showAllNotesLabel: t('show-all'),
            ariaLabelCloseNote: t('note.close'),
          }}
        />
      </header>
      <LogoutFormContext.Provider value={logoutForm.current}>
        <NavMenu open={navMenuOpen} onClose={() => setNavMenuOpen(false)} />
        <Outlet />
      </LogoutFormContext.Provider>
      <Chatbot />
      <Footer
        language={language}
        okmLabel={t('footer.logos.okm-label')}
        temLabel={t('footer.logos.tem-label')}
        ophLabel={t('footer.logos.oph-label')}
        kehaLabel={t('footer.logos.keha-label')}
        cooperationTitle={t('footer.cooperation-title')}
        fundingTitle={t('footer.funding-title')}
        moreInfoTitle={t('footer.more-info-title')}
        moreInfoDescription={t('footer.more-info-description')}
        moreInfoLinks={moreInfoLinks}
        feedbackTitle={t('footer.feedback-title')}
        feedbackContent={t('footer.feedback-content')}
        feedbackButtonLabel={t('footer.feedback-button-label')}
        feedbackOnClick={() => setFeedbackVisible(true)}
        feedbackBgImageClassName="bg-[url(@/../assets/feedback.jpg)] bg-cover bg-[50%_50%]"
        copyright={t('footer.copyright')}
        externalLinkIconAriaLabel={t('external-link')}
        testId="footer"
      />
      <FeedbackModal
        isOpen={feedbackVisible}
        onClose={() => setFeedbackVisible(false)}
        section="Ohjaajan osio"
        area="Alatunniste"
        language={language as LangCode}
      />
      <Toaster />
      <ScrollRestoration />
      <MatomoTracker trackerUrl="https://analytiikka.opintopolku.fi" siteId={siteId} pathname={location.pathname} />
    </>
  );
};

export default Root;
