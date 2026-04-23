import { useShowSessionExpiredDialog } from '@/hooks/useShowSessionExpiredDialog';
import { storeHasActiveOhjaajaSession, useSessionManagerStore } from '@/stores/useSessionManagerStore';

/**
 * Returns a function that wraps any action with a session expiration check.
 * If there is no active ohjaaja session (expired, anonymous after expiry, etc.), the session expired dialog is shown instead of executing the action.
 *
 * For interactions that only show the dialog (no follow-up action), use {@link useShowSessionExpiredDialog}.
 *
 * @returns A function that takes an action and its parameters, returning a handler function.
 *
 * @example
 * onClick={guardedAction(showDialog, deleteDialogProps)}
 * onClick={guardedAction(showModal, NewShareLinkModal, { id: linkki.id })}
 */
export const useSessionGuardedAction = () => {
  const showSessionExpiredDialog = useShowSessionExpiredDialog();

  return <Args extends unknown[]>(action: (...args: Args) => void | Promise<void>, ...params: Args) => {
    return () => {
      if (!storeHasActiveOhjaajaSession(useSessionManagerStore.getState())) {
        showSessionExpiredDialog();
        return;
      }
      action(...params);
    };
  };
};
