import { useLoginLink } from '@/hooks/useLoginLink';
import { Button } from '@jod/design-system';
import { JodHome, JodUser } from '@jod/design-system/icons';
import { useTranslation } from 'react-i18next';
import { useRouteError } from 'react-router';

const ErrorBoundary = () => {
  const { t, i18n } = useTranslation();
  const loginLink = useLoginLink();
  const error = useRouteError() as Error;
  const title = t('error-boundary.title');
  const message =
    (error.message && i18n.exists(`error-boundary.${error.message}`) && t(`error-boundary.${error.message}`)) ||
    t('error-boundary.unexpected');

  return (
    <main
      role="main"
      id="jod-main"
      className="m-4 flex flex-col items-center justify-center gap-4"
      data-testid="error-boundary"
    >
      <title>{title}</title>
      <h1 className="text-heading-1" data-testid="error-boundary-title">
        {title}
      </h1>
      <p className="text-body-lg" data-testid="error-boundary-message">
        {message}
      </p>
      <div className="flex gap-4" data-testid="error-boundary-actions">
        <Button
          icon={<JodHome />}
          iconSide="left"
          label={t('return-home')}
          variant="accent"
          serviceVariant="ohjaaja"
          data-testid="error-boundary-home"
          /* eslint-disable-next-line react/no-unstable-nested-components */
          LinkComponent={({ children }: { children: React.ReactNode }) => (
            <a href={`/ohjaaja/${i18n.language}`}>{children}</a>
          )}
        />
        <Button
          icon={<JodUser />}
          iconSide="left"
          label={t('login')}
          variant="accent"
          serviceVariant="ohjaaja"
          data-testid="error-boundary-login"
          /* eslint-disable-next-line react/no-unstable-nested-components */
          LinkComponent={({ children }: { children: React.ReactNode }) => <a href={loginLink}>{children}</a>}
        />
      </div>
    </main>
  );
};

export default ErrorBoundary;
