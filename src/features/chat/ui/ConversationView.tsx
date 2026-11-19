import { Fragment, useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import dayjs from 'dayjs';
import {
    Alert,
    Box,
    Button,
    IconButton,
    ListItemIcon,
    Menu,
    MenuItem,
    Skeleton,
    Typography,
} from '@mui/material';
import type { Booking } from '@/types';
import { formatDay, getDisplayStatus } from '@/utils/format';
import { color, font, hairline, radius } from '@/theme/tokens';
import { BookingStatusPill, ErrorState, ServiceIcon } from '@/components/ui';
import { BackIcon, BlockIcon, ChevronDownIcon, MoreIcon, ReportIcon } from '@/components/ui/icons';
import { chatApi } from '../chatApi';
import { store } from '@/store';
import {
    chatRuntime,
    errorCode,
    toChatMessage,
    type ChatMessage,
    type ChatState,
} from '../runtime/chatRuntime';
import { checkFile } from '../runtime/safety';
import Composer, { type Pending } from './Composer';
import MessageBubble, { ImageViewer } from './MessageBubble';
import { BlockDialog, ReportDialog } from './SafetyDialogs';
import { PersonAvatar } from './ConversationList';
import { bookingPath, dayLabel, presenceText, type Area, srText } from './chatModel';

export interface Counterparty {
    uid: string;
    name: string;
    firstName: string;
    avatar?: string;
    /** Server's answer: true open, false closed, null not known yet. */
    open: boolean | null;
    until: string | null;
    blockedByMe: boolean;
    bookings: Booking[];
}

const NEAR_BOTTOM_PX = 120;

function BookingTickets({ bookings, area }: { bookings: Booking[]; area: Area }) {
    if (!bookings.length) return null;
    return (
        <Box
            component="ul"
            aria-label="Bookings with this person"
            sx={{
                listStyle: 'none',
                m: 0,
                px: { xs: 1.5, sm: 2 },
                py: 1,
                display: 'flex',
                gap: 1,
                overflowX: 'auto',
                scrollbarWidth: 'thin',
                borderBottom: hairline,
                bgcolor: color.subtle,
            }}
        >
            {bookings.slice(0, 6).map((b) => (
                <Box component="li" key={b._id} sx={{ flexShrink: 0 }}>
                    <Box
                        component={RouterLink}
                        to={bookingPath(area, b._id)}
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            pl: 0.75,
                            pr: 1,
                            py: 0.5,
                            border: hairline,
                            borderLeft: `3px solid ${color.coral500}`,
                            borderRadius: `${radius.sm}px`,
                            bgcolor: color.surface,
                            color: color.ink900,
                            textDecoration: 'none',
                            whiteSpace: 'nowrap',
                            '&:hover': {
                                borderColor: color.ink300,
                                borderLeftColor: color.coral500,
                            },
                        }}
                    >
                        <ServiceIcon serviceId={b.service?.id} size={18} />
                        <Box component="span" sx={{ fontSize: font.size.sm, fontWeight: 700 }}>
                            {b.service?.name}
                        </Box>
                        <Box component="span" sx={{ fontSize: font.size.sm, color: color.ink600 }}>
                            {formatDay(b.startDate)}, {dayjs(b.startDate).format('HH:mm')}
                        </Box>
                        <BookingStatusPill status={getDisplayStatus(b)} size="sm" />
                    </Box>
                </Box>
            ))}
        </Box>
    );
}

export default function ConversationView({
    who,
    me,
    area,
    chat,
    onBack,
    headingLevel,
}: {
    who: Counterparty;
    me: string;
    area: Area;
    chat: ChatState;
    onBack?: () => void;
    headingLevel: 'h1' | 'h2';
}) {
    const uid = who.uid;
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [loadingOlder, setLoadingOlder] = useState(false);
    // True while messages shown from the cache are being checked against the server.
    const [refreshing, setRefreshing] = useState(false);
    const [hasBlockedMe, setHasBlockedMe] = useState(false);
    const [blockedInChat, setBlockedInChat] = useState(false);
    const [closedNow, setClosedNow] = useState(false);
    const [menu, setMenu] = useState<HTMLElement | null>(null);
    const [dialog, setDialog] = useState<'block' | 'report' | null>(null);
    const [reportMessage, setReportMessage] = useState<number | undefined>();
    const [image, setImage] = useState<{ url: string; name: string } | null>(null);
    const [announce, setAnnounce] = useState('');
    const [showJump, setShowJump] = useState(false);

    const scroller = useRef<HTMLDivElement>(null);
    const topSentinel = useRef<HTMLDivElement>(null);
    const request = useRef<ReturnType<typeof chatRuntime.messagesRequest> | null>(null);
    const prepend = useRef<{ height: number } | null>(null);
    const stickBottom = useRef(true);
    const lastMarked = useRef(0);
    const latest = useRef<ChatMessage[]>([]);
    latest.current = messages;
    const activeUid = useRef(uid);

    const blocked = who.blockedByMe || blockedInChat;
    const isClosed = who.open === false || closedNow;

    const nearBottom = () => {
        const el = scroller.current;
        return !el || el.scrollHeight - el.scrollTop - el.clientHeight < NEAR_BOTTOM_PX;
    };
    const scrollToBottom = () => {
        const el = scroller.current;
        if (el) el.scrollTop = el.scrollHeight;
        setShowJump(false);
    };

    const markLatestRead = useCallback(
        (list: ChatMessage[]) => {
            if (document.visibilityState !== 'visible') return;
            const latest = [...list].reverse().find((m) => !m.mine && m.id);
            if (latest?.id && latest.id > lastMarked.current) {
                lastMarked.current = latest.id;
                chatRuntime.markRead(latest.id, uid);
            }
        },
        [uid]
    );

    /* Initial load and switching conversations. */
    const load = useCallback(async () => {
        activeUid.current = uid;
        const toList = (page: Parameters<typeof chatRuntime.rememberMessages>[1]) =>
            page.map((m) => toChatMessage(m, me)).filter((m): m is ChatMessage => !!m);
        // Show what was loaded last straight away, then check it against the server.
        const cached = chatRuntime.cachedMessages(uid);
        setLoading(!cached);
        setRefreshing(!!cached);
        setLoadError(false);
        setMessages(cached ? toList(cached) : []);
        setHasMore(true);
        lastMarked.current = 0;
        stickBottom.current = true;
        const mine = chatRuntime.messagesRequest(uid);
        request.current = mine;
        try {
            const page = await mine.fetchPrevious();
            if (activeUid.current !== uid || request.current !== mine) return;
            chatRuntime.rememberMessages(uid, page);
            const list = toList(page);
            // Keep anything still being sent, and anything that arrived while the page was loading.
            setMessages((cur) => {
                const known = new Set(list.flatMap((m) => (m.muid ? [m.key, m.muid] : [m.key])));
                const lastId = list.reduce((max, m) => Math.max(max, m.id ?? 0), 0);
                return [
                    ...list,
                    ...cur.filter(
                        (m) =>
                            !known.has(m.key) &&
                            !(m.muid && known.has(m.muid)) &&
                            (!m.id || m.id > lastId)
                    ),
                ];
            });
            setHasMore(page.length >= 30);
            markLatestRead(list);
        } catch {
            if (activeUid.current === uid && !cached) setLoadError(true);
        } finally {
            if (activeUid.current === uid && request.current === mine) {
                setLoading(false);
                setRefreshing(false);
            }
        }
    }, [uid, me, markLatestRead]);

    useEffect(() => {
        void load();
        chatRuntime
            .getUser(uid)
            .then((u) => {
                setHasBlockedMe(u.getHasBlockedMe());
                setBlockedInChat(u.getBlockedByMe());
            })
            .catch(() => undefined);
        setClosedNow(false);
    }, [load, uid]);

    /* Older messages when the top comes into view. */
    const loadOlder = useCallback(async () => {
        if (!request.current || loadingOlder || !hasMore || loading || refreshing) return;
        setLoadingOlder(true);
        try {
            const page = await request.current.fetchPrevious();
            const older = page
                .map((m) => toChatMessage(m, me))
                .filter((m): m is ChatMessage => !!m);
            prepend.current = { height: scroller.current?.scrollHeight ?? 0 };
            setMessages((cur) => {
                const seen = new Set(cur.map((m) => m.key));
                return [...older.filter((m) => !seen.has(m.key)), ...cur];
            });
            setHasMore(page.length >= 30);
        } catch {
            // Try again on the next scroll.
        } finally {
            setLoadingOlder(false);
        }
    }, [loadingOlder, hasMore, loading, refreshing, me]);

    useEffect(() => {
        const el = topSentinel.current;
        if (!el || loading) return;
        const io = new IntersectionObserver(
            (entries) => entries[0]?.isIntersecting && void loadOlder(),
            {
                root: scroller.current,
                rootMargin: '200px 0px 0px 0px',
            }
        );
        io.observe(el);
        return () => io.disconnect();
    }, [loadOlder, loading]);

    useLayoutEffect(() => {
        const el = scroller.current;
        if (!el) return;
        if (prepend.current) {
            el.scrollTop += el.scrollHeight - prepend.current.height;
            prepend.current = null;
        } else if (stickBottom.current) {
            el.scrollTop = el.scrollHeight;
        }
    }, [messages, loading]);

    /* Live events: new messages, receipts, catch-up after a reconnect. */
    useEffect(() => {
        const off = chatRuntime.onEvent((e) => {
            if (e.type === 'message' && e.message.peer === uid) {
                const m = e.message;
                stickBottom.current = m.mine || nearBottom();
                if (!stickBottom.current && !m.mine) setShowJump(true);
                setMessages((cur) => {
                    const i = cur.findIndex(
                        (x) => (m.id && x.id === m.id) || (m.muid && x.muid === m.muid)
                    );
                    if (i >= 0) {
                        const next = cur.slice();
                        next[i] = {
                            ...m,
                            attachment: m.attachment && {
                                ...m.attachment,
                                localUrl: cur[i].attachment?.localUrl,
                            },
                        };
                        return next;
                    }
                    return [...cur, m];
                });
                if (!m.mine) markLatestRead([m]);
                if (!m.mine && m.kind !== 'deleted') {
                    setAnnounce(
                        `${who.firstName}: ${m.kind === 'text' ? m.text : m.kind === 'image' ? 'sent a photo' : 'sent a file'}`
                    );
                }
            } else if (e.type === 'receipt' && e.peer === uid) {
                setMessages((cur) =>
                    cur.map((m) =>
                        m.mine && m.id && m.id <= e.messageId
                            ? e.kind === 'read'
                                ? {
                                      ...m,
                                      readAt: m.readAt ?? e.at,
                                      deliveredAt: m.deliveredAt ?? e.at,
                                  }
                                : { ...m, deliveredAt: m.deliveredAt ?? e.at }
                            : m
                    )
                );
            } else if (e.type === 'reconnected') {
                const lastId = [...latest.current].reverse().find((m) => m.id)?.id;
                if (!lastId) return;
                chatRuntime
                    .newerRequest(uid, lastId)
                    .fetchNext()
                    .then((page) => {
                        const newer = page
                            .map((m) => toChatMessage(m, me))
                            .filter((m): m is ChatMessage => !!m);
                        setMessages((c) => {
                            const seen = new Set(c.map((m) => m.id));
                            return [...c, ...newer.filter((m) => !seen.has(m.id))];
                        });
                        markLatestRead(newer);
                    })
                    .catch(() => undefined);
            }
        });
        return () => {
            off();
        };
    }, [uid, me, who.firstName, markLatestRead]);

    /* Viewing signal while on screen and visible (contract section 6), repeated every 60 s. */
    useEffect(() => {
        let timer: ReturnType<typeof setInterval> | undefined;
        const sync = () => {
            clearInterval(timer);
            if (document.visibilityState === 'visible') {
                void chatRuntime.setViewing(uid);
                timer = setInterval(() => void chatRuntime.setViewing(uid), 60_000);
                markLatestRead(latest.current);
            } else {
                void chatRuntime.setViewing(null);
            }
        };
        sync();
        document.addEventListener('visibilitychange', sync);
        return () => {
            document.removeEventListener('visibilitychange', sync);
            clearInterval(timer);
            void chatRuntime.setViewing(null);
        };
    }, [uid, markLatestRead]);

    /* Sending with optimistic bubbles. */
    const deliver = useCallback(
        async (m: ChatMessage) => {
            try {
                const sent =
                    m.file && m.kind !== 'text'
                        ? await chatRuntime.sendFile(
                              uid,
                              m.file,
                              m.kind === 'image' ? 'image' : 'file',
                              m.muid!,
                              m.text
                          )
                        : await chatRuntime.sendText(uid, m.text ?? '', m.muid!);
                const done = toChatMessage(sent, me);
                setMessages((cur) =>
                    cur.map((x) =>
                        x.muid === m.muid
                            ? done
                                ? {
                                      ...done,
                                      key: x.key,
                                      attachment: done.attachment && {
                                          ...done.attachment,
                                          localUrl: x.attachment?.localUrl,
                                      },
                                  }
                                : { ...x, state: 'sent' }
                            : x
                    )
                );
            } catch (err) {
                let error = 'Not sent. Check your connection and try again.';
                if (errorCode(err) === 'ERR_PERMISSION_DENIED') {
                    const check = m.file ? checkFile(m.file) : null;
                    if (check && !check.ok) error = check.error;
                    else {
                        error = 'This chat has closed.';
                        setClosedNow(true);
                        store.dispatch(chatApi.util.invalidateTags(['ChatContacts']));
                    }
                } else if (/BLOCK/i.test(errorCode(err))) {
                    error = 'You cannot send messages in this conversation.';
                }
                setMessages((cur) =>
                    cur.map((x) => (x.muid === m.muid ? { ...x, state: 'failed', error } : x))
                );
            }
        },
        [uid, me]
    );

    const send = (text: string, pending: Pending | null) => {
        const muid = crypto.randomUUID();
        const m: ChatMessage = {
            key: muid,
            muid,
            mine: true,
            peer: uid,
            sentAt: Date.now(),
            kind: pending ? pending.kind : 'text',
            text: text || undefined,
            state: 'sending',
            file: pending?.file,
            attachment: pending
                ? {
                      localUrl: pending.previewUrl ? URL.createObjectURL(pending.file) : undefined,
                      name: pending.file.name,
                      mimeType: pending.file.type,
                      size: pending.file.size,
                  }
                : undefined,
        };
        stickBottom.current = true;
        setMessages((cur) => [...cur, m]);
        void deliver(m);
    };

    const retry = (m: ChatMessage) => {
        const muid = crypto.randomUUID();
        const again = {
            ...m,
            key: muid,
            muid,
            state: 'sending' as const,
            error: undefined,
            sentAt: Date.now(),
        };
        stickBottom.current = true;
        setMessages((cur) => [...cur.filter((x) => x.key !== m.key), again]);
        void deliver(again);
    };
    const discard = (m: ChatMessage) => {
        if (m.attachment?.localUrl) URL.revokeObjectURL(m.attachment.localUrl);
        setMessages((cur) => cur.filter((x) => x.key !== m.key));
    };

    const afterBlockChange = () => {
        chatRuntime
            .getUser(uid)
            .then((u) => {
                setBlockedInChat(u.getBlockedByMe());
                setHasBlockedMe(u.getHasBlockedMe());
            })
            .catch(() => undefined);
    };

    const presence = chat.presence[uid];
    const typing = chat.typing[uid];
    const canWrite = !blocked && !hasBlockedMe && !isClosed;
    const Heading = headingLevel;

    let lastDay = '';
    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                minHeight: 0,
                bgcolor: color.canvas,
            }}
        >
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.25,
                    px: { xs: 1, sm: 2 },
                    py: 1.25,
                    bgcolor: color.surface,
                    borderBottom: hairline,
                }}
            >
                {onBack && (
                    <IconButton aria-label="Back to conversations" onClick={onBack}>
                        <BackIcon />
                    </IconButton>
                )}
                <PersonAvatar name={who.name} src={who.avatar} presence={presence} />
                <Box sx={{ minWidth: 0, flex: 1 }}>
                    <Typography
                        component={Heading}
                        variant="h6"
                        noWrap
                        sx={{ fontSize: font.size.lg, lineHeight: 1.3 }}
                    >
                        {headingLevel === 'h1' && (
                            <Box component="span" sx={srText}>
                                Messages with{' '}
                            </Box>
                        )}
                        {who.name}
                    </Typography>
                    <Typography variant="caption" component="p" noWrap aria-live="polite">
                        {typing ? 'Typing…' : presenceText(presence)}
                    </Typography>
                </Box>
                <IconButton
                    aria-label={`Options for this conversation with ${who.firstName}`}
                    aria-haspopup="menu"
                    aria-expanded={!!menu}
                    onClick={(e) => setMenu(e.currentTarget)}
                >
                    <MoreIcon />
                </IconButton>
                <Menu
                    anchorEl={menu}
                    open={!!menu}
                    onClose={() => setMenu(null)}
                    anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                    transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                >
                    <MenuItem
                        onClick={() => {
                            setMenu(null);
                            setReportMessage(undefined);
                            setDialog('report');
                        }}
                    >
                        <ListItemIcon>
                            <ReportIcon />
                        </ListItemIcon>
                        Report {who.firstName}
                    </MenuItem>
                    <MenuItem
                        onClick={() => {
                            setMenu(null);
                            setDialog('block');
                        }}
                        sx={{ color: blocked ? undefined : color.red700 }}
                    >
                        <ListItemIcon sx={{ color: 'inherit' }}>
                            <BlockIcon />
                        </ListItemIcon>
                        {blocked ? `Unblock ${who.firstName}` : `Block ${who.firstName}`}
                    </MenuItem>
                </Menu>
            </Box>
            <BookingTickets bookings={who.bookings} area={area} />
            {chat.connection !== 'connected' && (
                <Alert severity="warning" sx={{ borderRadius: 0 }} role="status">
                    Connection lost. Reconnecting…
                </Alert>
            )}

            <Box
                ref={scroller}
                onScroll={() => {
                    stickBottom.current = nearBottom();
                    if (stickBottom.current) setShowJump(false);
                }}
                sx={{
                    flex: 1,
                    minHeight: 0,
                    overflowY: 'auto',
                    px: { xs: 1.5, sm: 2.5 },
                    py: 2,
                    position: 'relative',
                }}
                tabIndex={0}
                aria-label={`Messages with ${who.name}`}
                role="region"
            >
                <div ref={topSentinel} />
                {loadingOlder && (
                    <Skeleton
                        variant="rounded"
                        height={36}
                        sx={{ mb: 1.5, mx: 'auto', maxWidth: 240 }}
                    />
                )}
                {loading ? (
                    <Box
                        role="status"
                        aria-label="Loading messages"
                        sx={{ display: 'grid', gap: 1.5 }}
                    >
                        {[60, 40, 70, 30].map((w, i) => (
                            <Skeleton
                                key={i}
                                variant="rounded"
                                height={40}
                                sx={{ width: `${w}%`, justifySelf: i % 2 ? 'end' : 'start' }}
                            />
                        ))}
                    </Box>
                ) : loadError ? (
                    <ErrorState
                        bare
                        title="Could not load messages"
                        message="Check your connection."
                        onRetry={() => void load()}
                    />
                ) : messages.length === 0 ? (
                    <Box sx={{ textAlign: 'center', py: 6, color: color.ink600 }}>
                        <Typography variant="subtitle2" sx={{ color: color.ink900 }}>
                            {canWrite ? `Say hello to ${who.firstName}` : 'No messages'}
                        </Typography>
                        <Typography variant="body2">
                            {canWrite
                                ? 'Ask about access, parking or anything else about the shift.'
                                : 'There is nothing in this conversation yet.'}
                        </Typography>
                    </Box>
                ) : (
                    <Box
                        component="ol"
                        sx={{ listStyle: 'none', m: 0, p: 0, display: 'grid', gap: 0.75 }}
                    >
                        {!hasMore && (
                            <Box
                                component="li"
                                sx={{
                                    textAlign: 'center',
                                    fontSize: font.size.xs,
                                    color: color.ink500,
                                    fontWeight: 600,
                                    pb: 1,
                                }}
                            >
                                Start of your conversation with {who.firstName}
                            </Box>
                        )}
                        {messages.map((m) => {
                            const day = dayLabel(m.sentAt);
                            const header = day !== lastDay;
                            lastDay = day;
                            return (
                                <Fragment key={m.key}>
                                    {header && (
                                        <Box
                                            component="li"
                                            sx={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 1.5,
                                                my: 1,
                                                fontSize: font.size.xs,
                                                fontWeight: 700,
                                                color: color.ink500,
                                                '&::before, &::after': {
                                                    content: '""',
                                                    flex: 1,
                                                    borderTop: hairline,
                                                },
                                            }}
                                        >
                                            <Box component="span">{day}</Box>
                                        </Box>
                                    )}
                                    <MessageBubble
                                        m={m}
                                        onOpenImage={setImage}
                                        onRetry={retry}
                                        onDiscard={discard}
                                        onReport={(msg) => {
                                            setReportMessage(msg.id);
                                            setDialog('report');
                                        }}
                                    />
                                </Fragment>
                            );
                        })}
                    </Box>
                )}
                {typing && (
                    <Box
                        sx={{ mt: 1, fontSize: font.size.sm, color: color.ink600, fontWeight: 600 }}
                        aria-hidden
                    >
                        {who.firstName} is typing…
                    </Box>
                )}
            </Box>
            {showJump && (
                <Box sx={{ position: 'relative' }}>
                    <Button
                        size="small"
                        variant="contained"
                        color="secondary"
                        onClick={scrollToBottom}
                        startIcon={<ChevronDownIcon />}
                        sx={{
                            position: 'absolute',
                            bottom: 12,
                            left: '50%',
                            transform: 'translateX(-50%)',
                        }}
                    >
                        New messages
                    </Button>
                </Box>
            )}
            <Box sx={srText} aria-live="polite" role="log">
                {announce}
            </Box>

            {blocked ? (
                <Alert
                    severity="info"
                    sx={{ borderRadius: 0, borderTop: hairline }}
                    action={
                        <Button size="small" onClick={() => setDialog('block')}>
                            Unblock
                        </Button>
                    }
                >
                    You blocked {who.firstName}. Neither of you can send messages.
                </Alert>
            ) : hasBlockedMe ? (
                <Alert severity="info" sx={{ borderRadius: 0, borderTop: hairline }}>
                    You can't send messages in this conversation.
                </Alert>
            ) : isClosed ? (
                <Alert severity="info" sx={{ borderRadius: 0, borderTop: hairline }}>
                    This chat has closed. You can still read it. It opens again if you share a new
                    booking.
                </Alert>
            ) : (
                <>
                    {who.until && (
                        <Box
                            sx={{
                                px: 2,
                                py: 0.75,
                                fontSize: font.size.xs,
                                fontWeight: 600,
                                color: color.amber700,
                                bgcolor: color.amber50,
                                borderTop: `1px solid ${color.amber200}`,
                            }}
                        >
                            Chat closes on {formatDay(who.until)}
                        </Box>
                    )}
                    <Composer me={me} uid={uid} firstName={who.firstName} onSend={send} />
                </>
            )}

            <ImageViewer image={image} onClose={() => setImage(null)} />
            <BlockDialog
                open={dialog === 'block'}
                uid={uid}
                firstName={who.firstName}
                blocked={blocked}
                onClose={() => setDialog(null)}
                onDone={afterBlockChange}
            />
            <ReportDialog
                open={dialog === 'report'}
                uid={uid}
                firstName={who.firstName}
                messageId={reportMessage}
                blocked={blocked}
                onClose={() => setDialog(null)}
                onBlock={() => setDialog('block')}
            />
        </Box>
    );
}
