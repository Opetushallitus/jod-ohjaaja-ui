import { MainLayout } from '@/components';
import { ProfileNavigation } from '@/components/MainLayout/ProfileNavigation';
import { LogoutFormContext } from '@/routes/Root';
import { useAuthStore } from '@/stores/useAuthStore';
import { useKiinnostuksetStore } from '@/stores/useKiinnostuksetStore';
import { useNoteStore } from '@/stores/useNoteStore';
import { useSuosikitStore } from '@/stores/useSuosikitStore';
import { Button, ConfirmDialog } from '@jod/design-system';
import React from 'react';
import { useTranslation } from 'react-i18next';

const Preferences = () => {
  const { t } = useTranslation();
  const logoutForm = React.useContext(LogoutFormContext);
  const fetchUser = useAuthStore((state) => state.fetchUser);
  const user = useAuthStore((state) => state.user);

  const deleteProfile = () => {
    const deletionInput = document.createElement('input');
    deletionInput.type = 'hidden';
    deletionInput.name = 'deletion';
    deletionInput.value = 'true';
    logoutForm?.appendChild(deletionInput);
    logoutForm?.submit();
  };

  // Normally, store clearing is triggered automatically on 401 responses.
  // However, if no such request occurs, we proactively clear the stores here as a fallback.
  const onSessionExpired = () => {
    useNoteStore.getState().setNote({
      title: t('error-boundary.title'),
      description: t('error-boundary.session-expired'),
      variant: 'error',
    });

    useSuosikitStore.getState().clearSuosikit();
    useKiinnostuksetStore.getState().clearKiinnostukset();
  };

  const onDownload = async () => {
    const user = await fetchUser();
    if (user) {
      globalThis.location.href = `${import.meta.env.BASE_URL}api/profiili/ohjaaja/vienti`;
    } else {
      onSessionExpired();
    }
  };

  const onDeleteUser = (showDialog: () => void) => async () => {
    const user = await fetchUser();
    if (user) {
      showDialog();
    } else {
      onSessionExpired();
    }
  };

  return (
    <MainLayout navChildren={<ProfileNavigation />}>
      <div data-testid="preferences-route">
        <title>{t('profile.preferences.title')}</title>
        <h1 className="text-heading-1-mobile lg:text-heading-1 mb-6" data-testid="preferences-title">
          {t('profile.preferences.title')}
        </h1>
        <p className="text-body-lg mb-8">{t('profile.preferences.ingress')}</p>
        <section className="mb-8" data-testid="preferences-download">
          <h2 className="text-heading-2-mobile sm:text-heading-2 mb-3">{t('profile.preferences.download.title')}</h2>
          <p className="text-body-md mb-5">{t('profile.preferences.download.description')}</p>
          <Button
            variant="accent"
            serviceVariant="ohjaaja"
            label={t('profile.preferences.download.action')}
            onClick={onDownload}
            data-testid="preferences-download-button"
            disabled={!user}
          />
        </section>
        <section data-testid="preferences-delete-profile">
          <h2 className="text-heading-2-mobile sm:text-heading-2 mb-3">
            {t('profile.preferences.delete-profile.title')}
          </h2>
          <p className="text-body-md mb-5">{t('profile.preferences.delete-profile.description')}</p>
          <ConfirmDialog
            title={t('profile.preferences.delete-profile.action')}
            onConfirm={deleteProfile}
            confirmText={t('delete')}
            cancelText={t('cancel')}
            variant="destructive"
            description={t('profile.preferences.delete-profile.confirm')}
          >
            {(showDialog: () => void) => (
              <Button
                variant="red-delete"
                label={t('profile.preferences.delete-profile.action')}
                onClick={onDeleteUser(showDialog)}
                data-testid="preferences-delete-button"
                disabled={!user}
              />
            )}
          </ConfirmDialog>
        </section>
      </div>
    </MainLayout>
  );
};

export default Preferences;
