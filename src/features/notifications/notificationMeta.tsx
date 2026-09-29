import type { ReactElement } from 'react';
import {
    EventAvailable as CreatedIcon,
    CheckCircleOutline as AcceptedIcon,
    HourglassTop as StartRequestedIcon,
    PlayCircleOutline as StartedIcon,
    TaskAlt as CompletedIcon,
    EventBusy as CancelledIcon,
    TimerOff as ExpiredIcon,
    CreditScore as PaymentIcon,
    Undo as RefundIcon,
    AccountBalance as PayoutIcon,
    VerifiedUser as ApprovedIcon,
    GppBad as RejectedIcon,
    Notifications as GeneralIcon,
} from '@mui/icons-material';
import dayjs from 'dayjs';
import type { Notification, NotificationType } from '@/types';

export type UserArea = 'user' | 'provider';

interface TypeMeta {
    icon: ReactElement;
    color: string;
    background: string;
}

const NOTIFICATION_META: Record<NotificationType, TypeMeta> = {
    booking_created: { icon: <CreatedIcon />, color: '#B54708', background: '#FFFAEB' },
    booking_accepted: { icon: <AcceptedIcon />, color: '#175CD3', background: '#EFF8FF' },
    booking_start_requested: {
        icon: <StartRequestedIcon />,
        color: '#6941C6',
        background: '#F4F3FF',
    },
    booking_started: { icon: <StartedIcon />, color: '#FF5740', background: '#FFF1EE' },
    booking_completed: { icon: <CompletedIcon />, color: '#067647', background: '#ECFDF3' },
    booking_cancelled: { icon: <CancelledIcon />, color: '#B42318', background: '#FEF3F2' },
    booking_expired: { icon: <ExpiredIcon />, color: '#475467', background: '#F2F4F7' },
    payment_succeeded: { icon: <PaymentIcon />, color: '#067647', background: '#ECFDF3' },
    payment_refunded: { icon: <RefundIcon />, color: '#175CD3', background: '#EFF8FF' },
    payout_paid: { icon: <PayoutIcon />, color: '#067647', background: '#ECFDF3' },
    account_approved: { icon: <ApprovedIcon />, color: '#067647', background: '#ECFDF3' },
    account_rejected: { icon: <RejectedIcon />, color: '#B42318', background: '#FEF3F2' },
    general: { icon: <GeneralIcon />, color: '#475467', background: '#F2F4F7' },
};

export const getNotificationMeta = (type: NotificationType | undefined): TypeMeta =>
    NOTIFICATION_META[type ?? 'general'] ?? NOTIFICATION_META.general;

// Where a notification should take the user, or null when there is nowhere to go.
export function getNotificationTarget(n: Notification, area: UserArea): string | null {
    const bookingId =
        n.bookingId ||
        (typeof n.data?.bookingId === 'string' ? (n.data.bookingId as string) : null);
    if (bookingId) {
        if (area === 'provider' && n.type === 'booking_created') {
            return `/provider/orders/${bookingId}`;
        }
        return area === 'provider'
            ? `/provider/my-orders/${bookingId}`
            : `/user/booking/${bookingId}`;
    }
    if (n.type === 'payout_paid') return area === 'provider' ? '/provider/earnings' : null;
    return null;
}

export type NotificationGroup = 'Today' | 'Yesterday' | 'Earlier';

export function groupNotifications(
    items: Notification[]
): { label: NotificationGroup; items: Notification[] }[] {
    const today = dayjs().startOf('day');
    const yesterday = today.subtract(1, 'day');
    const buckets: Record<NotificationGroup, Notification[]> = {
        Today: [],
        Yesterday: [],
        Earlier: [],
    };
    for (const n of items) {
        const created = dayjs(n.createdAt);
        if (!created.isBefore(today)) buckets.Today.push(n);
        else if (!created.isBefore(yesterday)) buckets.Yesterday.push(n);
        else buckets.Earlier.push(n);
    }
    return (['Today', 'Yesterday', 'Earlier'] as NotificationGroup[])
        .filter((label) => buckets[label].length > 0)
        .map((label) => ({ label, items: buckets[label] }));
}
