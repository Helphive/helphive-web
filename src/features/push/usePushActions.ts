import { useCallback } from 'react';
import { useSnackbar } from '@/components/feedback/snackbarContext';
import { disablePush, enablePush } from './pushSession';

/** The two buttons (settings row and soft prompt) with the same words after each result. */
export function usePushActions() {
    const snackbar = useSnackbar();

    const turnOn = useCallback(async () => {
        const result = await enablePush();
        if (result === 'on') snackbar.success('Notifications are on for this browser.');
        else if (result === 'blocked') {
            snackbar.error(
                'Notifications are blocked in this browser. See the steps in your profile.'
            );
        } else if (result === 'dismissed') {
            snackbar.notify(
                'Notifications are still off. You can turn them on any time in your profile.',
                'info'
            );
        } else if (result === 'unreachable') {
            snackbar.error(
                "Couldn't reach the notification service. If you use an ad or tracker blocker, allow it for this site, then try again."
            );
        } else snackbar.error("Couldn't turn on notifications. Please try again in a moment.");
        return result;
    }, [snackbar]);

    const turnOff = useCallback(async () => {
        const ok = await disablePush();
        if (ok) snackbar.success('Notifications are off for this browser.');
        else {
            snackbar.notify(
                "Notifications are off in this browser, but we couldn't reach HelpHive to confirm.",
                'warning'
            );
        }
        return ok;
    }, [snackbar]);

    return { turnOn, turnOff };
}
