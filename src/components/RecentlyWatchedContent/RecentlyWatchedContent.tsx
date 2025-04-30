import { ContentCard } from '@jod/design-system';
import React from 'react';
import { useTranslation } from 'react-i18next';

export const RecentlyWatchedContent = () => {
  const { t } = useTranslation();
  return (
    <>
      <h2 className="col-span-3 text-heading-2-mobile sm:text-heading-2 mb-5">{t('recently-watched-contents')}</h2>

      <div className="col-span-3 lg:col-span-2 rounded bg-white p-6">
        {Array.from({ length: 4 }, (_, index) => (
          <React.Fragment key={index}>
            <ContentCard
              title="Lorem ipsum dolor"
              description="Mauris sed libero. Suspendisse facilisis nulla in lacinia laoreet, lorem velit osana ei osaa sanoa mitä accumsan dolor nonummy."
              path={['Teema', 'Osio']}
              tags={[
                { label: 'Asiasana 1', to: '#' },
                { label: 'Asiasana 2', to: '#' },
                { label: 'Asiasana 3', to: '#' },
              ]}
            />
            {index < 3 && <hr className="border-border-gray" />}
          </React.Fragment>
        ))}
      </div>
    </>
  );
};
