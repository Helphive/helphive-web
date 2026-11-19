// Chat endpoints from the chat contract (scratch/chat/chat-contract.md). Imported only by lazy chunks.
import { apiSlice } from '@/store/api/apiSlice';

export interface ChatSession {
    provider: 'cometchat';
    appId: string;
    region: string;
    uid: string;
    authToken: string;
    issued: boolean;
}

export interface ChatPerson {
    uid: string;
    firstName?: string;
    lastName?: string;
    profile?: string;
    avatar?: string;
}

export interface ChatContact extends ChatPerson {
    role?: 'customer' | 'provider' | string;
    /** When the chat closes if nothing changes; null while a booking is active. */
    until: string | null;
    bookingIds: string[];
}

export interface BookingConversation {
    conversation: {
        type: 'user';
        withUid: string;
        counterparty: ChatPerson;
        open: boolean;
        until: string | null;
        bookingId: string;
    } | null;
    reason: 'not_accepted' | 'closed' | null;
    message?: string;
}

export type ReportCategory = 'harassment' | 'spam' | 'inappropriate' | 'safety' | 'fraud' | 'other';

/** Error shape after transformErrorResponse: HTTP status, server code and message, Retry-After seconds. */
export interface ChatApiError {
    status: number | string;
    data?: { message?: string; code?: string };
    retryAfter?: number;
}

const withRetryAfter = (
    response: { status: number | string; data?: unknown },
    meta: { response?: Response } | undefined
): ChatApiError => {
    const header = Number(meta?.response?.headers.get('Retry-After'));
    return {
        status: response.status,
        data: response.data as ChatApiError['data'],
        retryAfter: Number.isFinite(header) && header > 0 ? header : undefined,
    };
};

const api = apiSlice.enhanceEndpoints({ addTagTypes: ['ChatContacts', 'ChatBlocks'] });

export const chatApi = api.injectEndpoints({
    endpoints: (builder) => ({
        createChatSession: builder.mutation<{ chat: ChatSession }, void>({
            query: () => ({ url: '/auth/chat/session', method: 'POST' }),
            transformErrorResponse: withRetryAfter,
        }),
        getBookingConversation: builder.query<BookingConversation, string>({
            query: (bookingId) =>
                `/auth/chat/bookings/${encodeURIComponent(bookingId)}/conversation`,
        }),
        getChatContacts: builder.query<{ contacts: ChatContact[] }, void>({
            query: () => '/auth/chat/contacts',
            providesTags: ['ChatContacts'],
        }),
        setChatViewing: builder.mutation<unknown, { withUid: string | null }>({
            query: (body) => ({ url: '/auth/chat/viewing', method: 'PUT', body }),
        }),
        getChatBlocks: builder.query<{ blocked: { uid: string; at: string }[] }, void>({
            query: () => '/auth/chat/blocks',
            providesTags: ['ChatBlocks'],
        }),
        blockChatUser: builder.mutation<unknown, { uid: string }>({
            query: (body) => ({ url: '/auth/chat/blocks', method: 'POST', body }),
            invalidatesTags: ['ChatBlocks'],
        }),
        unblockChatUser: builder.mutation<unknown, { uid: string }>({
            query: ({ uid }) => ({
                url: `/auth/chat/blocks/${encodeURIComponent(uid)}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['ChatBlocks'],
        }),
        reportChat: builder.mutation<
            { report: { _id: string; status: string }; duplicate?: boolean },
            { reportedUid: string; category: ReportCategory; details?: string; messageId?: string }
        >({
            query: (body) => ({ url: '/auth/chat/reports', method: 'POST', body }),
        }),
    }),
});

export const {
    useGetBookingConversationQuery,
    useGetChatContactsQuery,
    useGetChatBlocksQuery,
    useBlockChatUserMutation,
    useUnblockChatUserMutation,
    useReportChatMutation,
} = chatApi;
