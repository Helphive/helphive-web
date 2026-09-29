import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button, Card, CardContent, Divider, Typography } from '@mui/material';
import {
    useGetProviderBookingByIdMutation,
    useAcceptBookingMutation,
} from '@/features/provider/providerApi';
import BookingDetailView from '@/components/common/BookingDetailView';
import { PriceRow } from '@/components/common/InfoRow';
import PageHeader from '@/components/common/PageHeader';
import { DetailSkeleton, ErrorState } from '@/components/common/PageStates';
import ConfirmDialog from '@/components/feedback/ConfirmDialog';
import { useSnackbar } from '@/components/feedback/snackbarContext';
import { useBookingLoader } from '@/hooks/useBookingLoader';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { PLATFORM_FEE_RATE, formatMoney, getDisplayStatus, getErrorMessage } from '@/utils/format';

// Details of an open (unassigned) order with the accept action.
export default function OrderDetails() {
    const { bookingId } = useParams<{ bookingId: string }>();
    const navigate = useNavigate();
    const snackbar = useSnackbar();
    useDocumentTitle('Available order');

    const [confirmOpen, setConfirmOpen] = useState(false);
    const [getBooking] = useGetProviderBookingByIdMutation();
    const [acceptBooking, { isLoading: isAccepting }] = useAcceptBookingMutation();
    const { booking, error, loading, reload } = useBookingLoader(bookingId, getBooking);

    // Already-assigned bookings live under My Orders.
    const assigned = !!booking?.providerId;
    useEffect(() => {
        if (assigned && bookingId) navigate(`/provider/my-orders/${bookingId}`, { replace: true });
    }, [assigned, bookingId, navigate]);

    const handleAccept = async () => {
        try {
            await acceptBooking({ bookingId: bookingId! }).unwrap();
            snackbar.success('Order accepted');
            navigate(`/provider/my-orders/${bookingId}`);
        } catch (err) {
            setConfirmOpen(false);
            snackbar.error(getErrorMessage(err, 'Failed to accept order'));
        }
    };

    if (loading || assigned) return <DetailSkeleton />;

    if (error || !booking) {
        return (
            <ErrorState
                title="Order details"
                message={error || 'Order not found'}
                backTo="/provider/orders"
                backLabel="Back to available orders"
                onRetry={reload}
            />
        );
    }

    const status = getDisplayStatus(booking);
    const subtotal = (booking.rate || 0) * (booking.hours || 0);
    const platformFee = subtotal * PLATFORM_FEE_RATE;
    const canAccept = status === 'scheduled';

    const priceCard = (
        <Card>
            <CardContent>
                <Typography variant="h6" fontWeight={700} sx={{ mb: 1.5 }}>
                    Earnings breakdown
                </Typography>
                <PriceRow label="Hourly rate" value={formatMoney(booking.rate)} />
                <PriceRow label="Hours" value={String(booking.hours || 0)} />
                <PriceRow label="Subtotal" value={formatMoney(subtotal)} />
                <PriceRow
                    label={`Platform fee (${PLATFORM_FEE_RATE * 100}%)`}
                    value={`-${formatMoney(platformFee)}`}
                    color="error.main"
                />
                <Divider sx={{ my: 1 }} />
                <PriceRow
                    label="Your earnings"
                    value={formatMoney(subtotal - platformFee)}
                    color="success.main"
                    strong
                />
            </CardContent>
        </Card>
    );

    return (
        <>
            <PageHeader
                title="Order details"
                backTo="/provider/orders"
                backLabel="Back to available orders"
            />
            <BookingDetailView
                booking={booking}
                counterpart={{ title: 'Customer', person: booking.userId }}
                priceCard={priceCard}
                actions={
                    canAccept ? (
                        <Button
                            variant="contained"
                            fullWidth
                            size="large"
                            onClick={() => setConfirmOpen(true)}
                        >
                            Accept order
                        </Button>
                    ) : undefined
                }
            />
            <ConfirmDialog
                open={confirmOpen}
                title="Accept this order?"
                description="You are committing to complete this job at the scheduled time."
                confirmLabel="Accept order"
                loading={isAccepting}
                onConfirm={handleAccept}
                onClose={() => setConfirmOpen(false)}
            />
        </>
    );
}
