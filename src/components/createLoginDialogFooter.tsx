import { Button } from '@jod/design-system';

import { getLinkTo } from '@/utils/routeUtils';

/** Creates a footer component to use with DS ConfirmDialog, used for dialogs that require user to log in before proceeding. */
export const createLoginDialogFooter = (t: (key: string) => string, loginLink: string, onClose?: () => void) => {
  const ConfirmDialogLoginFooter = (hideDialog: () => void) => {
    return (
      <div className="flex flex-1 gap-4">
        <div className="flex flex-1 justify-end gap-4">
          <Button
            label={t('common:cancel')}
            variant="white"
            serviceVariant="ohjaaja"
            onClick={() => {
              hideDialog();
              onClose?.();
            }}
            className="whitespace-nowrap"
            data-testid="login-dialog-cancel"
          />
          <Button
            label={t('common:login')}
            variant="accent"
            serviceVariant="ohjaaja"
            linkComponent={getLinkTo(loginLink, { useAnchor: true })}
            className="whitespace-nowrap"
            data-testid="login-dialog-login"
          />
        </div>
      </div>
    );
  };

  return ConfirmDialogLoginFooter;
};
