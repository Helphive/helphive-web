import { useState } from 'react';
import { Link as RouterLink, useParams } from 'react-router-dom';
import { Box, Button, TextField } from '@mui/material';
import {
    useGetBookingByIdMutation,
    useCancelBookingMutation,
    useApproveStartJobRequestMutation,
} from '@/features/booking/bookingApi';
import BookingDetailView from '@/components/common/BookingDetailView';
import BookingChatAction from '@/features/chat/BookingChatAction';
import { useSnackbar } from '@/components/feedback/snackbarContext';
import {
    ConfirmDialog,
    DataList,
    DataRow,
    DetailSkeleton,
    ErrorState,
    Money,
    PageHeader,
    Panel,
    StatusPill,
} from '@/components/ui';
import { useBookingLoader, type BookingPayment } from '@/hooks/useBookingLoader';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { getDisplayStatus, getErrorMessage } from '@/utils/format';

function PaymentPill({ payment }: { payment: BookingPayment | null }) {
    if (!payment) return null;
    if (payment.refundId) {
        if (payment.refundStatus === 'succeeded') {
            return <StatusPill tone="blue">Refunded</StatusPill>;
        }
        if (payment.refundStatus === 'failed' || payment.refundStatus === 'cancelled') {
            return <StatusPill tone="red">Refund failed</StatusPill>;
        }
        return <StatusPill tone="amber">Refund pending</StatusPill>;
    }
    return payment.status === 'completed' ? (
        <StatusPill tone="green">Paid</StatusPill>
    ) : (
        <StatusPill tone="amber">Payment pending</StatusPill>
    );
}

export default function BookingDetails() {
    const { bookingId } = useParams<{ bookingId: string }>();
    const snackbar = useSnackbar();
    useDocumentTitle('Booking details');

    const [cancelOpen, setCancelOpen] = useState(false);
    const [approveOpen, setApproveOpen] = useState(false);
    const [cancelReason, setCancelReason] = useState('');

    const [getBooking] = useGetBookingByIdMutation();
    const [cancelBooking, { isLoading: isCancelling }] = useCancelBookingMutation();
    const [approveStartJob, { isLoading: isApproving }] = useApproveStartJobRequestMutation();
    const { booking, payment, error, loading, reloading, reload } = useBookingLoader(
        bookingId,
        getBooking
    );

    const handleCancel = async () => {
        try {
            await cancelBooking({
                bookingId: bookingId!,
                reason: cancelReason.trim() || undefined,
            }).unwrap();
            setCancelOpen(false);
            setCancelReason('');
            snackbar.success('Booking cancelled. Any payment will be refunded.');
            void reload();
        } catch (err) {
            snackbar.error(getErrorMessage(err, 'Could not cancel the booking. Try again.'));
        }
    };

    const handleApproveStart = async () => {
        try {
            await approveStartJob({ bookingId: bookingId! }).unwrap();
            setApproveOpen(false);
            snackbar.success('Job start approved');
            void reload();
        } catch (err) {
            snackbar.error(getErrorMessage(err, 'Could not approve the job start. Try again.'));
        }
    };

    if (loading) return <DetailSkeleton label="Loading booking" />;

    if (error || !booking) {
        return (
            <>
                <PageHeader title="Booking details" backTo="/user" backLabel="Back to bookings" />
                <ErrorState
                    title="Could not load this booking"
                    message={error || 'This booking was not found. It may have been removed.'}
                    onRetry={() => void reload()}
                    retrying={reloading}
                    action={
                        <Button component={RouterLink} to="/user?tab=active" variant="text">
                            Go to bookings
                        </Button>
                    }
                />
            </>
        );
    }

    const status = getDisplayStatus(booking);
    const subtotal = (booking.rate || 0) * (booking.hours || 0);
    const canCancel = ['scheduled', 'accepted', 'awaiting_start_approval'].includes(status);

    const priceCard = (
        <Panel title="Price breakdown" actions={<PaymentPill payment={payment} />}>
            <DataList sx={{ '& > div': { py: 0.75 } }}>
                <DataRow label="Hourly rate" value={<Money amount={booking.rate} />} />
                <DataRow label="Hours" value={booking.hours || 0} />
                <DataRow label="Subtotal" value={<Money amount={subtotal} />} />
            </DataList>
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'baseline',
                    mt: 1.5,
                    pt: 2,
                    borderTop: '1px solid',
                    borderColor: 'divider',
                }}
            >
                <Box component="span" sx={{ fontWeight: 700 }}>
                    Total
                </Box>
                <Money amount={payment?.amount ?? subtotal} size="xl" />
            </Box>
            {!!payment?.refundId && !!payment.refundAmount && (
                <Box sx={{ mt: 1, color: 'text.secondary', fontSize: 13 }}>
                    Refunded <Money amount={payment.refundAmount} />
                </Box>
            )}
        </Panel>
    );

    const actions = (
        <>
            <BookingChatAction bookingId={booking._id} area="user" />
            {status === 'awaiting_start_approval' && (
                <Button
                    variant="contained"
                    fullWidth
                    size="large"
                    onClick={() => setApproveOpen(true)}
                >
                    Approve job start
                </Button>
            )}
            {canCancel && (
                <Button
                    variant="outlined"
                    color="error"
                    fullWidth
                    onClick={() => setCancelOpen(true)}
                >
                    Cancel booking
                </Button>
            )}
        </>
    );

    return (
        <>
            <PageHeader
                title="Booking details"
                subtitle={`Reference ${booking._id.slice(-6).toUpperCase()}`}
                backTo="/user"
                backLabel="Back to bookings"
            />
            <BookingDetailView
                booking={booking}
                counterpart={{
                    title: 'Provider',
                    person: booking.providerId,
                    emptyText: 'No provider has accepted yet',
                }}
                priceCard={priceCard}
                actions={actions}
                receiptPath={`/user/booking/${booking._id}/receipt`}
            />

            <ConfirmDialog
                open={approveOpen}
                title="Approve job start?"
                description="The provider has arrived and is ready to begin. Approving marks the job as in progress."
                confirmLabel="Approve job start"
                loading={isApproving}
                onConfirm={handleApproveStart}
                onClose={() => setApproveOpen(false)}
            />
            <ConfirmDialog
                open={cancelOpen}
                title="Cancel this booking?"
                description="This cannot be undone. If you have already paid, a refund will be issued."
                confirmLabel="Cancel booking"
                cancelLabel="Keep booking"
                confirmColor="error"
                loading={isCancelling}
                onConfirm={handleCancel}
                onClose={() => setCancelOpen(false)}
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
