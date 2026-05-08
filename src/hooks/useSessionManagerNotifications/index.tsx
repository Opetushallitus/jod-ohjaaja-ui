import React from 'react';
import { useShallow } from 'zustand/shallow';

import { Button, useNoteStack } from '@jod/design-system';

import { useKiinnostuksetStore } from '@/stores/useKiinnostuksetStore';
import { isSessionExpiredState, isSessionValidState, useSessionManagerStore } from '@/stores/useSessionManagerStore';
import { useSuosikitStore } from '@/stores/useSuosikitStore';
import type { OhjaajaCsrfDto } from '@/types/auth';
import { getLinkTo } from '@/utils/routeUtils';

type NoteActions = Pick<
  ReturnType<typeof useNoteStack>,
  'addPermanentNote' | 'removePermanentNote' | 'addTemporaryNote' | 'removeTemporaryNote'
>;

export interface UseSessionManagerNotificationsOptions extends NoteActions {
  data: OhjaajaCsrfDto | null | undefined;
  language: string;
  t: (key: string) => string;
  loginLink: string;
  isOnProtectedRoute: boolean;
  /** Optional root revalidation after server-side session loss (e.g. timer). */
  reloadRoot?: () => Promise<void>;
}

export const useSessionManagerNotifications = (options: UseSessionManagerNotificationsOptions) => {
  const optsRef = React.useRef(options);

  React.useLayoutEffect(() => {
    optsRef.current = options;
  });

  const { data } = options;
  const loaderSessionKey = `${data?.csrf?.token ?? ''}|${data?.etunimi ?? ''}|${data?.sukunimi ?? ''}`;

  const { initializeFromLoader, start, stop, setOnWarning, setOnExpired, setOnSessionExtended } =
    useSessionManagerStore(
      useShallow((state) => ({
        initializeFromLoader: state.initializeFromLoader,
        start: state.start,
        stop: state.stop,
        setOnWarning: state.setOnWarning,
        setOnExpired: state.setOnExpired,
        setOnSessionExtended: state.setOnSessionExtended,
      })),
    );

  React.useEffect(() => {
    const dataFromLoader = optsRef.current.data;
    const session = useSessionManagerStore.getState();
    // After timer expiry, `reloadRoot` yields null loader data; do not overwrite client `expired`+`disabled`
    // with `anonymous`, or session-guarded actions would stop seeing an expired session.
    if (!dataFromLoader && isSessionExpiredState(session.status) && session.disabled) {
      return;
    }
    initializeFromLoader(dataFromLoader);
  }, [initializeFromLoader, loaderSessionKey]);

  React.useEffect(() => {
    const warningId = 'session-expiration-warning';
    const expiredId = 'session-expired';

    const handleWarningContinue = async () => {
      optsRef.current.removeTemporaryNote(warningId);
      await useSessionManagerStore.getState().validateSession(true);
    };

    const handleExpiredContinue = () => {
      useSessionManagerStore.getState().disable();
      const { removePermanentNote, isOnProtectedRoute, language } = optsRef.current;
      removePermanentNote(expiredId);
      if (isOnProtectedRoute) {
        globalThis.location.replace(globalThis.location.origin + `/ohjaaja/${language}`);
        return;
      }
      globalThis.location.reload();
    };

    setOnSessionExtended(() => {
      setTimeout(() => {
        optsRef.current.removeTemporaryNote(warningId);
        optsRef.current.removePermanentNote(expiredId);
      }, 50);
    });

    setOnWarning(() => {
      if (!isSessionValidState(useSessionManagerStore.getState().status)) {
        return;
      }
      const { addTemporaryNote, t } = optsRef.current;
      addTemporaryNote(() => ({
        id: warningId,
        title: t('common:session.warning.note.title'),
        description: t('common:session.warning.note.description'),
        variant: 'warning',
        readMoreComponent: (
          <Button
            size="sm"
            variant="white"
            label={t('common:session.warning.continue')}
            onClick={handleWarningContinue}
          />
        ),
        isCollapsed: false,
      }));
    });

    setOnExpired(async (reason) => {
      const { removeTemporaryNote, addPermanentNote, t, loginLink, reloadRoot } = optsRef.current;
      removeTemporaryNote(warningId);
      if (reason === 'logout') {
        optsRef.current.removePermanentNote(expiredId);
        return;
      }
      useSuosikitStore.getState().clearSuosikit();
      useKiinnostuksetStore.getState().clearKiinnostukset();
      if (reloadRoot) {
        await reloadRoot();
      }
      addPermanentNote(() => ({
        id: expiredId,
        title: t('common:session.expired.note.title'),
        description: t('common:session.expired.note.description'),
        variant: 'error',
        readMoreComponent: (
          <div className="flex gap-4">
            <Button
              size="sm"
              variant="white"
              label={t('common:session.expired.login')}
              linkComponent={getLinkTo(loginLink, { useAnchor: true })}
            />
            <Button
              size="sm"
              variant="white"
              label={t('common:session.expired.continue')}
              onClick={handleExpiredContinue}
            />
          </div>
        ),
      }));
    });

    start();

    return () => {
      setOnWarning(undefined);
      setOnExpired(undefined);
      setOnSessionExtended(undefined);
      stop();
    };
  }, [setOnExpired, setOnSessionExtended, setOnWarning, start, stop]);
};
