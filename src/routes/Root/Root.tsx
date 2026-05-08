import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Link,
  NavLink,
  Outlet,
  ScrollRestoration,
  useFetcher,
  useLocation,
  useMatch,
  useRouteLoaderData,
} from 'react-router';

import {
  Button,
  Chatbot,
  CookieConsentProvider,
  Footer,
  LanguageButton,
  MatomoTracker,
  MenuButton,
  NavigationBar,
  SkipLink,
  useCookieConsent,
  useMediaQueries,
  useNoteStack,
  UserButton,
} from '@jod/design-system';

import { components } from '@/api/schema';
import { FeedbackModal } from '@/components';
import { NavMenu } from '@/components/NavMenu/NavMenu';
import { SearchBar } from '@/components/SearchBar/SearchBar';
import { Toaster } from '@/components/Toaster/Toaster';
import { useLocalizedRoutes } from '@/hooks/useLocalizedRoutes';
import { useLoginLink } from '@/hooks/useLoginLink';
import { useSessionManagerNotifications } from '@/hooks/useSessionManagerNotifications';
import i18n, { LangCode, langLabels, supportedLanguageCodes } from '@/i18n/config';
import { useOhjaajaProfile } from '@/stores/useSessionManagerStore';
import { getNotifications } from '@/utils/notifications';
import { getLinkTo } from '@/utils/routeUtils';

import { LogoutFormContext } from '.';

const LanguageButtonWrapper = ({ responsive }: { responsive?: boolean }) => {
  const {
    i18n: { language },
  } = useTranslation();
  const { generateLocalizedPath } = useLocalizedRoutes();
  return (
    <LanguageButton
      serviceVariant="ohjaaja"
      testId="language-button"
      language={language as LangCode}
      supportedLanguageCodes={supportedLanguageCodes}
      generateLocalizedPath={generateLocalizedPath}
      linkComponent={Link}
      responsive={responsive}
      translations={{
        fi: { change: 'Vaihda kieli.', label: langLabels.fi },
        sv: { change: 'Andra språk.', label: langLabels.sv },
        en: { change: 'Change language.', label: langLabels.en },
      }}
    />
  );
};

const Root = () => {
  const {
    t,
    i18n: { language },
  } = useTranslation();
  const fetcher = useFetcher();
  const [navMenuOpen, setNavMenuOpen] = React.useState(false);
  const [feedbackVisible, setFeedbackVisible] = React.useState(false);
  const [searchInputVisible, setSearchInputVisible] = React.useState(false);
  const { sm } = useMediaQueries();
  const location = useLocation();
  const { addPermanentNote, addTemporaryNote, removeTemporaryNote, removePermanentNote } = useNoteStack();

  const loginLink = useLoginLink({ callbackURL: location.pathname + location.search + location.hash });

  const hostname = globalThis.location.hostname;
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
      href: `/${language}/${t('common:slugs.about-service')}`,
      label: t('common:footer.more-info-links.about-service'),
    },
    {
      href: `/${language}/${t('common:slugs.privacy-and-cookies')}`,
      label: t('common:footer.more-info-links.privacy-and-cookies'),
    },
    {
      href: `/${language}/${t('common:slugs.data-sources')}`,
      label: t('common:footer.more-info-links.data-sources'),
    },
    {
      href: `/${language}/${t('common:slugs.ai-usage')}`,
      label: t('common:footer.more-info-links.ai-usage'),
    },
    {
      href: `/${language}/${t('common:slugs.accessibility')}`,
      label: t('common:footer.more-info-links.accessibility'),
    },
  ];

  const socialMedia: React.ComponentProps<typeof Footer>['socialMedia'] = {
    facebook: {
      href: 'https://www.facebook.com/osaamispolku',
      label: t('common:footer.social-media.facebook'),
    },
    instagram: {
      href: 'https://www.instagram.com/osaamispolku/',
      label: t('common:footer.social-media.instagram'),
    },
    linkedin: {
      href: 'https://www.linkedin.com/company/osaamispolku',
      label: t('common:footer.social-media.linkedin'),
    },
  };

  const logoutForm = React.useRef<HTMLFormElement>(null);

  const rootLoaderData = useRouteLoaderData('root') as components['schemas']['OhjaajaCsrfDto'] | null | undefined;
  const user = useOhjaajaProfile();

  const isProfileActive = !!useMatch(`/${language}/${t('slugs.profile.index')}/*`);
  const isOnSearchPage = useMatch(`/${language}/${t('slugs.search')}/*`);

  useSessionManagerNotifications({
    data: rootLoaderData,
    language,
    t,
    loginLink,
    isOnProtectedRoute: isProfileActive,
    reloadRoot: async () => {
      await fetcher.load(`/${language}`);
    },
    addPermanentNote,
    removePermanentNote,
    addTemporaryNote,
    removeTemporaryNote,
  });

  const logout = () => {
    logoutForm.current?.submit();
  };

  React.useEffect(() => {
    document.documentElement.setAttribute('lang', i18n.language);
    // oxlint-disable-next-line eslint-plugin-react-hooks/exhaustive-deps
  }, [i18n.language]);

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

  const { open: openCookieConsent } = useCookieConsent();

  return (
    <>
      <link rel="manifest" href={`/manifest-${language}.json`} crossOrigin="use-credentials" />
      <header role="banner" className="sticky top-0 z-30 print:hidden" data-testid="app-header">
        <SkipLink hash="#jod-main" label={t('common:skiplinks.main')} />
        <form action="/ohjaaja/logout" method="POST" hidden ref={logoutForm}>
          <input type="hidden" name="_csrf" value={user?.csrf.token ?? ''} />
          <input type="hidden" name="lang" value={language} />
        </form>
        <NavigationBar
          logo={{ to: `/${language}`, language, srText: t('common:osaamispolku') }}
          menuComponent={<MenuButton label={t('common:menu')} onClick={() => setNavMenuOpen(!navMenuOpen)} />}
          languageButtonComponent={<LanguageButtonWrapper />}
          userButtonComponent={
            <UserButton
              serviceVariant="ohjaaja"
              firstName={user?.etunimi}
              isProfileActive={isProfileActive}
              profileLabel={t('profile.index')}
              profileLinkComponent={(props) => <NavLink to={t('slugs.profile.index')} {...props} />}
              isLoggedIn={!!user}
              loginLabel={t('common:login')}
              loginLinkComponent={(props) => <NavLink to={`/${language}/${t('slugs.profile.login')}`} {...props} />}
              logoutLabel={t('common:logout')}
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
            !isOnSearchPage && (
              <SearchBar searchInputVisible={searchInputVisible} setSearchInputVisible={setSearchInputVisible} />
            )
          }
          translations={{
            showAllNotesLabel: t('common:show-all'),
            ariaLabelCloseNote: t('common:note.close'),
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
        okmLabel={t('common:footer.logos.okm-label')}
        temLabel={t('common:footer.logos.tem-label')}
        ophLabel={t('common:footer.logos.oph-label')}
        kehaLabel={t('common:footer.logos.keha-label')}
        cooperationTitle={t('common:footer.cooperation-title')}
        fundingTitle={t('common:footer.funding-title')}
        moreInfoTitle={t('common:footer.more-info-title')}
        moreInfoDescription={t('common:footer.more-info-description')}
        moreInfoLinks={moreInfoLinks}
        feedbackTitle={t('common:footer.feedback-title')}
        feedbackContent={t('common:footer.feedback-content')}
        feedbackButtonLabel={t('common:footer.feedback-button-label')}
        feedbackOnClick={() => setFeedbackVisible(true)}
        feedbackBgImageClassName="bg-[url(@/../assets/feedback.jpg)] bg-cover bg-[50%_50%]"
        copyright={t('common:footer.copyright')}
        socialMedia={socialMedia}
        externalLinkIconAriaLabel={t('common:external-link')}
        testId="footer"
        cookieSettingsLabel={t('common:footer.cookie-settings-label')}
        onCookieSettingsClick={() => openCookieConsent()}
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

const RootWithCookieConsentProvider = () => {
  const { t } = useTranslation();

  return (
    <CookieConsentProvider
      serviceVariant="ohjaaja"
      languageButtonComponent={<LanguageButtonWrapper responsive={false} />}
      translations={{
        guard: {
          buttonLabel: t('common:cookie-consent.guard.buttonLabel'),
          description: t('common:cookie-consent.guard.description'),
          title: t('common:cookie-consent.guard.title'),
        },
        modal: {
          acceptAllLabel: t('common:cookie-consent.modal.acceptAllLabel'),
          cookiesCategoriesNecessary: t('common:cookie-consent.modal.cookiesCategoriesNecessary'),
          cookiesCategoriesThirdParty: t('common:cookie-consent.modal.cookiesCategoriesThirdParty'),
          cookieCategoriesLabel: t('common:cookie-consent.modal.cookieCategoriesLabel'),
          currentSelectionLabel: t('common:cookie-consent.modal.currentSelectionLabel'),
          declineOptionalLabel: t('common:cookie-consent.modal.declineOptionalLabel'),
          description: t('common:cookie-consent.modal.description'),
          name: t('common:cookie-consent.modal.name'),
          readMoreHref: t('common:cookie-consent.modal.readMoreHref'),
          readMoreLabel: t('common:cookie-consent.modal.readMoreLabel'),
          externalLinkIconAriaLabel: t('common:external-link'),
          statisticsDescription: t('common:cookie-consent.modal.statisticsDescription'),
          title: t('common:cookie-consent.modal.title'),
        },
      }}
    >
      <Root />
    </CookieConsentProvider>
  );
};

export default RootWithCookieConsentProvider;
