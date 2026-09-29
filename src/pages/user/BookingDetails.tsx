import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Button, Card, CardContent, Chip, Divider, TextField, Typography } from '@mui/material';
import {
    useGetBookingByIdMutation,
    useCancelBookingMutation,
    useApproveStartJobRequestMutation,
} from '@/features/booking/bookingApi';
import BookingDetailView from '@/components/common/BookingDetailView';
import { PriceRow } from '@/components/common/InfoRow';
import PageHeader from '@/components/common/PageHeader';
import { DetailSkeleton, ErrorState } from '@/components/common/PageStates';
import ConfirmDialog from '@/components/feedback/ConfirmDialog';
import { useSnackbar } from '@/components/feedback/snackbarContext';
import { useBookingLoader, type BookingPayment } from '@/hooks/useBookingLoader';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { formatMoney, getDisplayStatus, getErrorMessage } from '@/utils/format';

function paymentChip(payment: BookingPayment | null) {
    if (!payment) return null;
    if (payment.refundStatus) {
        return <Chip label="Refunded" size="small" color="info" />;
    }
    return payment.status === 'completed' ? (
        <Chip label="Paid" size="small" color="success" />
    ) : (
        <Chip label="Payment pending" size="small" color="warning" />
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
    const { booking, payment, error, loading, reload } = useBookingLoader(bookingId, getBooking);

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
            snackbar.error(getErrorMessage(err, 'Failed to cancel booking'));
        }
    };

    const handleApproveStart = async () => {
        try {
            await approveStartJob({ bookingId: bookingId! }).unwrap();
            setApproveOpen(false);
            snackbar.success('Job start approved');
            void reload();
        } catch (err) {
            snackbar.error(getErrorMessage(err, 'Failed to approve job start'));
        }
    };

    if (loading) return <DetailSkeleton />;

    if (error || !booking) {
        return (
            <ErrorState
                title="Booking details"
                message={error || 'Booking not found'}
                backTo="/user"
                backLabel="Back to bookings"
                onRetry={reload}
            />
        );
    }

    const status = getDisplayStatus(booking);
    const subtotal = (booking.rate || 0) * (booking.hours || 0);
    const canCancel = ['scheduled', 'accepted', 'awaiting_start_approval'].includes(status);

    const priceCard = (
        <Card>
            <CardContent>
                <Typography variant="h6" fontWeight={700} sx={{ mb: 1.5 }}>
                    Price breakdown
                </Typography>
                <PriceRow label="Hourly rate" value={formatMoney(booking.rate)} />
                <PriceRow label="Hours" value={String(booking.hours || 0)} />
                <PriceRow label="Subtotal" value={formatMoney(subtotal)} />
                <Divider sx={{ my: 1 }} />
                <PriceRow label="Total" value={formatMoney(payment?.amount ?? subtotal)} strong />
                {paymentChip(payment)}
            </CardContent>
        </Card>
    );

    const actions = (
        <>
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
            <PageHeader title="Booking details" backTo="/user" backLabel="Back to bookings" />
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
                confirmLabel="Approve"
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
