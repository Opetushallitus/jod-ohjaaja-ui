import { Button } from '@jod/design-system';
import { JodHome } from '@jod/design-system/icons';
import { useTranslation } from 'react-i18next';

const NoMatch = () => {
  const {
    t,
    i18n: { language },
  } = useTranslation();
  const title = t('no-match.title');
  return (
    <main
      role="main"
      id="jod-main"
      className="m-4 flex flex-col items-center justify-center gap-4"
      data-testid="no-match"
    >
      <title>{title}</title>
      <h1 className="text-heading-1" data-testid="no-match-title">
        {title}
      </h1>
      <p className="text-body-lg" data-testid="no-match-description">
        {t('no-match.description')}
      </p>
      <Button
        icon={<JodHome />}
        iconSide="left"
        label={t('return-home')}
        variant="accent"
        serviceVariant="ohjaaja"
        data-testid="no-match-home-button"
        /* eslint-disable-next-line react/no-unstable-nested-components */
        linkComponent={({ children, className }) => (
          <a href={`/ohjaaja/${language}`} className={className}>
            {children}
          </a>
        )}
      />
    </main>
  );
};

export default NoMatch;
