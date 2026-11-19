import { useEffect, useState } from 'react';
import { Link as RouterLink, useNavigate, useParams } from 'react-router-dom';
import { Alert, Button, Typography } from '@mui/material';
import dayjs from 'dayjs';
import {
    useGetProviderBookingByIdMutation,
    useAcceptBookingMutation,
} from '@/features/provider/providerApi';
import BookingDetailView from '@/components/common/BookingDetailView';
import { ConfirmDialog, DataList, DataRow, DetailSkeleton, ErrorState } from '@/components/ui';
import PageHeader from '@/components/ui/PageHeader';
import { useSnackbar } from '@/components/feedback/snackbarContext';
import { useBookingLoader } from '@/hooks/useBookingLoader';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { formatMoney, getDisplayStatus, getErrorMessage, formatDay } from '@/utils/format';
import EarningsBreakdown from './components/EarningsBreakdown';
import { orderCode, orderEarnings, timeRange } from './orderUtils';

// Details of an open (unassigned) order with the accept action.
export default function OrderDetails() {
    const { bookingId } = useParams<{ bookingId: string }>();
    const navigate = useNavigate();
    const snackbar = useSnackbar();
    useDocumentTitle('Available order');

    const [confirmOpen, setConfirmOpen] = useState(false);
    const [getBooking] = useGetProviderBookingByIdMutation();
    const [acceptBooking, { isLoading: isAccepting }] = useAcceptBookingMutation();
    const { booking, error, loading, reloading, reload } = useBookingLoader(bookingId, getBooking);

    // Already-assigned bookings live under My orders.
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
            snackbar.error(getErrorMessage(err, 'Could not accept the order'));
        }
    };

    if (loading || assigned) return <DetailSkeleton label="Loading order" />;

    if (error || !booking) {
        return (
            <>
                <PageHeader
                    title="Order details"
                    backTo="/provider/orders"
                    backLabel="Back to available orders"
                />
                <ErrorState
                    title="Could not load this order"
                    message={error || 'This order was not found. It may have been removed.'}
                    onRetry={() => void reload()}
                    retrying={reloading}
                    action={
                        <Button component={RouterLink} to="/provider/orders" variant="outlined">
                            Available orders
                        </Button>
                    }
                />
            </>
        );
    }

    const status = getDisplayStatus(booking);
    const canAccept = status === 'scheduled';
    const start = dayjs(booking.startDate);

    return (
        <>
            <PageHeader
                title={`Order ${orderCode(booking._id)}`}
                subtitle="Review the job and your pay before you accept"
                backTo="/provider/orders"
                backLabel="Back to available orders"
            />
            <BookingDetailView
                booking={booking}
                counterpart={{ title: 'Customer', person: booking.userId }}
                priceCard={<EarningsBreakdown booking={booking} />}
                actions={
                    canAccept ? (
                        <>
                            <Button
                                variant="contained"
                                fullWidth
                                size="large"
                                onClick={() => setConfirmOpen(true)}
                            >
                                Accept order
                            </Button>
                            <Typography variant="caption" sx={{ display: 'block' }}>
                                Accepting commits you to arrive at the scheduled time. You can
                                cancel from My orders before you start.
                            </Typography>
                        </>
                    ) : (
                        <Alert severity="info">
                            This order can no longer be accepted. Browse available orders for other
                            jobs.
                        </Alert>
                    )
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
            >
                <DataList variant="inline">
                    <DataRow label="Date" value={formatDay(start)} />
                    <DataRow label="Time" value={timeRange(booking)} />
                    <DataRow label="You earn" value={formatMoney(orderEarnings(booking))} />
                </DataList>
            </ConfirmDialog>
        </>
    );
}
