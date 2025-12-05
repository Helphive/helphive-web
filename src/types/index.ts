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
    { id: 1, name: 'Public Area Attendant', description: 'Cleaning and maintenance of public spaces' },
    { id: 2, name: 'Room Attendant', description: 'Hotel room cleaning and preparation' },
    { id: 3, name: 'Linen Porter', description: 'Linen handling and distribution' },
];

// Booking types
export type BookingStatus = 'pending' | 'paid' | 'accepted' | 'in_progress' | 'completed' | 'cancelled';

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
    amount: number;
    platformFee: number;
    startDate: string;
    startTime: string;
    address: string;
    latitude: number;
    longitude: number;
    status: BookingStatus;
    paymentIntentId?: string;
    clientSecret?: string;
    paymentStatus: 'pending' | 'completed' | 'refunded';
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
    userId: string;
    amount: number;
    date: string;
    status: 'pending' | 'available' | 'paid';
    transferId?: string;
}

export interface Payout {
    _id: string;
    userId: string;
    amount: number;
    currency: string;
    payoutId: string;
    status: 'pending' | 'in_transit' | 'paid' | 'failed' | 'cancelled';
    createdAt: string;
}

export interface EarningsData {
    totalEarnings: number;
    availableBalance: number;
    pendingBalance: number;
    monthlyEarnings: { month: string; amount: number }[];
    payouts: Payout[];
}

// Notification types
export interface Notification {
    _id: string;
    userId: string;
    title: string;
    message: string;
    screen?: string;
    data?: Record<string, unknown>;
    read: boolean;
    createdAt: string;
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
