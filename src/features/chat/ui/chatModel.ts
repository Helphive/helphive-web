import { useEffect, useMemo, useSyncExternalStore } from 'react';
import dayjs from 'dayjs';
import { useGetUserBookingsQuery } from '@/features/booking/bookingApi';
import { useGetMyOrdersQuery } from '@/features/provider/providerApi';
import type { Booking, User } from '@/types';
import { formatDay } from '@/utils/format';
import { chatRuntime, type ChatMessage, type Presence } from '../runtime/chatRuntime';

export type Area = 'user' | 'provider';

export function useChatState() {
    const state = useSyncExternalStore(chatRuntime.subscribe, chatRuntime.getState);
    useEffect(() => {
        void chatRuntime.start();
    }, []);
    return state;
}

const idOf = (ref?: User | string | null) => (ref && typeof ref === 'object' ? ref._id : ref) || '';

export const bookingPath = (area: Area, id: string) =>
    area === 'user' ? `/user/booking/${id}` : `/provider/my-orders/${id}`;
export const messagesPath = (area: Area, uid?: string) =>
    uid ? `/${area}/messages/${encodeURIComponent(uid)}` : `/${area}/messages`;

/** Bookings shared with each counterparty that a provider accepted, newest first. */
export function useBookingsByPerson(area: Area) {
    const user = useGetUserBookingsQuery(undefined, { skip: area !== 'user' });
    const provider = useGetMyOrdersQuery(undefined, { skip: area !== 'provider' });
    return useMemo(() => {
        const list: Booking[] =
            area === 'user'
                ? [
                      ...(user.data?.active ?? []),
                      ...(user.data?.scheduled ?? []),
                      ...(user.data?.history ?? []),
                  ]
                : (provider.data ?? []);
        const map = new Map<string, Booking[]>();
        for (const b of list) {
            if (!b.providerId) continue;
            const other = area === 'user' ? idOf(b.providerId) : idOf(b.userId);
            if (!other) continue;
            map.set(other, [...(map.get(other) ?? []), b]);
        }
        map.forEach((bs) =>
            bs.sort((a, b) => dayjs(b.startDate).valueOf() - dayjs(a.startDate).valueOf())
        );
        return map;
    }, [area, user.data, provider.data]);
}

export const dayLabel = (ms: number) => {
    const d = dayjs(ms);
    if (d.isSame(dayjs(), 'day')) return 'Today';
    if (d.isSame(dayjs().subtract(1, 'day'), 'day')) return 'Yesterday';
    return formatDay(d);
};

/** Short time for the conversation list: 14:05 today, "Yesterday", or the date. */
export const listTime = (ms?: number) => {
    if (!ms) return '';
    const d = dayjs(ms);
    if (d.isSame(dayjs(), 'day')) return d.format('HH:mm');
    return dayLabel(ms);
};

export const presenceText = (p?: Presence) => {
    if (!p) return '';
    if (p.online) return 'Online';
    return p.lastActiveAt ? `Last seen ${dayjs(p.lastActiveAt).fromNow()}` : 'Offline';
};

export const preview = (m?: ChatMessage | null) => {
    if (!m) return '';
    const who = m.mine ? 'You: ' : '';
    if (m.kind === 'deleted') return 'Message deleted';
    if (m.kind === 'image') return `${who}${m.text || 'Photo'}`;
    if (m.kind === 'file') return `${who}${m.text || m.attachment?.name || 'File'}`;
    return `${who}${m.text ?? ''}`;
};

export const fullName = (p?: { firstName?: string; lastName?: string } | null, fallback = '') =>
    [p?.firstName, p?.lastName].filter(Boolean).join(' ') || fallback;

/** Visually hidden text. Pixel strings: in `sx`, a bare 1 means 100%. */
export const srText = {
    position: 'absolute',
    width: '1px',
    height: '1px',
    padding: 0,
    margin: '-1px',
    overflow: 'hidden',
    clip: 'rect(0 0 0 0)',
    whiteSpace: 'nowrap',
    border: 0,
} as const;
