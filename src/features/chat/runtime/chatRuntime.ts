// CometChat runtime (lazy chunk). One instance per tab, alive from the first time chat opens until sign-out.
// Follows scratch/chat/chat-contract.md: server-issued auth token, no auth key, presence for friends only.
import { CometChat } from '@cometchat/chat-sdk-javascript';
import { store } from '@/store';
import { chatApi, type ChatApiError } from '../chatApi';
import { liveUnreadStore, readChatMark, registerChatRuntime, writeChatMark } from '../chatBridge';
import { fileType, isAllowedType, safeName, safeUrl } from './safety';

/* ---------- Message model used by the UI ---------- */

export type SendState = 'sending' | 'sent' | 'failed';

export interface ChatAttachment {
    url?: string; // allowed https host only
    localUrl?: string; // object URL of a file being sent
    name: string;
    mimeType: string;
    size?: number;
}

export interface ChatMessage {
    key: string;
    id?: number;
    muid?: string;
    mine: boolean;
    peer: string; // the other person in this one-to-one conversation
    sentAt: number; // ms
    deliveredAt?: number;
    readAt?: number;
    kind: 'text' | 'image' | 'file' | 'deleted';
    text?: string;
    attachment?: ChatAttachment;
    state: SendState;
    error?: string;
    file?: File; // kept for retry
}

const ms = (seconds?: number) => (seconds ? seconds * 1000 : undefined);

export function toChatMessage(m: CometChat.BaseMessage, me: string): ChatMessage | null {
    if (m.getReceiverType() !== CometChat.RECEIVER_TYPE.USER) return null;
    if (m.getCategory() !== CometChat.CATEGORY_MESSAGE) return null;
    const senderUid = m.getSender()?.getUid();
    const mine = senderUid === me;
    const peer = mine ? m.getReceiverId() : senderUid;
    if (!peer) return null;
    const base = {
        key: String(m.getId() || m.getMuid()),
        id: m.getId() || undefined,
        muid: m.getMuid() || undefined,
        mine,
        peer,
        sentAt: ms(m.getSentAt()) ?? Date.now(),
        deliveredAt: ms(m.getDeliveredAt()),
        readAt: ms(m.getReadAt()),
        state: 'sent' as const,
    };
    if (m.getDeletedAt()) return { ...base, kind: 'deleted' };
    const type = m.getType();
    if (type === CometChat.MESSAGE_TYPE.TEXT) {
        return {
            ...base,
            kind: 'text',
            text: String((m as CometChat.TextMessage).getText() ?? ''),
        };
    }
    if (type === CometChat.MESSAGE_TYPE.IMAGE || type === CometChat.MESSAGE_TYPE.FILE) {
        const media = m as CometChat.MediaMessage;
        const att = media.getAttachment?.();
        const mimeType = (
            att?.getMimeType?.() ||
            fileType({ name: att?.getName?.() }) ||
            ''
        ).toLowerCase();
        return {
            ...base,
            kind: type === CometChat.MESSAGE_TYPE.IMAGE ? 'image' : 'file',
            text: media.getCaption?.() || undefined,
            attachment: {
                // A type outside the allowed list is never linked (the server deletes such messages).
                url: isAllowedType(mimeType) ? safeUrl(att?.getUrl?.()) : undefined,
                name: safeName(att?.getName?.()),
                mimeType,
                size: att?.getSize?.(),
            },
        };
    }
    return null;
}

/* ---------- Runtime state ---------- */

export type ChatStatus =
    | 'idle'
    | 'connecting'
    | 'ready'
    | 'unavailable'
    | 'refused'
    | 'error'
    | 'switched';

export interface Presence {
    online: boolean;
    lastActiveAt?: number; // ms
}

export interface ChatState {
    status: ChatStatus;
    message?: string;
    me?: string;
    connection: 'connected' | 'connecting' | 'disconnected';
    unread: Record<string, number>;
    typing: Record<string, boolean>;
    presence: Record<string, Presence>;
}

const initial: ChatState = {
    status: 'idle',
    connection: 'connecting',
    unread: {},
    typing: {},
    presence: {},
};
let state: ChatState = initial;
const stateListeners = new Set<() => void>();

const setState = (patch: Partial<ChatState>) => {
    state = { ...state, ...patch };
    stateListeners.forEach((l) => l());
    const total = Object.values(state.unread).reduce((a, b) => a + b, 0);
    liveUnreadStore.set(state.status === 'ready' ? total : null);
};

export type ChatEvent =
    | { type: 'message'; message: ChatMessage }
    | { type: 'receipt'; peer: string; messageId: number; kind: 'delivered' | 'read'; at: number }
    | { type: 'reconnected' };

const eventListeners = new Set<(e: ChatEvent) => void>();
const emit = (e: ChatEvent) => eventListeners.forEach((l) => l(e));

/* ---------- Session ---------- */

const LISTENER = 'helphive-web-chat';
let initialisedAppId: string | null = null;
let starting: Promise<void> | null = null;
let viewingUid: string | null = null;
// Bumped by sign-out so a sign-in still in flight never completes for a signed-out tab.
let generation = 0;
let retryTimer: ReturnType<typeof setTimeout> | undefined;

/* ---------- Caches ----------
 * What was loaded last, so a screen opens with content while it refreshes. Memory only; emptied at sign-out.
 */
const MAX_CACHED_THREADS = 20;
let conversationsCache: CometChat.Conversation[] | null = null;
let conversationsLoading: Promise<CometChat.Conversation[]> | null = null;
const messagesCache = new Map<string, CometChat.BaseMessage[]>();

function clearCaches() {
    conversationsCache = null;
    conversationsLoading = null;
    messagesCache.clear();
}

/** Keeps the newest page of a conversation (the most recently opened conversations only). */
function rememberMessages(uid: string, page: CometChat.BaseMessage[]) {
    messagesCache.delete(uid);
    messagesCache.set(uid, page.slice());
    const oldest = messagesCache.keys().next().value;
    if (messagesCache.size > MAX_CACHED_THREADS && oldest !== undefined)
        messagesCache.delete(oldest);
}

/** A cached page follows the conversation as messages arrive, are edited or are deleted. */
function noteMessage(peer: string, raw: CometChat.BaseMessage) {
    const page = messagesCache.get(peer);
    if (!page) return;
    const i = page.findIndex((m) => m.getId() === raw.getId());
    if (i >= 0) page[i] = raw;
    else page.push(raw);
}

async function ensureInit(appId: string, region: string) {
    if (initialisedAppId === appId) return;
    if (initialisedAppId) throw new Error('app_changed');
    const settings = new CometChat.AppSettingsBuilder()
        .subscribePresenceForFriends()
        .setRegion(region)
        .autoEstablishSocketConnection(true)
        .setStorageMode(CometChat.StorageMode.SESSION)
        .build();
    await CometChat.init(appId, settings);
    initialisedAppId = appId;
}

function failFromServer(err: unknown) {
    const e = err as ChatApiError;
    const code = e?.data?.code;
    const message = e?.data?.message;
    if (e?.status === 503) {
        setState({ status: 'unavailable', message: 'Messages are not available right now.' });
    } else if (e?.status === 403) {
        setState({
            status: 'refused',
            message:
                message ||
                (code === 'chat_email_unverified'
                    ? 'Verify your email address to use messages.'
                    : 'Messages are turned off for this account.'),
        });
    } else if (e?.status === 429) {
        const wait = e.retryAfter ?? 30;
        setState({
            status: 'error',
            message: `Too many attempts. Trying again in ${wait} seconds.`,
        });
        retryTimer = setTimeout(() => void chatRuntime.start(), wait * 1000);
    } else {
        setState({
            status: 'error',
            message: 'Messages could not connect. Try again in a moment.',
        });
    }
}

function addListeners(me: string) {
    const onMessage = (m: CometChat.BaseMessage) => {
        const message = toChatMessage(m, me);
        if (!message) return;
        noteMessage(message.peer, m);
        if (!message.mine) {
            CometChat.markAsDelivered(m);
            const watching = viewingUid === message.peer && document.visibilityState === 'visible';
            if (!watching) {
                setState({
                    unread: {
                        ...state.unread,
                        [message.peer]: (state.unread[message.peer] ?? 0) + 1,
                    },
                });
            }
            setTyping(message.peer, false);
        }
        emit({ type: 'message', message });
    };
    const onReceipt = (kind: 'delivered' | 'read') => (r: CometChat.MessageReceipt) => {
        if (r.getReceiverType() !== CometChat.RECEIVER_TYPE.USER) return;
        emit({
            type: 'receipt',
            peer: r.getSender().getUid(),
            messageId: Number(r.getMessageId()),
            kind,
            at: ms(kind === 'read' ? r.getReadAt() : r.getDeliveredAt()) ?? Date.now(),
        });
    };
    const onTyping = (on: boolean) => (t: CometChat.TypingIndicator) => {
        if (t.getReceiverType() !== CometChat.RECEIVER_TYPE.USER) return;
        setTyping(t.getSender().getUid(), on);
    };
    CometChat.addMessageListener(
        LISTENER,
        new CometChat.MessageListener({
            onTextMessageReceived: onMessage,
            onMediaMessageReceived: onMessage,
            onMessageDeleted: onMessage,
            onMessageEdited: onMessage,
            onMessagesDelivered: onReceipt('delivered'),
            onMessagesRead: onReceipt('read'),
            onTypingStarted: onTyping(true),
            onTypingEnded: onTyping(false),
        })
    );
    const onPresence = (online: boolean) => (u: CometChat.User) =>
        setPresence(u.getUid(), { online, lastActiveAt: ms(u.getLastActiveAt()) });
    CometChat.addUserListener(
        LISTENER,
        new CometChat.UserListener({
            onUserOnline: onPresence(true),
            onUserOffline: onPresence(false),
        })
    );
    let wasDisconnected = false;
    CometChat.addConnectionListener(
        LISTENER,
        new CometChat.ConnectionListener({
            onConnected: () => {
                setState({ connection: 'connected' });
                if (wasDisconnected) {
                    wasDisconnected = false;
                    void refreshUnread();
                    emit({ type: 'reconnected' });
                }
            },
            inConnecting: () => setState({ connection: 'connecting' }),
            onDisconnected: () => {
                wasDisconnected = true;
                setState({ connection: 'disconnected' });
            },
        })
    );
}

function removeListeners() {
    CometChat.removeMessageListener(LISTENER);
    CometChat.removeUserListener(LISTENER);
    CometChat.removeConnectionListener(LISTENER);
}

const typingTimers = new Map<string, ReturnType<typeof setTimeout>>();
function setTyping(uid: string, on: boolean) {
    clearTimeout(typingTimers.get(uid));
    // Safety net when an "ended" event is lost.
    if (on)
        typingTimers.set(
            uid,
            setTimeout(() => setTyping(uid, false), 6000)
        );
    if (!!state.typing[uid] !== on) setState({ typing: { ...state.typing, [uid]: on } });
}

export function setPresence(uid: string, presence: Presence) {
    setState({ presence: { ...state.presence, [uid]: presence } });
}

async function refreshUnread() {
    try {
        const raw = (await CometChat.getUnreadMessageCountForAllUsers()) as Record<string, unknown>;
        const map = (raw && typeof raw.users === 'object' ? raw.users : raw) as Record<
            string,
            unknown
        >;
        const unread: Record<string, number> = {};
        for (const [uid, n] of Object.entries(map ?? {})) {
            if (typeof n === 'number' && n > 0 && uid !== viewingUid) unread[uid] = n;
        }
        setState({ unread });
    } catch {
        // Keep the last counts.
    }
}

const onOnline = () => {
    if (state.status === 'ready' && state.connection !== 'connected') {
        try {
            CometChat.connect();
        } catch {
            // The SDK reconnects by itself.
        }
    }
    if (state.status === 'error') void chatRuntime.start();
};

async function start() {
    const gen = generation;
    clearTimeout(retryTimer);
    setState({ status: 'connecting', message: undefined });
    let chat;
    try {
        chat = (await store.dispatch(chatApi.endpoints.createChatSession.initiate()).unwrap()).chat;
    } catch (err) {
        failFromServer(err);
        return;
    }
    try {
        await ensureInit(chat.appId, chat.region);
        const current = await CometChat.getLoggedinUser();
        // Reuse the SDK's session only when it is this person's current token (it survives a reload).
        if (
            current &&
            (current.getUid() !== chat.uid || current.getAuthToken() !== chat.authToken)
        ) {
            await CometChat.logout();
        }
        if (
            !current ||
            current.getUid() !== chat.uid ||
            current.getAuthToken() !== chat.authToken
        ) {
            await CometChat.login(chat.authToken);
        }
        if (gen !== generation) {
            await CometChat.logout().catch(() => undefined);
            return;
        }
        writeChatMark({ appId: chat.appId, region: chat.region });
        removeListeners();
        addListeners(chat.uid);
        window.addEventListener('online', onOnline);
        setState({ status: 'ready', me: chat.uid, connection: 'connected' });
        void refreshUnread();
    } catch (err) {
        const message =
            (err as Error)?.message === 'app_changed'
                ? 'Messages were updated. Reload the page to continue.'
                : 'Messages could not connect. Try again in a moment.';
        setState({ status: 'error', message });
    }
}

async function signOut(reason: 'signout' | 'switched') {
    generation++;
    clearCaches();
    const wasReady = state.status === 'ready';
    clearTimeout(retryTimer);
    window.removeEventListener('online', onOnline);
    if (viewingUid) {
        viewingUid = null;
        if (reason === 'signout') {
            await store
                .dispatch(chatApi.endpoints.setChatViewing.initiate({ withUid: null }))
                .unwrap()
                .catch(() => undefined);
        }
    }
    try {
        const mark = readChatMark();
        if (!initialisedAppId && mark) {
            // Session from before a reload: reach the SDK with the server's appId/region kept for this tab.
            await ensureInit(mark.appId, mark.region);
        }
        if (initialisedAppId && (wasReady || mark)) {
            removeListeners();
            await CometChat.logout();
        }
    } catch {
        // The server revokes the token at POST /auth/logout regardless.
    }
    starting = null;
    state = { ...initial, status: reason === 'switched' ? 'switched' : 'idle' };
    if (reason === 'switched') {
        state.message =
            'You signed in to a different account in another tab. Reload this page to continue.';
    }
    stateListeners.forEach((l) => l());
    liveUnreadStore.set(null);
}

export const chatRuntime = {
    /** Signs in to chat once per tab; later calls share the same promise. */
    start(): Promise<void> {
        if (state.status === 'ready' || state.status === 'switched') return Promise.resolve();
        if (!starting || state.status !== 'connecting') starting = start();
        return starting;
    },
    signOut,
    getState: () => state,
    subscribe(listener: () => void) {
        stateListeners.add(listener);
        return () => stateListeners.delete(listener);
    },
    onEvent(listener: (e: ChatEvent) => void) {
        eventListeners.add(listener);
        return () => eventListeners.delete(listener);
    },

    /** The conversation on screen (no pushes for it; contract section 6) and its unread count cleared. */
    setViewing(uid: string | null) {
        if (state.status !== 'ready') {
            viewingUid = null;
            return Promise.resolve();
        }
        viewingUid = uid;
        if (uid && state.unread[uid]) {
            const { [uid]: _cleared, ...rest } = state.unread;
            void _cleared;
            setState({ unread: rest });
        }
        return store
            .dispatch(chatApi.endpoints.setChatViewing.initiate({ withUid: uid }))
            .unwrap()
            .catch(() => undefined);
    },
    refreshUnread,

    messagesRequest: (uid: string) =>
        new CometChat.MessagesRequestBuilder()
            .setUID(uid)
            .setLimit(30)
            .hideReplies(true)
            .setCategories([CometChat.CATEGORY_MESSAGE])
            .build(),

    /** Messages after `afterId`, to catch up after a reconnect. */
    newerRequest: (uid: string, afterId: number) =>
        new CometChat.MessagesRequestBuilder()
            .setUID(uid)
            .setMessageId(afterId)
            .setLimit(50)
            .hideReplies(true)
            .setCategories([CometChat.CATEGORY_MESSAGE])
            .build(),

    conversationsRequest: () =>
        new CometChat.ConversationsRequestBuilder()
            .setLimit(50)
            .setConversationType(CometChat.RECEIVER_TYPE.USER)
            .withBlockedInfo(true)
            .build(),

    /** The conversation list, newest first. Callers share one request; the answer stays in the cache. */
    loadConversations(): Promise<CometChat.Conversation[]> {
        if (conversationsLoading) return conversationsLoading;
        const gen = generation;
        const load = chatRuntime
            .conversationsRequest()
            .fetchNext()
            .then((list) => {
                if (gen === generation) conversationsCache = list;
                return list;
            })
            .finally(() => {
                if (conversationsLoading === load) conversationsLoading = null;
            });
        conversationsLoading = load;
        return load;
    },
    cachedConversations: () => conversationsCache,
    cachedMessages: (uid: string) => messagesCache.get(uid) ?? null,
    rememberMessages,

    /**
     * Run once chat is signed in: loads the list and the latest messages of the newest conversations, so Messages
     * opens with content instead of a spinner. Failures are left to the screens, which load what is missing.
     */
    async prefetch() {
        if (state.status !== 'ready') return;
        const gen = generation;
        try {
            void store.dispatch(
                chatApi.endpoints.getChatContacts.initiate(undefined, { subscribe: false })
            );
            const list = await chatRuntime.loadConversations();
            const uids = list
                .map((c) => (c.getConversationWith() as CometChat.User)?.getUid?.())
                .filter((uid): uid is string => !!uid)
                .slice(0, 3);
            await Promise.all(
                uids.map(async (uid) => {
                    if (messagesCache.has(uid)) return;
                    const page = await chatRuntime.messagesRequest(uid).fetchPrevious();
                    if (gen === generation) rememberMessages(uid, page);
                })
            );
        } catch {
            // Nothing cached; the screens show their own loading and error states.
        }
    },

    async getUser(uid: string) {
        const user = await CometChat.getUser(uid);
        setPresence(uid, {
            online: user.getStatus() === 'online',
            lastActiveAt: ms(user.getLastActiveAt()),
        });
        return user;
    },

    /** Marks everything up to this incoming message as read (one-to-one: receiver id = the sender). */
    markRead(messageId: number, peer: string) {
        try {
            void Promise.resolve(
                CometChat.markAsRead(String(messageId), peer, CometChat.RECEIVER_TYPE.USER, peer)
            ).catch(() => undefined);
        } catch {
            // Read state catches up on the next message shown.
        }
    },

    startTyping: (uid: string) =>
        CometChat.startTyping(new CometChat.TypingIndicator(uid, CometChat.RECEIVER_TYPE.USER)),
    endTyping: (uid: string) =>
        CometChat.endTyping(new CometChat.TypingIndicator(uid, CometChat.RECEIVER_TYPE.USER)),

    async sendText(uid: string, text: string, muid: string) {
        const message = new CometChat.TextMessage(uid, text, CometChat.RECEIVER_TYPE.USER);
        message.setMuid(muid);
        return CometChat.sendMessage(message);
    },

    async sendFile(
        uid: string,
        file: File,
        kind: 'image' | 'file',
        muid: string,
        caption?: string
    ) {
        const message = new CometChat.MediaMessage(
            uid,
            file,
            kind === 'image' ? CometChat.MESSAGE_TYPE.IMAGE : CometChat.MESSAGE_TYPE.FILE,
            CometChat.RECEIVER_TYPE.USER
        );
        message.setMuid(muid);
        if (caption) message.setCaption(caption);
        return CometChat.sendMediaMessage(message);
    },
};

registerChatRuntime(chatRuntime);

export const errorCode = (err: unknown) => String((err as { code?: unknown })?.code ?? '');
