import { MainLayout } from '@/components';
import { ProfileNavigation } from '@/components/MainLayout/ProfileNavigation';
import { LogoutFormContext } from '@/routes/Root';
import { Button, ConfirmDialog, Toggle } from '@jod/design-system';
import React from 'react';
import { useTranslation } from 'react-i18next';

const DownloadLink = ({ children }: { children: React.ReactNode }) => (
  <a href={`${import.meta.env.BASE_URL}api/profiili/ohjaaja/vienti`}>{children}</a>
);

const disclosureOfData = [
  'teaching-evaluation',
  'evaluation-of-education',
  'competence-assessment',
  'research',
  'development',
  'statistics-and-monitoring',
  'guidance-and-planning',
  'archiving',
];

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
      <title>{t('profile.preferences.title')}</title>
      <h1 className="mb-5 text-heading-2 sm:text-heading-1">{t('profile.preferences.title')}</h1>

      <div className="mb-8 text-body-md flex flex-col gap-7">
        <p>{t('profile.preferences.description')}</p>
      </div>
      <section className="mb-8">
        <h3 className="mb-3 text-heading-3">{t('profile.preferences.disclosure-of-data.title')}</h3>
        <p className="text-body-md mb-5">{t('profile.preferences.disclosure-of-data.description')}</p>
        <div className="grid grid-cols-1 gap-5 bg-todo">
          <p>TODO</p>
          {disclosureOfData.map((data, index) => (
            <React.Fragment key={data}>
              <SettingsRow
                title={t(`profile.preferences.disclosure-of-data.${data}.title`)}
                description={t(`profile.preferences.disclosure-of-data.${data}.description`)}
                isSelected={false}
                onChange={() => {}}
              />
              {index < disclosureOfData.length - 1 && <hr className="border-border-gray" />}
            </React.Fragment>
          ))}
        </div>
      </section>
      <section className="mb-8">
        <h2 className="text-heading-2-mobile sm:text-heading-2 mb-3">{t('profile.preferences.download.title')}</h2>
        <p className="text-body-md mb-5">{t('profile.preferences.download.description')}</p>
        <Button variant="accent" label={t('profile.preferences.download.action')} LinkComponent={DownloadLink} />
      </section>
      <section>
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
            <Button variant="red-delete" label={t('profile.preferences.delete-profile.action')} onClick={showDialog} />
          )}
        </ConfirmDialog>
      </section>
    </MainLayout>
  );
};
interface SettingsRowProps {
  title: string;
  description: string;
  isSelected: boolean;
  onChange: () => void;
}

const SettingsRow = ({ title, description, isSelected, onChange }: SettingsRowProps) => (
  <div className="grid grid-cols-2 items-center place-items-end">
    <div className="place-self-start">
      <h4 className="text-heading-4 mb-2">{title}</h4>
      <p className="text-body-md">{description}</p>
    </div>
    <Toggle ariaLabel={title} onChange={onChange} checked={isSelected}></Toggle>
  </div>
);

export default Preferences;
