import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Alert, Button, Card, CardContent, Divider, TextField, Typography } from '@mui/material';
import {
    useGetProviderBookingByIdMutation,
    useStartBookingMutation,
} from '@/features/provider/providerApi';
import {
    useCompleteBookingMutation,
    useCancelBookingMutation,
} from '@/features/booking/bookingApi';
import BookingDetailView from '@/components/common/BookingDetailView';
import { PriceRow } from '@/components/common/InfoRow';
import PageHeader from '@/components/common/PageHeader';
import { DetailSkeleton, ErrorState } from '@/components/common/PageStates';
import ConfirmDialog from '@/components/feedback/ConfirmDialog';
import { useSnackbar } from '@/components/feedback/snackbarContext';
import { useBookingLoader } from '@/hooks/useBookingLoader';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { PLATFORM_FEE_RATE, formatMoney, getDisplayStatus, getErrorMessage } from '@/utils/format';

type Dialog = 'start' | 'complete' | 'cancel' | null;

export default function MyOrderDetails() {
    const { bookingId } = useParams<{ bookingId: string }>();
    const navigate = useNavigate();
    const snackbar = useSnackbar();
    useDocumentTitle('Order details');

    const [dialog, setDialog] = useState<Dialog>(null);
    const [cancelReason, setCancelReason] = useState('');

    const [getBooking] = useGetProviderBookingByIdMutation();
    const [startBooking, { isLoading: isStarting }] = useStartBookingMutation();
    const [completeBooking, { isLoading: isCompleting }] = useCompleteBookingMutation();
    const [cancelBooking, { isLoading: isCancelling }] = useCancelBookingMutation();
    const { booking, error, loading, reload } = useBookingLoader(bookingId, getBooking);

    // Unassigned bookings (e.g. opened from a notification) are accepted on the open-orders page.
    const unassigned = !!booking && !booking.providerId && booking.status === 'pending';
    useEffect(() => {
        if (unassigned && bookingId) navigate(`/provider/orders/${bookingId}`, { replace: true });
    }, [unassigned, bookingId, navigate]);

    const run = async (
        action: () => Promise<unknown>,
        successMessage: string,
        failureMessage: string
    ) => {
        try {
            await action();
            setDialog(null);
            snackbar.success(successMessage);
            void reload();
        } catch (err) {
            snackbar.error(getErrorMessage(err, failureMessage));
        }
    };

    if (loading || unassigned) return <DetailSkeleton />;

    if (error || !booking) {
        return (
            <ErrorState
                title="Order details"
                message={error || 'Order not found'}
                backTo="/provider/my-orders"
                backLabel="Back to my orders"
                onRetry={reload}
            />
        );
    }

    const status = getDisplayStatus(booking);
    const subtotal = (booking.rate || 0) * (booking.hours || 0);
    const platformFee = subtotal * PLATFORM_FEE_RATE;
    const earnings = subtotal - platformFee;

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
                    value={formatMoney(earnings)}
                    color="success.main"
                    strong
                />
            </CardContent>
        </Card>
    );

    const actions = (
        <>
            {status === 'accepted' && (
                <Button
                    variant="contained"
                    fullWidth
                    size="large"
                    onClick={() => setDialog('start')}
                >
                    Start job
                </Button>
            )}
            {status === 'awaiting_start_approval' && (
                <Alert severity="info">Waiting for the customer to approve the job start.</Alert>
            )}
            {status === 'in_progress' && (
                <Button
                    variant="contained"
                    color="success"
                    fullWidth
                    size="large"
                    onClick={() => setDialog('complete')}
                >
                    Complete job
                </Button>
            )}
            {(status === 'accepted' || status === 'awaiting_start_approval') && (
                <Button
                    variant="outlined"
                    color="error"
                    fullWidth
                    onClick={() => setDialog('cancel')}
                >
                    Cancel order
                </Button>
            )}
            {status === 'completed' && (
                <Alert severity="success">This job has been completed.</Alert>
            )}
            {status === 'cancelled' && <Alert severity="error">This order was cancelled.</Alert>}
        </>
    );

    return (
        <>
            <PageHeader
                title="Order details"
                backTo="/provider/my-orders"
                backLabel="Back to my orders"
            />
            <BookingDetailView
                booking={booking}
                counterpart={{ title: 'Customer', person: booking.userId }}
                priceCard={priceCard}
                actions={actions}
                receiptPath={`/provider/orders/${booking._id}/receipt`}
            />

            <ConfirmDialog
                open={dialog === 'start'}
                title="Start this job?"
                description="The customer will be asked to approve the start. The job begins once they approve."
                confirmLabel="Send start request"
                loading={isStarting}
                onConfirm={() =>
                    run(
                        () => startBooking({ bookingId: bookingId! }).unwrap(),
                        'Start request sent to the customer',
                        'Failed to start job'
                    )
                }
                onClose={() => setDialog(null)}
            />
            <ConfirmDialog
                open={dialog === 'complete'}
                title="Complete this job?"
                description="Confirm the work is finished. Your earnings will be released after processing."
                confirmLabel="Complete job"
                confirmColor="success"
                loading={isCompleting}
                onConfirm={() =>
                    run(
                        () => completeBooking({ bookingId: bookingId! }).unwrap(),
                        'Job completed',
                        'Failed to complete job'
                    )
                }
                onClose={() => setDialog(null)}
            />
            <ConfirmDialog
                open={dialog === 'cancel'}
                title="Cancel this order?"
                description="The customer will be notified and refunded."
                confirmLabel="Cancel order"
                cancelLabel="Keep order"
                confirmColor="error"
                loading={isCancelling}
                onConfirm={() =>
                    run(
                        () =>
                            cancelBooking({
                                bookingId: bookingId!,
                                reason: cancelReason.trim() || undefined,
                            }).unwrap(),
                        'Order cancelled',
                        'Failed to cancel order'
                    )
                }
                onClose={() => setDialog(null)}
            >
                <TextField
                    fullWidth
                    label="Reason (optional)"
                    multiline
                    rows={3}
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                />
            </ConfirmDialog>
        </>
    );
}
