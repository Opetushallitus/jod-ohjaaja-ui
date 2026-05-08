import React from 'react';
import { useTranslation } from 'react-i18next';

import { Button } from '@jod/design-system';

import { MainLayout } from '@/components';
import { ProfileNavigation } from '@/components/MainLayout/ProfileNavigation';
import { useModal } from '@/hooks/useModal';
import { useSessionGuardedAction } from '@/hooks/useSessionGuardedAction';
import { LogoutFormContext } from '@/routes/Root';
import { useSessionManagerStore } from '@/stores/useSessionManagerStore';

const navigateToProfileExport = () => {
  globalThis.location.assign(`${import.meta.env.BASE_URL}api/profiili/ohjaaja/vienti`);
};

const Preferences = () => {
  const { t } = useTranslation();
  const logoutForm = React.useContext(LogoutFormContext);
  const syncOhjaajaFromServer = useSessionManagerStore((state) => state.syncOhjaajaFromServer);
  const { showDialog } = useModal();
  const guardedAction = useSessionGuardedAction();

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
    useSessionManagerStore.getState().silentInvalidateAcrossTabs();
  };

  const onDownload = async () => {
    const user = await syncOhjaajaFromServer(true);
    if (user) {
      navigateToProfileExport();
    } else {
      onSessionExpired();
    }
  };

  const onDeleteUser = async () => {
    const user = await syncOhjaajaFromServer(true);
    if (user) {
      showDialog({
        title: t('profile.preferences.delete-profile.action'),
        onConfirm: deleteProfile,
        confirmText: t('common:delete'),
        cancelText: t('common:cancel'),
        variant: 'destructive',
        description: t('profile.preferences.delete-profile.confirm'),
      });
    } else {
      onSessionExpired();
    }
  };

  return (
    <MainLayout navChildren={<ProfileNavigation />}>
      <div data-testid="preferences-route">
        <title>{t('profile.preferences.title')}</title>
        <h1 className="mb-6 text-heading-1-mobile lg:text-heading-1" data-testid="preferences-title">
          {t('profile.preferences.title')}
        </h1>
        <p className="mb-8 text-body-lg">{t('profile.preferences.ingress')}</p>
        <section className="mb-8" data-testid="preferences-download">
          <h2 className="mb-3 text-heading-2-mobile sm:text-heading-2">{t('profile.preferences.download.title')}</h2>
          <p className="mb-5 text-body-md">{t('profile.preferences.download.description')}</p>
          <Button
            variant="accent"
            serviceVariant="ohjaaja"
            label={t('profile.preferences.download.action')}
            onClick={guardedAction(onDownload)}
            data-testid="preferences-download-button"
          />
        </section>
        <section data-testid="preferences-delete-profile">
          <h2 className="mb-3 text-heading-2-mobile sm:text-heading-2">
            {t('profile.preferences.delete-profile.title')}
          </h2>
          <p className="mb-5 text-body-md">{t('profile.preferences.delete-profile.description')}</p>

          <Button
            variant="red-delete"
            label={t('profile.preferences.delete-profile.action')}
            onClick={guardedAction(onDeleteUser)}
            data-testid="preferences-delete-button"
          />
        </section>
      </div>
    </MainLayout>
  );
};

export default Preferences;
