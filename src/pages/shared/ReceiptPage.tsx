import { Box, Button, Skeleton, Stack, Typography } from '@mui/material';
import { ContentCopy, Print } from '@mui/icons-material';
import { useParams } from 'react-router-dom';
import { useGetBookingReceiptQuery } from '@/features/booking/bookingApi';
import { ErrorState } from '@/components/common/PageStates';
import { useSnackbar } from '@/components/feedback/snackbarContext';
import { DataList, DataRow, Logo, PageHeader, StatusPill, type Tone } from '@/components/ui';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { formatDateTime, formatMoney, getErrorMessage, pluralHours } from '@/utils/format';
import { color, font, hairline, layout, radius } from '@/theme/tokens';

interface ReceiptPageProps {
    area: 'user' | 'provider';
}

const STATUS: Record<string, { label: string; tone: Tone }> = {
    pending: { label: 'Pending', tone: 'grey' },
    'in progress': { label: 'In progress', tone: 'blue' },
    completed: { label: 'Completed', tone: 'green' },
    cancelled: { label: 'Cancelled', tone: 'red' },
};

const sheetSx = {
    maxWidth: layout.narrowMaxWidth,
    mx: 'auto',
    bgcolor: color.surface,
    border: hairline,
    borderRadius: `${radius.lg}px`,
    overflow: 'hidden',
} as const;

const sectionSx = { px: { xs: 2, sm: 2.5 }, py: { xs: 2.5, sm: 3 } } as const;

function SectionTitle({ children }: { children: string }) {
    return (
        <Typography variant="subtitle2" component="h2" sx={{ mb: 1 }}>
            {children}
        </Typography>
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
            <Box
                role="status"
                aria-busy="true"
                aria-label="Loading receipt"
                sx={{ maxWidth: layout.narrowMaxWidth, mx: 'auto' }}
            >
                <Skeleton width={160} height={40} sx={{ mb: 3 }} />
                <Box sx={{ ...sheetSx, ...sectionSx }}>
                    <Skeleton width="40%" height={32} />
                    <Skeleton width="25%" sx={{ mb: 3 }} />
                    <Skeleton variant="rounded" height={120} sx={{ mb: 2 }} />
                    <Skeleton variant="rounded" height={160} />
                </Box>
            </Box>
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
    const status = STATUS[receipt.status] ?? { label: receipt.status, tone: 'grey' as Tone };

    return (
        <Box className="print-container" sx={{ maxWidth: layout.narrowMaxWidth, mx: 'auto' }}>
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
                            Print or save PDF
                        </Button>
                    </>
                }
            />

            <Box component="article" className="print-sheet" sx={sheetSx} aria-label="Receipt">
                <Stack
                    direction="row"
                    sx={{
                        ...sectionSx,
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        gap: 2,
                        borderBottom: hairline,
                    }}
                >
                    <Logo />
                    <Box sx={{ textAlign: 'right' }}>
                        <Typography variant="subtitle2" sx={{ fontVariantNumeric: 'tabular-nums' }}>
                            {receipt.receiptNumber}
                        </Typography>
                        <Typography variant="caption">
                            Issued {formatDateTime(receipt.issuedAt)}
                        </Typography>
                    </Box>
                </Stack>

                <Box sx={{ borderBottom: hairline }}>
                    <DataList variant="grid" columns={{ xs: 2, sm: 4 }}>
                        <DataRow label="Service" value={receipt.service?.name} />
                        <DataRow
                            label="Status"
                            value={<StatusPill tone={status.tone}>{status.label}</StatusPill>}
                        />
                        <DataRow label="Start" value={formatDateTime(receipt.startDate)} />
                        <DataRow label="Duration" value={pluralHours(receipt.hours)} />
                    </DataList>
                </Box>

                <Box sx={{ ...sectionSx, borderBottom: hairline }}>
                    <DataList variant="stacked" columns={{ xs: 1, sm: 2 }}>
                        <DataRow label="Customer">
                            {receipt.customer?.name}
                            <Box
                                component="span"
                                sx={{ display: 'block', fontWeight: 500, color: color.ink600 }}
                            >
                                {receipt.customer?.email}
                            </Box>
                        </DataRow>
                        <DataRow
                            label="Provider"
                            value={receipt.provider?.name ?? 'Not assigned'}
                        />
                        <DataRow label="Address" value={receipt.address} wide />
                        {receipt.completedAt && (
                            <DataRow
                                label="Completed"
                                value={formatDateTime(receipt.completedAt)}
                            />
                        )}
                        {receipt.cancelledAt && (
                            <DataRow label="Cancelled">
                                {formatDateTime(receipt.cancelledAt)}
                                {receipt.cancellationReason
                                    ? `, ${receipt.cancellationReason}`
                                    : ''}
                            </DataRow>
                        )}
                    </DataList>
                </Box>

                <Box sx={{ ...sectionSx, borderBottom: hairline }}>
                    <SectionTitle>Charges</SectionTitle>
                    <DataList>
                        <DataRow label="Hourly rate" value={formatMoney(receipt.rate, currency)} />
                        <DataRow label="Hours" value={receipt.hours} />
                        <DataRow label="Subtotal" value={formatMoney(receipt.subtotal, currency)} />
                    </DataList>
                </Box>
                <Stack
                    direction="row"
                    sx={{
                        ...sectionSx,
                        py: 2,
                        justifyContent: 'space-between',
                        alignItems: 'baseline',
                        bgcolor: color.subtle,
                        borderBottom: hairline,
                    }}
                >
                    <Typography variant="subtitle2" component="span">
                        Total
                    </Typography>
                    <Box
                        sx={{
                            fontSize: font.size['3xl'],
                            fontWeight: 800,
                            letterSpacing: font.tracking.head,
                            fontVariantNumeric: 'tabular-nums',
                        }}
                    >
                        {formatMoney(receipt.total, currency)}
                    </Box>
                </Stack>

                <Box sx={sectionSx}>
                    <SectionTitle>Payment</SectionTitle>
                    {payment ? (
                        <DataList>
                            <DataRow
                                label={`Payment ${payment.status}`}
                                value={formatMoney(payment.amount, currency)}
                            />
                            {payment.paidAt && (
                                <DataRow label="Paid" value={formatDateTime(payment.paidAt)} />
                            )}
                            {payment.refundStatus && (
                                <DataRow
                                    label={`Refund ${payment.refundStatus}`}
                                    value={`${formatMoney(payment.refundAmount, currency)}${
                                        payment.refundedAt
                                            ? `, ${formatDateTime(payment.refundedAt)}`
                                            : ''
                                    }`}
                                />
                            )}
                        </DataList>
                    ) : (
                        <Typography variant="body2" color="text.secondary">
                            No payment recorded for this booking.
                        </Typography>
                    )}

                    {receipt.earning && (
                        <Box sx={{ mt: 3 }}>
                            <SectionTitle>Your earning</SectionTitle>
                            <DataList>
                                <DataRow
                                    label={`Earning, ${receipt.earning.status}`}
                                    value={
                                        <Box component="span" sx={{ color: color.green700 }}>
                                            {formatMoney(receipt.earning.amount, currency)}
                                        </Box>
                                    }
                                />
                            </DataList>
                        </Box>
                    )}
                </Box>
            </Box>
        </Box>
    );
}
