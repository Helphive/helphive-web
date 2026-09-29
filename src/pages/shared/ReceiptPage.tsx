import {
    Alert,
    Box,
    Button,
    Chip,
    Divider,
    Paper,
    Skeleton,
    Stack,
    Typography,
} from '@mui/material';
import { ContentCopy, Print } from '@mui/icons-material';
import { useParams } from 'react-router-dom';
import { useGetBookingReceiptQuery } from '@/features/booking/bookingApi';
import PageHeader from '@/components/common/PageHeader';
import { ErrorState } from '@/components/common/PageStates';
import { PriceRow } from '@/components/common/InfoRow';
import { useSnackbar } from '@/components/feedback/snackbarContext';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { formatDateTime, formatMoney, getErrorMessage, pluralHours } from '@/utils/format';

interface ReceiptPageProps {
    area: 'user' | 'provider';
}

const STATUS_LABEL: Record<string, string> = {
    pending: 'Pending',
    'in progress': 'In progress',
    completed: 'Completed',
    cancelled: 'Cancelled',
};

function Field({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <Box sx={{ minWidth: 0 }}>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                {label}
            </Typography>
            <Typography sx={{ wordBreak: 'break-word' }}>{children}</Typography>
        </Box>
    );
}

export default function ReceiptPage({ area }: ReceiptPageProps) {
    const { bookingId } = useParams<{ bookingId: string }>();
    const snackbar = useSnackbar();
    const { data, isLoading, error, refetch } = useGetBookingReceiptQuery(bookingId ?? '', {
        skip: !bookingId,
    });
    const receipt = data?.receipt;
    useDocumentTitle(receipt ? `Receipt ${receipt.receiptNumber}` : 'Receipt');

    const backTo =
        area === 'user' ? `/user/booking/${bookingId}` : `/provider/my-orders/${bookingId}`;

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(window.location.href);
            snackbar.success('Link copied');
        } catch {
            snackbar.error('Could not copy the link');
        }
    };

    if (isLoading) {
        return (
            <Paper variant="outlined" sx={{ p: 4, maxWidth: 720, mx: 'auto' }}>
                <Skeleton width="40%" height={36} />
                <Skeleton width="25%" sx={{ mb: 3 }} />
                <Skeleton variant="rounded" height={220} />
            </Paper>
        );
    }

    if (error || !receipt) {
        return (
            <ErrorState
                title="Receipt"
                message={getErrorMessage(error, 'Could not load this receipt')}
                backTo={backTo}
                backLabel="Back to details"
                onRetry={refetch}
            />
        );
    }

    const currency = receipt.currency;
    const payment = receipt.payment;

    return (
        <>
            <PageHeader
                title="Receipt"
                backTo={backTo}
                backLabel="Back to details"
                actions={
                    <>
                        <Button variant="outlined" startIcon={<ContentCopy />} onClick={handleCopy}>
                            Copy link
                        </Button>
                        <Button
                            variant="contained"
                            startIcon={<Print />}
                            onClick={() => window.print()}
                        >
                            Print / Save PDF
                        </Button>
                    </>
                }
            />

            <Paper
                variant="outlined"
                className="print-sheet"
                sx={{ p: { xs: 2.5, sm: 4 }, maxWidth: 720, mx: 'auto' }}
            >
                <Stack
                    direction="row"
                    sx={{ justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}
                >
                    <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                        <Box component="img" src="/logo.png" alt="" sx={{ height: 36 }} />
                        <Typography variant="h5" fontWeight={800}>
                            HelpHive
                        </Typography>
                    </Stack>
                    <Box sx={{ textAlign: 'right' }}>
                        <Typography variant="subtitle1" fontWeight={700}>
                            {receipt.receiptNumber}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            Issued {formatDateTime(receipt.issuedAt)}
                        </Typography>
                    </Box>
                </Stack>

                <Divider sx={{ mb: 3 }} />

                <Box
                    sx={{
                        display: 'grid',
                        gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                        gap: 2.5,
                        mb: 3,
                    }}
                >
                    <Field label="Service">{receipt.service?.name}</Field>
                    <Field label="Status">
                        <Chip
                            size="small"
                            label={STATUS_LABEL[receipt.status] ?? receipt.status}
                            variant="outlined"
                        />
                    </Field>
                    <Field label="Date and time">{formatDateTime(receipt.startDate)}</Field>
                    <Field label="Duration">{pluralHours(receipt.hours)}</Field>
                    <Field label="Customer">
                        {receipt.customer?.name}
                        <Typography
                            component="span"
                            variant="body2"
                            color="text.secondary"
                            sx={{ display: 'block' }}
                        >
                            {receipt.customer?.email}
                        </Typography>
                    </Field>
                    <Field label="Provider">{receipt.provider?.name ?? 'Not assigned'}</Field>
                    <Box sx={{ gridColumn: { sm: '1 / -1' } }}>
                        <Field label="Address">{receipt.address}</Field>
                    </Box>
                    {receipt.completedAt && (
                        <Field label="Completed">{formatDateTime(receipt.completedAt)}</Field>
                    )}
                    {receipt.cancelledAt && (
                        <Field label="Cancelled">
                            {formatDateTime(receipt.cancelledAt)}
                            {receipt.cancellationReason ? ` - ${receipt.cancellationReason}` : ''}
                        </Field>
                    )}
                </Box>

                <Divider sx={{ mb: 2 }} />

                <PriceRow label="Hourly rate" value={formatMoney(receipt.rate, currency)} />
                <PriceRow label="Hours" value={String(receipt.hours)} />
                <PriceRow label="Subtotal" value={formatMoney(receipt.subtotal, currency)} />
                <Divider sx={{ my: 1 }} />
                <PriceRow label="Total" value={formatMoney(receipt.total, currency)} strong />

                <Box sx={{ mt: 3 }}>
                    <Typography variant="overline" color="text.secondary" fontWeight={700}>
                        Payment
                    </Typography>
                    {payment ? (
                        <Stack spacing={0.5} sx={{ mt: 0.5 }}>
                            <PriceRow
                                label={`Payment ${payment.status}`}
                                value={formatMoney(payment.amount, currency)}
                            />
                            {payment.paidAt && (
                                <Typography variant="body2" color="text.secondary">
                                    Paid {formatDateTime(payment.paidAt)}
                                </Typography>
                            )}
                            {payment.refundStatus && (
                                <Typography variant="body2" color="text.secondary">
                                    Refund {payment.refundStatus}:{' '}
                                    {formatMoney(payment.refundAmount, currency)}
                                    {payment.refundedAt
                                        ? ` on ${formatDateTime(payment.refundedAt)}`
                                        : ''}
                                </Typography>
                            )}
                        </Stack>
                    ) : (
                        <Alert severity="info" sx={{ mt: 1 }}>
                            No payment recorded for this booking.
                        </Alert>
                    )}
                </Box>

                {receipt.earning && (
                    <Box sx={{ mt: 3 }}>
                        <Typography variant="overline" color="text.secondary" fontWeight={700}>
                            Your earning
                        </Typography>
                        <PriceRow
                            label={`Earning (${receipt.earning.status})`}
                            value={formatMoney(receipt.earning.amount, currency)}
                            color="success.main"
                        />
                    </Box>
                )}
            </Paper>
        </>
    );
}
