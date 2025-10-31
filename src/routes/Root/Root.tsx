import { FeedbackModal } from '@/components';
import { NavMenu } from '@/components/NavMenu/NavMenu';
import { SearchBar } from '@/components/SearchBar/SearchBar';
import { Toaster } from '@/components/Toaster/Toaster';
import { useLocalizedRoutes } from '@/hooks/useLocalizedRoutes';
import i18n, { LangCode, langLabels, supportedLanguageCodes } from '@/i18n/config';
import { useAuthStore } from '@/stores/useAuthStore';
import { useNoteStore } from '@/stores/useNoteStore';
import { getLinkTo } from '@/utils/routeUtils';
import {
  Button,
  Chatbot,
  Footer,
  LanguageButton,
  MatomoTracker,
  MenuButton,
  NavigationBar,
  NoteStack,
  SkipLink,
  useMediaQueries,
  useNoteStack,
  UserButton,
} from '@jod/design-system';
import { JodOpenInNew } from '@jod/design-system/icons';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link, NavLink, Outlet, ScrollRestoration, useLocation, useMatch } from 'react-router';
import { useShallow } from 'zustand/react/shallow';
import { LogoutFormContext } from '.';

const agents = {
  test: {
    fi: 'dea3919a-4f96-436e-a6bd-b24e4218da9f',
    sv: 'fdc65221-a280-48b3-9dbc-9dea053a9cb4',
    en: 'e78e5079-e789-4706-b0a2-e665eb87e7dd',
  },
  prod: {
    fi: '2c134474-326f-4456-9139-8e585a569a9a',
    sv: 'd41ea75b-628f-4420-9e4a-7431ffabb047',
    en: '37f50124-4dec-4cab-8bc6-f8d2ea5bfe21',
  },
};

const Root = () => {
  const {
    t,
    i18n: { language },
  } = useTranslation();
  const { note, clearNote } = useNoteStore(useShallow((state) => ({ note: state.note, clearNote: state.clearNote })));
  const [navMenuOpen, setNavMenuOpen] = React.useState(false);
  const [feedbackVisible, setFeedbackVisible] = React.useState(false);
  const [searchInputVisible, setSearchInputVisible] = React.useState(false);
  const [visibleBetaFeedback, setVisibleBetaFeedback] = React.useState(true);
  const { sm } = useMediaQueries();
  const location = useLocation();
  const { addNote, removeNote } = useNoteStack();
  const { generateLocalizedPath } = useLocalizedRoutes();

  const hostname = window.location.hostname;
  const { siteId, agent } = React.useMemo(() => {
    if (hostname === 'osaamispolku.fi') {
      return { siteId: 36, agent: agents.prod[language as keyof typeof agents.prod] };
    } else if (hostname === 'jodtestaus.fi') {
      return { siteId: 38, agent: agents.test[language as keyof typeof agents.test] };
    } else {
      return { siteId: 37, agent: agents.test[language as keyof typeof agents.test] };
    }
  }, [hostname, language]);

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

    addNote({
      title: note.title,
      description: note.description,
      variant: 'error',
      permanent: note.permanent ?? false,
      // Prevent multiple session-expired notes with fixed id
      id: note.description.includes('session-expired') ? 'session-expired' : undefined,
    });
    clearNote();
  }, [addNote, clearNote, note, t]);

  const showServiceName = sm || !searchInputVisible;

  React.useEffect(() => {
    if (visibleBetaFeedback) {
      addNote({
        title: t('beta.note.title'),
        description: t('beta.note.description'),
        variant: 'feedback',
        onCloseClick: () => {
          setVisibleBetaFeedback(false);
          removeNote('beta-feedback');
        },
        readMoreComponent: (
          <Button
            size="sm"
            variant="white"
            label={t('beta.note.to-feedback')}
            icon={<JodOpenInNew ariaLabel={t('external-link')} />}
            iconSide="right"
            linkComponent={getLinkTo('https://link.webropolsurveys.com/S/F27EA876E86B2D74', {
              useAnchor: true,
              target: '_blank',
            })}
          />
        ),
        permanent: false,
        id: 'beta-feedback',
      });
    }
  }, [t, addNote, visibleBetaFeedback, removeNote]);

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
              dataTestId="language-button"
              language={language as LangCode}
              supportedLanguageCodes={supportedLanguageCodes}
              generateLocalizedPath={generateLocalizedPath}
              LinkComponent={Link}
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
          showServiceBar
          serviceBarVariant="ohjaaja"
          serviceBarContent={
            <SearchBar searchInputVisible={searchInputVisible} setSearchInputVisible={setSearchInputVisible} />
          }
          serviceBarTitle={showServiceName ? t('service-name') : ' '}
        />
        <NoteStack showAllText={t('show-all')} />
      </header>
      <LogoutFormContext.Provider value={logoutForm.current}>
        <NavMenu open={navMenuOpen} onClose={() => setNavMenuOpen(false)} />
        <Outlet />
      </LogoutFormContext.Provider>
      <Chatbot
        agent={agent}
        language={language}
        header={t('chatbot.header')}
        openWindowText={t('chatbot.open-window-text')}
        agentName={t('chatbot.agent-name')}
        errorMessage={t('chatbot.error-message')}
        greeting={t('chatbot.greeting')}
        textInputPlaceholder={t('chatbot.text-input-placeholder')}
        waitingmessage={t('chatbot.waiting-message')}
        disclaimer={t('chatbot.disclaimer')}
      />
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
        dataTestId="footer"
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
