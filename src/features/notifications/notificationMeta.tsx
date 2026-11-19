import type { ReactElement } from 'react';
import {
    EventAvailableOutlined as CreatedIcon,
    CheckCircleOutline as AcceptedIcon,
    HourglassTopOutlined as StartRequestedIcon,
    PlayCircleOutline as StartedIcon,
    TaskAltOutlined as CompletedIcon,
    EventBusyOutlined as CancelledIcon,
    TimerOffOutlined as ExpiredIcon,
    CreditScoreOutlined as PaymentIcon,
    UndoOutlined as RefundIcon,
    AccountBalanceOutlined as PayoutIcon,
    VerifiedUserOutlined as ApprovedIcon,
    GppBadOutlined as RejectedIcon,
    NotificationsNoneOutlined as GeneralIcon,
} from '@mui/icons-material';
import dayjs from 'dayjs';
import type { Notification, NotificationType } from '@/types';
import { TONE_STYLES, type Tone } from '@/components/ui/status';

export type UserArea = 'user' | 'provider';

interface TypeMeta {
    icon: ReactElement;
    color: string;
    background: string;
}

const tone = (t: Tone, icon: ReactElement): TypeMeta => ({
    icon,
    color: TONE_STYLES[t].fg,
    background: TONE_STYLES[t].bg,
});

// Tones follow the status pills: green done, blue in motion, amber needs action, red stopped.
const NOTIFICATION_META: Record<NotificationType, TypeMeta> = {
    booking_created: tone('amber', <CreatedIcon />),
    booking_accepted: tone('blue', <AcceptedIcon />),
    booking_start_requested: tone('amber', <StartRequestedIcon />),
    booking_started: tone('blue', <StartedIcon />),
    booking_completed: tone('green', <CompletedIcon />),
    booking_cancelled: tone('red', <CancelledIcon />),
    booking_expired: tone('grey', <ExpiredIcon />),
    payment_succeeded: tone('green', <PaymentIcon />),
    payment_refunded: tone('blue', <RefundIcon />),
    payout_paid: tone('green', <PayoutIcon />),
    account_approved: tone('green', <ApprovedIcon />),
    account_rejected: tone('red', <RejectedIcon />),
    general: tone('grey', <GeneralIcon />),
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
