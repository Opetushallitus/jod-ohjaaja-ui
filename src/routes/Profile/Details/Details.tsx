import { MainLayout } from '@/components';
import { ProfileNavigation } from '@/components/MainLayout/ProfileNavigation';
import { useTags } from '@/hooks/useTags';
import { useKiinnostuksetStore } from '@/stores/useKiinnostuksetStore';
import { Checkbox } from '@jod/design-system';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useLoaderData } from 'react-router';
import { useShallow } from 'zustand/react/shallow';
import { LoaderData } from './loader';

const Details = () => {
  const { t } = useTranslation();
  const { firstName, lastName } = useLoaderData<LoaderData>();
  const { tags } = useTags();
  const [kiinnostukset, toggleKiinnostus] = useKiinnostuksetStore(
    useShallow((state) => [state.kiinnostukset, state.toggleKiinnostus]),
  );

  const isSelected = React.useCallback(
    (tagId: number) => {
      return kiinnostukset.some((tag) => tag.asiasanaId === tagId);
    },
    [kiinnostukset],
  );

  const handleTagSelectionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    toggleKiinnostus(Number(event.target.value));
  };

  return (
    <MainLayout navChildren={<ProfileNavigation />}>
      <div>
        <h1 className="text-heading-1-mobile lg:text-heading-1  lg:mb-7">
          {t('profile.details.greeting', {
            firstName,
            lastName,
          })}
        </h1>
        <h2 className="text-heading-2 mb-6">{t('profile.details.interest.title')}</h2>
        <p className="text-body-md mb-6">{t('profile.details.interest.description')}</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-5">
          {tags.map((tag) => (
            <Checkbox
              key={tag.id}
              name={`${tag.id}`}
              value={`${tag.id}`}
              label={tag.name}
              ariaLabel={tag.name}
              checked={isSelected(tag.id)}
              onChange={handleTagSelectionChange}
              variant="bordered"
            />
          ))}
        </div>
      </div>
    </MainLayout>
  );
};
export default Details;
