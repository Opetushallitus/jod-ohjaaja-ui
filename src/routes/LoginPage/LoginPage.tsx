import { components } from '@/api/schema';
import { MainLayout } from '@/components';
import { ExternalLink } from '@/components/ExternalLink/ExternalLink';
import { useLoginLink } from '@/hooks/useLoginLink';
import { Button } from '@jod/design-system';
import { JodArrowRight } from '@jod/design-system/icons';
import React from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { useLocation, useNavigate, useRouteLoaderData } from 'react-router';

const ListItem = ({ children }: { children: React.ReactNode }) => <li className="list-disc ml-9 pl-1">{children}</li>;

const Link =
  (href: string) =>
  ({ children }: { children: React.ReactNode }) => <a href={href}>{children}</a>;

const LoginPage = () => {
  const {
    t,
    i18n: { language },
  } = useTranslation();
  const location = useLocation();

  const rootLoaderData = useRouteLoaderData('root') as components['schemas']['OhjaajaCsrfDto'];
  const navigate = useNavigate();

  const state = location.state;

  const loginLink = useLoginLink({
    callbackURL: state?.callbackURL
      ? `/${language}/${state?.callbackURL}`
      : `/${language}/${t('slugs.profile.index')}/${t('slugs.profile.front')}`,
  });
  // Redirect to root if already logged-in
  React.useEffect(() => {
    if (rootLoaderData) {
      navigate('/');
    }
  }, [rootLoaderData, navigate]);

  return (
    <MainLayout>
      <title>{t('profile.login-page.page-title')}</title>
      <h1 className="mb-6 text-heading-2 sm:text-heading-1" data-testid="login-title">
        {t('profile.login-page.title')}
      </h1>

      <div className="mb-8 text-body-md flex flex-col gap-7">
        <div>
          <p className="text-body-lg mb-3">{t('profile.login-page.description')}</p>
          <p className="font-arial">{t('profile.login-page.auth-description')}</p>
        </div>

        <div className="mb-3">
          <Button
            variant="accent"
            serviceVariant="ohjaaja"
            label={t('login')}
            LinkComponent={Link(loginLink)}
            data-testid="landing-login"
            iconSide="right"
            icon={<JodArrowRight />}
          />
        </div>

        <div>
          <h2 className="text-heading-2-mobile sm:text-heading-2 mb-3">{t('profile.login-page.profile')}</h2>
          <p className="font-arial mb-7">{t('profile.login-page.profile-description')}</p>

          <div className="font-arial">
            <p>{t('profile.login-page.profile-includes')}</p>
            <ul>
              <ListItem>{t('profile.login-page.list-1-item-1')}</ListItem>
              <ListItem>{t('profile.login-page.list-1-item-2')}</ListItem>
              <ListItem>{t('profile.login-page.list-1-item-3')}</ListItem>
            </ul>
          </div>
        </div>

        <div>
          <h2 className="text-heading-2-mobile sm:text-heading-2 mb-3">{t('profile.login-page.logged-in-features')}</h2>
          <div className="font-arial mb-8">
            <p>{t('profile.login-page.benefits-description')}</p>
            <ul>
              <ListItem>{t('profile.login-page.list-2-item-1')}</ListItem>
              <ListItem>{t('profile.login-page.list-2-item-2')}</ListItem>
            </ul>
          </div>
        </div>

        <p className="font-arial">
          <Trans
            i18nKey="profile.front.data-processing-info"
            components={{
              Link: (
                <ExternalLink
                  href={`/${language}/${t('slugs.privacy-and-cookies')}`}
                  className="font-poppins"
                  data-testid="profile-front-privacy-link"
                />
              ),
            }}
          />
        </p>
      </div>
    </MainLayout>
  );
};
export default LoginPage;
