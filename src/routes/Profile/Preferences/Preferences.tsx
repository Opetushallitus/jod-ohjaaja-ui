import { MainLayout } from '@/components';
import { ProfileNavigation } from '@/components/MainLayout/ProfileNavigation';
import { LogoutFormContext } from '@/routes/Root';
import { Button, ConfirmDialog } from '@jod/design-system';
import React from 'react';
import { useTranslation } from 'react-i18next';

const DownloadLink = ({ children }: { children: React.ReactNode }) => (
  <a href={`${import.meta.env.BASE_URL}api/profiili/ohjaaja/vienti`}>{children}</a>
);

const Preferences = () => {
  const { t } = useTranslation();
  const logoutForm = React.useContext(LogoutFormContext);

  const deleteProfile = () => {
    const deletionInput = document.createElement('input');
    deletionInput.type = 'hidden';
    deletionInput.name = 'deletion';
    deletionInput.value = 'true';
    logoutForm?.appendChild(deletionInput);
    logoutForm?.submit();
  };

  return (
    <MainLayout navChildren={<ProfileNavigation />}>
      <div data-testid="preferences-route">
        <title>{t('profile.preferences.title')}</title>
        <h1 className="mb-5 text-heading-2 sm:text-heading-1" data-testid="preferences-title">
          {t('profile.preferences.title')}
        </h1>
        <section className="mb-8" data-testid="preferences-download">
          <h2 className="text-heading-2-mobile sm:text-heading-2 mb-3">{t('profile.preferences.download.title')}</h2>
          <p className="text-body-md mb-5">{t('profile.preferences.download.description')}</p>
          <Button
            variant="accent"
            serviceVariant="ohjaaja"
            label={t('profile.preferences.download.action')}
            LinkComponent={DownloadLink}
            data-testid="preferences-download-button"
          />
        </section>
        <section data-testid="preferences-delete-profile">
          <h2 className="text-heading-2-mobile sm:text-heading-2 mb-3">
            {t('profile.preferences.delete-profile.title')}
          </h2>
          <p className="text-body-md mb-5">{t('profile.preferences.delete-profile.description')}</p>
          <ConfirmDialog
            title={t('profile.preferences.delete-profile.action')}
            onConfirm={() => deleteProfile()}
            confirmText={t('delete')}
            cancelText={t('cancel')}
            variant="destructive"
            description={t('profile.preferences.delete-profile.confirm')}
          >
            {(showDialog: () => void) => (
              <Button
                variant="red-delete"
                label={t('profile.preferences.delete-profile.action')}
                onClick={showDialog}
                data-testid="preferences-delete-button"
              />
            )}
          </ConfirmDialog>
        </section>
      </div>
    </MainLayout>
  );
};

export default Preferences;
