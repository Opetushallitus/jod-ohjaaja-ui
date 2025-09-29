import { components } from '@/api/schema';
import { MainLayout } from '@/components';
import { ExternalLink } from '@/components/ExternalLink/ExternalLink';
import { ProfileNavigation } from '@/components/MainLayout/ProfileNavigation';
import React from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { useRouteLoaderData } from 'react-router';

const ListItem = ({ children }: { children: React.ReactNode }) => <li className="list-disc ml-9 pl-1">{children}</li>;

const ProfileFront = () => {
  const {
    t,
    i18n: { language },
  } = useTranslation();

  const { etunimi } = useRouteLoaderData('root') as components['schemas']['OhjaajaCsrfDto'];
  const navChildren = React.useMemo(() => <ProfileNavigation />, []);

  return (
    <MainLayout navChildren={navChildren}>
      <title>{t('profile.front.title')}</title>
      <h1 className="text-heading-1-mobile lg:text-heading-1 mb-6" data-testid="profile-front-title">
        {t('profile.front.greeting', {
          etunimi,
        })}
      </h1>

      <div className="mb-8 text-body-md flex flex-col gap-7">
        <p className="text-body-lg">{t('profile.front.you-are-signed-in')}</p>
        <div className="font-arial">
          <p>{t('profile.front.profile-description')}</p>
          <ul>
            <ListItem>{t('profile.front.list-1-item-1')}</ListItem>
            <ListItem>{t('profile.front.list-1-item-2')}</ListItem>
            <ListItem>{t('profile.front.list-1-item-3')}</ListItem>
            <ListItem>{t('profile.front.list-1-item-4')}</ListItem>
          </ul>
        </div>
        <div className="font-arial">
          <p>{t('profile.front.logged-in-features-intro')}</p>
          <ul>
            <ListItem>{t('profile.front.list-2-item-1')}</ListItem>
            <ListItem>{t('profile.front.list-2-item-2')}</ListItem>
          </ul>
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

export default ProfileFront;
