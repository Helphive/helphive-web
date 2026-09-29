// User types
export interface User {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    profile?: string;
    rating?: number;
    verified?: boolean;
    roles: Record<string, boolean> | string[] | string;
    providerStatus?: 'pending' | 'approved' | 'rejected' | 'none';
    providerAccountApproval?: boolean; // true if user has seen the approval welcome screen
    stripeConnectedAccountId?: string;
    availableBalance?: number;
    isProviderAvailable?: boolean;
    selectedJobTypes?: number[] | { id: number; name: string; _id?: string }[];
    currentLocation?: {
        latitude: number;
        longitude: number;
    };
}

// Service types
export interface Service {
    id: number;
    name: string;
    description?: string;
    icon?: string;
}

export const SERVICES: Service[] = [
    {
        id: 1,
        name: 'Public Area Attendant',
        description: 'Cleaning and maintenance of public spaces',
    },
    { id: 2, name: 'Room Attendant', description: 'Hotel room cleaning and preparation' },
    { id: 3, name: 'Linen Porter', description: 'Linen handling and distribution' },
];

// Booking types
// Raw status stored by the backend.
export type BookingStatus = 'pending' | 'in progress' | 'completed' | 'cancelled';

// Derived by the backend on every booking object.
export type DisplayStatus =
    | 'scheduled'
    | 'accepted'
    | 'awaiting_start_approval'
    | 'in_progress'
    | 'completed'
    | 'cancelled'
    | 'expired';

export interface BookingPaymentSummary {
    amount: number;
    date?: string;
    status: string;
    paymentIntentId?: string;
}

export interface Booking {
    _id: string;
    userId: User | string;
    providerId?: User | string;
    service: {
        id: number;
        name: string;
    };
    rate: number;
    hours: number;
    amount?: number;
    platformFee?: number;
    startDate: string;
    startTime: string;
    address: string;
    latitude: number;
    longitude: number;
    status: BookingStatus;
    displayStatus?: DisplayStatus;
    payments?: BookingPaymentSummary[];
    paymentIntentId?: string;
    clientSecret?: string;
    paymentStatus?: 'pending' | 'completed' | 'refunded';
    userApprovalRequested?: boolean;
    startedAt?: string;
    completedAt?: string;
    completedBy?: string;
    cancelledAt?: string;
    cancelledBy?: string;
    cancellationReason?: string;
    createdAt: string;
    updatedAt: string;
}

// Provider application types
export interface ProviderApplication {
    _id: string;
    userId: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    country: string;
    state: string;
    city: string;
    street: string;
    id: string; // ID document URL
    dbs: string; // DBS document URL
    resume: string;
    profile: string;
    publicAreaAttendant: boolean;
    roomAttendant: boolean;
    linenPorter: boolean;
    status: 'pending' | 'approved' | 'rejected';
    rejectReason?: string;
    createdAt: string;
}

// Earnings types
export interface Earning {
    _id: string;
    bookingId: string;
    amount: number;
    date: string;
    status: 'pending' | 'completed' | 'cancelled';
    completionDate?: string | null;
    transferId?: string | null;
    createdAt?: string;
}

export interface Payout {
    _id: string;
    userId?: string;
    amount: number;
    currency: string;
    payoutId: string;
    status: 'pending' | 'in_transit' | 'paid' | 'failed' | 'cancelled';
    createdAt: string;
}

export interface EarningsData {
    availableBalance: number;
    earnings?: Earning[];
    payouts: Payout[];
    // Older API versions returned pre-computed aggregates.
    totalEarnings?: number;
    pendingBalance?: number;
    monthlyEarnings?: { month: string; amount: number }[];
}

// Notification types
export type NotificationType =
    | 'booking_created'
    | 'booking_accepted'
    | 'booking_start_requested'
    | 'booking_started'
    | 'booking_completed'
    | 'booking_cancelled'
    | 'booking_expired'
    | 'payment_succeeded'
    | 'payment_refunded'
    | 'payout_paid'
    | 'account_approved'
    | 'account_rejected'
    | 'general';

export interface Notification {
    _id: string;
    title: string;
    message: string;
    type: NotificationType;
    screen?: string;
    data?: Record<string, unknown>;
    bookingId?: string | null;
    read: boolean;
    createdAt: string;
    updatedAt?: string;
}

export interface BookingReceipt {
    receiptNumber: string;
    issuedAt: string;
    bookingId: string;
    status: string;
    service: { id: number; name: string };
    rate: number;
    hours: number;
    subtotal: number;
    total: number;
    currency: string;
    payment: {
        status: string;
        amount: number;
        paidAt: string | null;
        refundStatus: string | null;
        refundAmount: number;
        refundedAt: string | null;
    } | null;
    customer: { name: string; email: string };
    provider: { name: string } | null;
    address: string;
    startDate: string;
    startedAt: string | null;
    completedAt: string | null;
    cancelledAt: string | null;
    cancellationReason: string | null;
    earning: { amount: number; status: string } | null;
}

// API response types
export interface ApiResponse<T> {
    success: boolean;
    message?: string;
    data?: T;
}

export interface AuthResponse {
    accessToken: string;
    refreshToken: string;
    user: User;
}

export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
    hasMore: boolean;
}
