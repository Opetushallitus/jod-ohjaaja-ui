import { client } from '@/api/client';
import { components } from '@/api/schema';
import { MainLayout } from '@/components';
import { ProfileNavigation } from '@/components/MainLayout/ProfileNavigation';
import { useTags } from '@/hooks/useTags';
import { useKiinnostuksetStore } from '@/stores/useKiinnostuksetStore';
import { Checkbox, Select } from '@jod/design-system';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useLoaderData } from 'react-router';
import { useShallow } from 'zustand/react/shallow';
import { LoaderData } from './loader';

const isTyoskentelyPaikka = (
  value: string | undefined,
): value is components['schemas']['OhjaajaDto']['tyoskentelyPaikka'] => {
  return [
    'PERUSASTE',
    'TOINEN_ASTE',
    'KORKEAKOULU',
    'AIKUISKOULUTUS',
    'TYOLLISYYSPALVELUT',
    'KOLMAS_SEKTORI',
    'YKSITYINEN',
    'MUU',
    undefined,
  ].includes(value);
};

const Details = () => {
  const { t } = useTranslation();
  const { firstName, lastName, tyoskentelyPaikka } = useLoaderData<LoaderData>();
  const { tags } = useTags();
  const [kiinnostukset, toggleKiinnostus] = useKiinnostuksetStore(
    useShallow((state) => [state.kiinnostukset, state.toggleKiinnostus]),
  );
  const [currentTyoskentelyPaikka, setCurrentTyoskentelyPaikka] = React.useState(tyoskentelyPaikka);

  const isSelected = React.useCallback(
    (tagId: number) => {
      return kiinnostukset.some((tag) => tag.asiasanaId === tagId);
    },
    [kiinnostukset],
  );

  const handleTagSelectionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    toggleKiinnostus(Number(event.target.value));
  };

  const handleWorkplaceChange = async (value: string) => {
    if (isTyoskentelyPaikka(value)) {
      await client.PUT('/api/profiili/ohjaaja', { body: { tyoskentelyPaikka: value } });
      setCurrentTyoskentelyPaikka(value);
    }
  };

  return (
    <MainLayout navChildren={<ProfileNavigation />}>
      <title>{t('profile.details.title')}</title>
      <div data-testid="profile-details">
        <h1 className="text-heading-1-mobile lg:text-heading-1  lg:mb-7" data-testid="profile-details-greeting">
          {t('profile.details.greeting', {
            firstName,
            lastName,
          })}
        </h1>
        <section className="mb-8" data-testid="profile-details-introduction">
          <h2 className="text-heading-2 mb-6" data-testid="profile-details-intro-title">
            {t('profile.details.introduction.title')}
          </h2>
          <p className="text-body-md mb-6" data-testid="profile-details-intro-description">
            {t('profile.details.introduction.description')}
          </p>
          <Select
            label={t('profile.details.workplace.label')}
            placeholder={t('profile.details.workplace.placeholder')}
            selected={currentTyoskentelyPaikka ?? ''}
            options={[
              { value: 'PERUSASTE', label: t('profile.details.workplace.option1') },
              { value: 'TOINEN_ASTE', label: t('profile.details.workplace.option2') },
              { value: 'KORKEAKOULU', label: t('profile.details.workplace.option3') },
              { value: 'AIKUISKOULUTUS', label: t('profile.details.workplace.option4') },
              { value: 'TYOLLISYYSPALVELUT', label: t('profile.details.workplace.option5') },
              { value: 'KOLMAS_SEKTORI', label: t('profile.details.workplace.option6') },
              { value: 'YKSITYINEN', label: t('profile.details.workplace.option7') },
              { value: 'MUU', label: t('profile.details.workplace.option8') },
            ]}
            onChange={handleWorkplaceChange}
            data-testid="profile-details-workplace"
          />
        </section>
        <section data-testid="profile-details-interests">
          <h2 className="text-heading-2 mb-6" data-testid="profile-details-interests-title">
            {t('profile.details.interest.title')}
          </h2>
          <p className="text-body-md mb-6" data-testid="profile-details-interests-description">
            {t('profile.details.interest.description')}
          </p>
          <div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-5"
            data-testid="profile-details-interests-list"
          >
            {tags.map((tag) => (
              <Checkbox
                key={tag.id}
                name={`${tag.id}`}
                value={`${tag.id}`}
                label={tag.name}
                ariaLabel={tag.name}
                checked={isSelected(tag.id)}
                onChange={handleTagSelectionChange}
                data-testid={`profile-interest-${tag.id}`}
              />
            ))}
          </div>
        </section>
      </div>
    </MainLayout>
  );
};
export default Details;
