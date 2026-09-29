import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Notification } from '@/types';
import { useSnackbar } from '@/components/feedback/snackbarContext';
import { useDeleteNotificationMutation, useMarkNotificationReadMutation } from './notificationsApi';
import { getNotificationTarget, type UserArea } from './notificationMeta';

// Shared click/delete behaviour for notification rows (popover and full page).
export function useNotificationActions(area: UserArea, afterOpen?: () => void) {
    const navigate = useNavigate();
    const snackbar = useSnackbar();
    const [markRead] = useMarkNotificationReadMutation();
    const [deleteNotification] = useDeleteNotificationMutation();

    const open = useCallback(
        (notification: Notification) => {
            if (!notification.read) {
                markRead({ notificationId: notification._id })
                    .unwrap()
                    .catch(() => snackbar.error('Could not mark notification as read'));
            }
            const target = getNotificationTarget(notification, area);
            if (target) navigate(target);
            afterOpen?.();
        },
        [area, navigate, markRead, snackbar, afterOpen]
    );

    const remove = useCallback(
        (notification: Notification) => {
            deleteNotification({ notificationId: notification._id })
                .unwrap()
                .then(() => snackbar.success('Notification deleted'))
                .catch(() => snackbar.error('Could not delete notification'));
        },
        [deleteNotification, snackbar]
    );

    return { open, remove };
}
