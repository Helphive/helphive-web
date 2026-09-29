import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import { ThemeProvider } from '@/theme/ThemeContext';
import SnackbarProvider from '@/components/feedback/SnackbarProvider';
import { useAppSelector } from '@/store/hooks';
import { selectIsAuthenticated, selectCurrentUser } from '@/features/auth/authSlice';

// Layouts
import AuthLayout from '@/layouts/AuthLayout';
import DashboardLayout from '@/layouts/DashboardLayout';

// Public pages
import LandingPage from '@/pages/public/LandingPage';
import LoginPage from '@/pages/auth/LoginPage';
import SignupPage from '@/pages/auth/SignupPage';
import ProviderSignupPage from '@/pages/auth/ProviderSignupPage';
import ForgotPasswordPage from '@/pages/auth/ForgotPasswordPage';

// User pages
const UserDashboard = lazy(() => import('@/pages/user/UserDashboard'));
const BookingPayment = lazy(() => import('@/pages/user/BookingPayment'));
const BookingDetails = lazy(() => import('@/pages/user/BookingDetails'));

// Shared pages
const NotificationsPage = lazy(() => import('@/pages/shared/NotificationsPage'));
const ReceiptPage = lazy(() => import('@/pages/shared/ReceiptPage'));
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'));

// Provider pages
const ProviderDashboard = lazy(() => import('@/pages/provider/ProviderDashboard'));
const ProviderOnboarding = lazy(() => import('@/pages/provider/ProviderOnboarding'));
const AccountPending = lazy(() => import('@/pages/provider/AccountPending'));
const AccountRejected = lazy(() => import('@/pages/provider/AccountRejected'));
const AccountApproved = lazy(() => import('@/pages/provider/AccountApproved'));
const AvailableOrders = lazy(() => import('@/pages/provider/AvailableOrders'));
const OrderDetails = lazy(() => import('@/pages/provider/OrderDetails'));
const MyOrders = lazy(() => import('@/pages/provider/MyOrders'));
const MyOrderDetails = lazy(() => import('@/pages/provider/MyOrderDetails'));
const Earnings = lazy(() => import('@/pages/provider/Earnings'));

// Helper to check if user has a role (handles object, array, and string formats)
function hasRole(roles: unknown, role: string): boolean {
    if (!roles) return false;
    const roleLower = role.toLowerCase();

    // Handle object format: { "User": false, "Provider": true }
    if (typeof roles === 'object' && !Array.isArray(roles)) {
        const rolesObj = roles as Record<string, boolean>;
        // Check for exact match first
        if (role in rolesObj) return rolesObj[role] === true;
        // Check case-insensitive
        const key = Object.keys(rolesObj).find((k) => k.toLowerCase() === roleLower);
        return key ? rolesObj[key] === true : false;
    }

    // Handle array format: ["User", "Provider"]
    if (Array.isArray(roles)) {
        return roles.some((r) => typeof r === 'string' && r.toLowerCase() === roleLower);
    }

    // Handle string format: "Provider" or "User,Provider"
    if (typeof roles === 'string') {
        return (
            roles.toLowerCase() === roleLower ||
            roles.split(',').some((r) => r.trim().toLowerCase() === roleLower)
        );
    }

    return false;
}

// Protected Route wrapper
function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const isAuthenticated = useAppSelector(selectIsAuthenticated);

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return <>{children}</>;
}

// Provider Dashboard Route - only for approved providers who have seen the approval screen
function ApprovedProviderRoute({ children }: { children: React.ReactNode }) {
    const isAuthenticated = useAppSelector(selectIsAuthenticated);
    const user = useAppSelector(selectCurrentUser);

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (!hasRole(user?.roles, 'Provider')) {
        return <Navigate to="/user" replace />;
    }

    // Redirect based on provider status
    if (user?.providerStatus === 'pending') {
        return <Navigate to="/provider/pending" replace />;
    }
    if (user?.providerStatus === 'rejected') {
        return <Navigate to="/provider/rejected" replace />;
    }
    if (user?.providerStatus !== 'approved') {
        return <Navigate to="/provider/onboarding" replace />;
    }

    // If approved but haven't seen the welcome screen yet, show it
    if (!user?.providerAccountApproval) {
        return <Navigate to="/provider/approved" replace />;
    }

    return <>{children}</>;
}

// Provider Onboarding Route - only for non-approved providers
function OnboardingRoute({ children }: { children: React.ReactNode }) {
    const isAuthenticated = useAppSelector(selectIsAuthenticated);
    const user = useAppSelector(selectCurrentUser);

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (!hasRole(user?.roles, 'Provider')) {
        return <Navigate to="/user" replace />;
    }

    // If already approved, redirect to dashboard
    if (user?.providerStatus === 'approved') {
        return <Navigate to="/provider" replace />;
    }

    return <>{children}</>;
}

// Home redirect based on user role
function HomeRedirect() {
    const user = useAppSelector(selectCurrentUser);

    // Default to user dashboard if no user or roles
    if (!user) {
        return <Navigate to="/user" replace />;
    }

    if (hasRole(user.roles, 'Provider')) {
        if (user.providerStatus === 'approved') {
            return <Navigate to="/provider" replace />;
        } else if (user.providerStatus === 'pending') {
            return <Navigate to="/provider/pending" replace />;
        } else if (user.providerStatus === 'rejected') {
            return <Navigate to="/provider/rejected" replace />;
        } else {
            return <Navigate to="/provider/onboarding" replace />;
        }
    }

    return <Navigate to="/user" replace />;
}

const PageLoader = () => (
    <Box
        sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}
    >
        <CircularProgress />
    </Box>
);

function App() {
    return (
        <ThemeProvider>
            <SnackbarProvider>
                <Suspense fallback={<PageLoader />}>
                    <Routes>
                        {/* Public routes */}
                        <Route path="/" element={<LandingPage />} />

                        {/* Auth routes */}
                        <Route element={<AuthLayout />}>
                            <Route path="/login" element={<LoginPage />} />
                            <Route path="/signup" element={<SignupPage />} />
                            <Route path="/provider-signup" element={<ProviderSignupPage />} />
                            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                        </Route>

                        {/* Home redirect */}
                        <Route
                            path="/home"
                            element={
                                <ProtectedRoute>
                                    <HomeRedirect />
                                </ProtectedRoute>
                            }
                        />

                        {/* User routes */}
                        <Route
                            path="/user"
                            element={
                                <ProtectedRoute>
                                    <DashboardLayout userType="user" />
                                </ProtectedRoute>
                            }
                        >
                            <Route index element={<UserDashboard />} />
                            <Route path="booking/:bookingId" element={<BookingDetails />} />
                            <Route
                                path="booking/:bookingId/receipt"
                                element={<ReceiptPage area="user" />}
                            />
                            <Route path="payment" element={<BookingPayment />} />
                            <Route
                                path="notifications"
                                element={<NotificationsPage area="user" />}
                            />
                            <Route path="*" element={<NotFoundPage />} />
                        </Route>

                        {/* Provider routes - only for approved providers */}
                        <Route
                            path="/provider"
                            element={
                                <ApprovedProviderRoute>
                                    <DashboardLayout userType="provider" />
                                </ApprovedProviderRoute>
                            }
                        >
                            <Route index element={<ProviderDashboard />} />
                            <Route path="orders" element={<AvailableOrders />} />
                            <Route path="orders/:bookingId" element={<OrderDetails />} />
                            <Route path="my-orders" element={<MyOrders />} />
                            <Route path="my-orders/:bookingId" element={<MyOrderDetails />} />
                            <Route
                                path="orders/:bookingId/receipt"
                                element={<ReceiptPage area="provider" />}
                            />
                            <Route
                                path="my-orders/:bookingId/receipt"
                                element={<ReceiptPage area="provider" />}
                            />
                            <Route path="earnings" element={<Earnings />} />
                            <Route
                                path="notifications"
                                element={<NotificationsPage area="provider" />}
                            />
                            <Route path="*" element={<NotFoundPage />} />
                        </Route>

                        {/* Provider onboarding routes (without dashboard layout) - only for non-approved */}
                        <Route
                            path="/provider/onboarding"
                            element={
                                <OnboardingRoute>
                                    <ProviderOnboarding />
                                </OnboardingRoute>
                            }
                        />
                        <Route
                            path="/provider/pending"
                            element={
                                <OnboardingRoute>
                                    <AccountPending />
                                </OnboardingRoute>
                            }
                        />
                        <Route
                            path="/provider/rejected"
                            element={
                                <OnboardingRoute>
                                    <AccountRejected />
                                </OnboardingRoute>
                            }
                        />
                        <Route
                            path="/provider/approved"
                            element={
                                <ProtectedRoute>
                                    <AccountApproved />
                                </ProtectedRoute>
                            }
                        />

                        {/* Catch all */}
                        <Route path="*" element={<NotFoundPage />} />
                    </Routes>
                </Suspense>
            </SnackbarProvider>
        </ThemeProvider>
    );
}

export default App;
