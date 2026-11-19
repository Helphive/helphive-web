import { useEffect, useState } from 'react';
import { Link as RouterLink, useNavigate, useParams } from 'react-router-dom';
import { Alert, Button, TextField } from '@mui/material';
import {
    useGetProviderBookingByIdMutation,
    useStartBookingMutation,
} from '@/features/provider/providerApi';
import {
    useCompleteBookingMutation,
    useCancelBookingMutation,
} from '@/features/booking/bookingApi';
import BookingDetailView from '@/components/common/BookingDetailView';
import BookingChatAction from '@/features/chat/BookingChatAction';
import { ConfirmDialog, DetailSkeleton, ErrorState, PageHeader } from '@/components/ui';
import { useSnackbar } from '@/components/feedback/snackbarContext';
import { useBookingLoader } from '@/hooks/useBookingLoader';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { getDisplayStatus, getErrorMessage } from '@/utils/format';
import EarningsBreakdown from './components/EarningsBreakdown';
import { orderCode } from './orderUtils';

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
    const { booking, error, loading, reloading, reload } = useBookingLoader(bookingId, getBooking);

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

    if (loading || unassigned) return <DetailSkeleton label="Loading order" />;

    if (error || !booking) {
        return (
            <>
                <PageHeader
                    title="Order details"
                    backTo="/provider/my-orders"
                    backLabel="Back to my orders"
                />
                <ErrorState
                    title="Could not load this order"
                    message={error || 'This order was not found. It may have been removed.'}
                    onRetry={() => void reload()}
                    retrying={reloading}
                    action={
                        <Button component={RouterLink} to="/provider/my-orders" variant="outlined">
                            My orders
                        </Button>
                    }
                />
            </>
        );
    }

    const status = getDisplayStatus(booking);

    const actions = (
        <>
            <BookingChatAction bookingId={booking._id} area="provider" />
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
                title={`Order ${orderCode(booking._id)}`}
                backTo="/provider/my-orders"
                backLabel="Back to my orders"
            />
            <BookingDetailView
                booking={booking}
                counterpart={{ title: 'Customer', person: booking.userId }}
                priceCard={<EarningsBreakdown booking={booking} />}
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
                        'Could not start the job'
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
                        'Could not complete the job'
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
                        'Could not cancel the order'
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
