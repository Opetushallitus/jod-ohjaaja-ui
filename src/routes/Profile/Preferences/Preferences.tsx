import { MainLayout } from '@/components';
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
    <MainLayout>
      <title>{t('profile.preferences.title')}</title>
      <h1 className="mb-5 text-heading-2 sm:text-heading-1">{t('preferences.title')}</h1>
      <div className="mb-8 text-body-md flex flex-col gap-7">
        <p className="bg-todo">{t('preferences.description')}</p>
      </div>
      <section className="mb-8">
        <h2 className="text-heading-2-mobile sm:text-heading-2 mb-3">{t('preferences.download.title')}</h2>
        <p className="text-body-md mb-5">{t('preferences.download.description')}</p>
        <Button variant="accent" label={t('preferences.download.action')} LinkComponent={DownloadLink} />
      </section>
      <section>
        <h2 className="text-heading-2-mobile sm:text-heading-2 mb-3">{t('preferences.delete-profile.title')}</h2>
        <p className="text-body-md mb-5">{t('preferences.delete-profile.description')}</p>
        <ConfirmDialog
          title={t('preferences.delete-profile.action')}
          onConfirm={() => deleteProfile()}
          confirmText={t('delete')}
          cancelText={t('cancel')}
          variant="destructive"
          description={t('preferences.delete-profile.confirm')}
        >
          {(showDialog: () => void) => (
            <Button variant="white-delete" label={t('preferences.delete-profile.action')} onClick={showDialog} />
          )}
        </ConfirmDialog>
      </section>
    </MainLayout>
  );
};

export default Preferences;
