import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Link as RouterLink, useNavigate, useParams } from 'react-router-dom';
import { Box, Button, Skeleton, useMediaQuery, useTheme } from '@mui/material';
import { EmptyState, ErrorState, PageHeader, Panel } from '@/components/ui';
import { ConversationsIcon } from '@/components/ui/icons';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { color, hairline, layout, radius } from '@/theme/tokens';
import { useGetChatBlocksQuery, useGetChatContactsQuery, type ChatContact } from '../chatApi';
import type { User as CometUser } from '@cometchat/chat-sdk-javascript';
import { chatRuntime, setPresence, toChatMessage, type ChatMessage } from '../runtime/chatRuntime';
import { safeUrl } from '../runtime/safety';
import ConversationList, { type ConversationItem } from './ConversationList';
import ConversationView, { type Counterparty } from './ConversationView';
import {
    fullName,
    messagesPath,
    preview,
    useBookingsByPerson,
    useChatState,
    type Area,
} from './chatModel';

interface CometPerson {
    uid: string;
    name: string;
    avatar?: string;
    last?: ChatMessage | null;
    blockedByMe: boolean;
}

type CometConversations = NonNullable<ReturnType<typeof chatRuntime.cachedConversations>>;

const toPeople = (list: CometConversations, me: string) => {
    const map = new Map<string, CometPerson>();
    for (const c of list) {
        const u = c.getConversationWith() as CometUser;
        if (!u?.getUid) continue;
        const lastRaw = c.getLastMessage();
        map.set(u.getUid(), {
            uid: u.getUid(),
            name: u.getName(),
            avatar: safeUrl(u.getAvatar()),
            last: lastRaw ? toChatMessage(lastRaw, me) : null,
            blockedByMe: !!u.getBlockedByMe?.(),
        });
    }
    return map;
};

const notePresence = (list: CometConversations) => {
    for (const c of list) {
        const u = c.getConversationWith() as CometUser;
        if (!u?.getUid) continue;
        chatRuntimePresence(u);
    }
};

/**
 * Conversations from CometChat, kept current by the message listener. Opens with the list loaded last (the chat
 * runtime loads it right after sign-in) and refreshes it in the background.
 */
function useCometConversations(me: string | undefined) {
    const [people, setPeople] = useState<Map<string, CometPerson>>(() => {
        const cached = me ? chatRuntime.cachedConversations() : null;
        return cached && me ? toPeople(cached, me) : new Map();
    });
    const [loaded, setLoaded] = useState(() => !!me && !!chatRuntime.cachedConversations());
    const [failed, setFailed] = useState(false);

    useEffect(() => {
        if (!me) return;
        let alive = true;
        const cached = chatRuntime.cachedConversations();
        if (cached) {
            setPeople(toPeople(cached, me));
            setLoaded(true);
            notePresence(cached);
        }
        const fetchAll = async () => {
            try {
                const list = await chatRuntime.loadConversations();
                if (!alive) return;
                setPeople(toPeople(list, me));
                notePresence(list);
                setFailed(false);
            } catch {
                // A list already on screen stays; the error state is for having nothing to show.
                if (alive && !chatRuntime.cachedConversations()) setFailed(true);
            } finally {
                if (alive) setLoaded(true);
            }
        };
        void fetchAll();
        const off = chatRuntime.onEvent((e) => {
            if (e.type === 'reconnected') void fetchAll();
            if (e.type !== 'message') return;
            setPeople((cur) => {
                const existing = cur.get(e.message.peer);
                if (!existing) {
                    void fetchAll();
                    return cur;
                }
                const next = new Map(cur);
                next.set(e.message.peer, { ...existing, last: e.message });
                return next;
            });
        });
        return () => {
            alive = false;
            off();
        };
    }, [me]);
    return { people, loaded, failed };
}

const chatRuntimePresence = (u: CometUser) => {
    const last = u.getLastActiveAt?.();
    setPresence(u.getUid(), {
        online: u.getStatus() === 'online',
        lastActiveAt: last ? last * 1000 : undefined,
    });
};

/** The frame fills the window below its own top edge, whatever shell and notices sit above it. */
function useFillHeight(bottomGap: number) {
    const ref = useRef<HTMLDivElement>(null);
    const [height, setHeight] = useState<number>();
    useLayoutEffect(() => {
        const measure = () => {
            const el = ref.current;
            if (!el) return;
            const top = el.getBoundingClientRect().top + window.scrollY;
            setHeight(Math.max(380, window.innerHeight - top - bottomGap));
        };
        measure();
        window.addEventListener('resize', measure);
        return () => window.removeEventListener('resize', measure);
    }, [bottomGap]);
    return { ref, height };
}

function StatusScreen({
    area,
    title,
    message,
    retry,
}: {
    area: Area;
    title: string;
    message?: string;
    retry?: boolean;
}) {
    return (
        <>
            <PageHeader title="Messages" />
            <ErrorState
                title={title}
                message={message}
                onRetry={retry ? () => void chatRuntime.start() : undefined}
                action={
                    <Button
                        component={RouterLink}
                        to={area === 'user' ? '/user' : '/provider/my-orders'}
                        variant="outlined"
                    >
                        {area === 'user' ? 'Go to bookings' : 'Go to my orders'}
                    </Button>
                }
            />
        </>
    );
}

export default function MessagesPage({ area }: { area: Area }) {
    const { uid: selected } = useParams<{ uid: string }>();
    const navigate = useNavigate();
    const theme = useTheme();
    const desktop = useMediaQuery(theme.breakpoints.up('md'));
    const chat = useChatState();
    useDocumentTitle('Messages');

    const ready = chat.status === 'ready';
    const contactsQ = useGetChatContactsQuery(undefined, {
        skip: !ready,
        refetchOnMountOrArgChange: 30,
        refetchOnFocus: true,
    });
    const blocksQ = useGetChatBlocksQuery(undefined, { skip: !ready });
    const { byPerson: bookingsByPerson, loaded: bookingsLoaded } = useBookingsByPerson(area);
    const { people, loaded, failed } = useCometConversations(ready ? chat.me : undefined);

    const contacts = useMemo(() => {
        const map = new Map<string, ChatContact>();
        contactsQ.data?.contacts.forEach((c) => map.set(c.uid, c));
        return map;
    }, [contactsQ.data]);
    const blockedSet = useMemo(
        () => new Set(blocksQ.data?.blocked.map((b) => b.uid) ?? []),
        [blocksQ.data]
    );

    const items: ConversationItem[] = useMemo(() => {
        const uids = new Set([...people.keys(), ...contacts.keys()]);
        const list = [...uids].map((uid) => {
            const p = people.get(uid);
            const c = contacts.get(uid);
            const name = fullName(c, p?.name || 'HelpHive member');
            return {
                uid,
                name,
                firstName: c?.firstName || name.split(' ')[0],
                avatar: safeUrl(c?.avatar) ?? p?.avatar,
                lastText: preview(p?.last, bookingsByPerson.get(uid)),
                lastAt: p?.last?.sentAt,
                unread: chat.unread[uid] ?? 0,
                open: contactsQ.data ? contacts.has(uid) : null,
                blocked: blockedSet.has(uid) || !!p?.blockedByMe,
                bookings: bookingsByPerson.get(uid) ?? [],
            };
        });
        return list.sort((a, b) => (b.lastAt ?? 0) - (a.lastAt ?? 0));
    }, [people, contacts, contactsQ.data, blockedSet, bookingsByPerson, chat.unread]);

    const [lookup, setLookup] = useState<Record<string, { name: string; avatar?: string }>>({});
    const selectedItem = items.find((i) => i.uid === selected);
    useEffect(() => {
        // A conversation opened by link (notification, booking) that is not in the list yet.
        if (!ready || !selected || selectedItem || lookup[selected]) return;
        chatRuntime
            .getUser(selected)
            .then((u) =>
                setLookup((cur) => ({
                    ...cur,
                    [selected]: { name: u.getName(), avatar: safeUrl(u.getAvatar()) },
                }))
            )
            .catch(() => setLookup((cur) => ({ ...cur, [selected]: { name: 'Conversation' } })));
    }, [ready, selected, selectedItem, lookup]);

    const who: Counterparty | null = selected
        ? {
              uid: selected,
              name: selectedItem?.name ?? lookup[selected]?.name ?? '',
              firstName: selectedItem?.firstName ?? (lookup[selected]?.name ?? '').split(' ')[0],
              avatar: selectedItem?.avatar ?? lookup[selected]?.avatar,
              open: contactsQ.data ? contacts.has(selected) : null,
              until: contacts.get(selected)?.until ?? null,
              blockedByMe: blockedSet.has(selected),
              bookings: bookingsByPerson.get(selected) ?? [],
              bookingsLoaded,
          }
        : null;

    const bottomGap = desktop ? 32 : area === 'provider' ? layout.bottomNavHeight + 16 : 16;
    const { ref, height } = useFillHeight(bottomGap);

    if (chat.status === 'unavailable') {
        return (
            <StatusScreen area={area} title="Messages are not available" message={chat.message} />
        );
    }
    if (chat.status === 'refused') {
        return <StatusScreen area={area} title="Messages are turned off" message={chat.message} />;
    }
    if (chat.status === 'switched') {
        return (
            <>
                <PageHeader title="Messages" />
                <ErrorState
                    title="Signed in elsewhere"
                    message={chat.message}
                    onRetry={() => window.location.reload()}
                    retryLabel="Reload page"
                />
            </>
        );
    }
    if (chat.status === 'error') {
        return (
            <StatusScreen
                area={area}
                title="Messages could not connect"
                message={chat.message}
                retry
            />
        );
    }

    const loadingList = !ready || (!loaded && !contactsQ.data);
    const showList = desktop || !selected;
    const showThread = desktop || !!selected;
    const empty = !loadingList && items.length === 0;

    return (
        <>
            {showList ? (
                <PageHeader
                    title="Messages"
                    subtitle={
                        area === 'user'
                            ? 'Talk to the providers who accepted your bookings.'
                            : 'Talk to the customers whose bookings you accepted.'
                    }
                />
            ) : null}
            <Box
                ref={ref}
                sx={{
                    height,
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', md: '320px minmax(0, 1fr)' },
                    border: hairline,
                    borderRadius: `${radius.md}px`,
                    overflow: 'hidden',
                    bgcolor: color.surface,
                    // Phones: the thread runs edge to edge.
                    mx: selected && !desktop ? { xs: -2, sm: -3 } : 0,
                    mt: selected && !desktop ? { xs: -2.5 } : 0,
                    ...(selected && !desktop
                        ? { borderRadius: 0, borderLeft: 0, borderRight: 0 }
                        : {}),
                }}
            >
                {showList && (
                    <Box
                        component="nav"
                        aria-label="Conversations"
                        sx={{
                            borderRight: { md: hairline },
                            overflowY: 'auto',
                            minHeight: 0,
                            bgcolor: color.surface,
                        }}
                    >
                        {loadingList ? (
                            <Box
                                role="status"
                                aria-label="Loading conversations"
                                sx={{ p: 2, display: 'grid', gap: 2 }}
                            >
                                {[0, 1, 2].map((i) => (
                                    <Box key={i} sx={{ display: 'flex', gap: 1.5 }}>
                                        <Skeleton variant="circular" width={40} height={40} />
                                        <Box sx={{ flex: 1 }}>
                                            <Skeleton width="50%" />
                                            <Skeleton width="80%" />
                                        </Box>
                                    </Box>
                                ))}
                            </Box>
                        ) : failed && items.length === 0 ? (
                            <ErrorState
                                bare
                                title="Could not load conversations"
                                onRetry={() => window.location.reload()}
                            />
                        ) : empty ? (
                            <EmptyState
                                bare
                                icon={<ConversationsIcon />}
                                title="No conversations yet"
                                description={
                                    area === 'user'
                                        ? 'Chat opens when a provider accepts one of your bookings.'
                                        : 'Chat opens when you accept a booking.'
                                }
                                action={
                                    <Button
                                        component={RouterLink}
                                        to={area === 'user' ? '/user' : '/provider/orders'}
                                        variant="outlined"
                                    >
                                        {area === 'user'
                                            ? 'Go to bookings'
                                            : 'Browse available orders'}
                                    </Button>
                                }
                            />
                        ) : (
                            <ConversationList
                                items={items}
                                area={area}
                                selected={selected}
                                presence={chat.presence}
                                typing={chat.typing}
                            />
                        )}
                    </Box>
                )}
                {showThread && (
                    <Box sx={{ minHeight: 0, minWidth: 0 }}>
                        {who && ready && chat.me && who.name ? (
                            <ConversationView
                                key={who.uid}
                                who={who}
                                me={chat.me}
                                area={area}
                                chat={chat}
                                headingLevel={desktop ? 'h2' : 'h1'}
                                onBack={desktop ? undefined : () => navigate(messagesPath(area))}
                            />
                        ) : who ? (
                            <Box role="status" aria-label="Loading conversation" sx={{ p: 2 }}>
                                <Skeleton width="40%" height={32} />
                                <Skeleton variant="rounded" height={200} sx={{ mt: 2 }} />
                            </Box>
                        ) : (
                            <Panel
                                sx={{
                                    border: 0,
                                    borderRadius: 0,
                                    height: '100%',
                                    display: 'grid',
                                    placeItems: 'center',
                                    bgcolor: color.canvas,
                                }}
                            >
                                <EmptyState
                                    bare
                                    icon={<ConversationsIcon />}
                                    title="Choose a conversation"
                                    description="Messages stay with the booking they are about, so you can check the details as you talk."
                                />
                            </Panel>
                        )}
                    </Box>
                )}
            </Box>
        </>
    );
}
