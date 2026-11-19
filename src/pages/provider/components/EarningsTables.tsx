import { Link as RouterLink } from 'react-router-dom';
import {
    Box,
    IconButton,
    Link,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    useMediaQuery,
    useTheme,
} from '@mui/material';
import { ReceiptLong } from '@mui/icons-material';
import dayjs from 'dayjs';
import type { Earning, Payout } from '@/types';
import { formatMoney } from '@/utils/format';
import { color, font, hairline } from '@/theme/tokens';
import { StatusPill, type Tone } from '@/components/ui';
import { orderCode } from '../orderUtils';

const EARNING_STATUS: Record<Earning['status'], { label: string; tone: Tone }> = {
    pending: { label: 'Pending', tone: 'amber' },
    completed: { label: 'Completed', tone: 'green' },
    cancelled: { label: 'Cancelled', tone: 'red' },
};

const PAYOUT_STATUS: Record<Payout['status'], { label: string; tone: Tone }> = {
    pending: { label: 'Pending', tone: 'amber' },
    in_transit: { label: 'In transit', tone: 'blue' },
    paid: { label: 'Paid', tone: 'green' },
    failed: { label: 'Failed', tone: 'red' },
    cancelled: { label: 'Cancelled', tone: 'grey' },
};

/** Recent payouts. Three narrow columns, so one table works at every width. */
export function PayoutTable({ payouts }: { payouts: Payout[] }) {
    return (
        <TableContainer sx={{ overflowX: 'auto' }}>
            <Table size="small" aria-label="Payout history">
                <TableHead>
                    <TableRow>
                        <TableCell>Date</TableCell>
                        <TableCell align="right">Amount</TableCell>
                        <TableCell align="right">Status</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {payouts.map((payout) => {
                        const status = PAYOUT_STATUS[payout.status] ?? PAYOUT_STATUS.pending;
                        return (
                            <TableRow key={payout._id}>
                                <TableCell sx={{ whiteSpace: 'nowrap' }}>
                                    {dayjs(payout.createdAt).format('D MMM YYYY')}
                                </TableCell>
                                <TableCell align="right" sx={{ fontWeight: 700 }}>
                                    {formatMoney(payout.amount)}
                                </TableCell>
                                <TableCell align="right">
                                    <StatusPill tone={status.tone}>{status.label}</StatusPill>
                                </TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </TableContainer>
    );
}

function ReceiptButton({ earning }: { earning: Earning }) {
    return (
        <IconButton
            size="small"
            component={RouterLink}
            to={`/provider/orders/${earning.bookingId}/receipt`}
            aria-label={`View receipt for ${orderCode(earning.bookingId)}`}
        >
            <ReceiptLong fontSize="small" />
        </IconButton>
    );
}

/** Earnings per job with a receipt link. A table from md up, stacked rows on phones. */
export function EarningsHistoryList({ earnings }: { earnings: Earning[] }) {
    const theme = useTheme();
    const wide = useMediaQuery(theme.breakpoints.up('md'));

    if (wide) {
        return (
            <TableContainer>
                <Table aria-label="Earnings history">
                    <TableHead>
                        <TableRow>
                            <TableCell>Date</TableCell>
                            <TableCell>Job</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell align="right">Amount</TableCell>
                            <TableCell align="right">Receipt</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {earnings.map((earning) => {
                            const status = EARNING_STATUS[earning.status] ?? EARNING_STATUS.pending;
                            return (
                                <TableRow key={earning._id} hover>
                                    <TableCell sx={{ whiteSpace: 'nowrap' }}>
                                        {dayjs(earning.date).format('ddd D MMM YYYY')}
                                    </TableCell>
                                    <TableCell>
                                        <Link
                                            component={RouterLink}
                                            to={`/provider/my-orders/${earning.bookingId}`}
                                            underline="hover"
                                            color="inherit"
                                            sx={{ fontWeight: 600 }}
                                        >
                                            {orderCode(earning.bookingId)}
                                        </Link>
                                    </TableCell>
                                    <TableCell>
                                        <StatusPill tone={status.tone}>{status.label}</StatusPill>
                                    </TableCell>
                                    <TableCell align="right" sx={{ fontWeight: 700 }}>
                                        {formatMoney(earning.amount)}
                                    </TableCell>
                                    <TableCell align="right">
                                        <ReceiptButton earning={earning} />
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </TableContainer>
        );
    }

    return (
        <Box component="ul" aria-label="Earnings history" sx={{ listStyle: 'none', m: 0, p: 0 }}>
            {earnings.map((earning, i) => {
                const status = EARNING_STATUS[earning.status] ?? EARNING_STATUS.pending;
                return (
                    <Box
                        component="li"
                        key={earning._id}
                        sx={{
                            display: 'grid',
                            gridTemplateColumns: 'minmax(0, 1fr) auto auto',
                            columnGap: 1,
                            alignItems: 'center',
                            px: 2,
                            py: 1.5,
                            borderTop: i === 0 ? 0 : hairline,
                        }}
                    >
                        <Box sx={{ minWidth: 0 }}>
                            <Link
                                component={RouterLink}
                                to={`/provider/my-orders/${earning.bookingId}`}
                                underline="hover"
                                color="inherit"
                                sx={{ fontWeight: 700, fontSize: font.size.md }}
                            >
                                {orderCode(earning.bookingId)}
                            </Link>
                            <Box
                                sx={{
                                    fontSize: font.size.xs,
                                    color: color.ink500,
                                    fontWeight: 600,
                                }}
                            >
                                {dayjs(earning.date).format('ddd D MMM YYYY')}
                            </Box>
                        </Box>
                        <Box sx={{ textAlign: 'right' }}>
                            <Box sx={{ fontWeight: 800, mb: 0.5 }}>
                                {formatMoney(earning.amount)}
                            </Box>
                            <StatusPill tone={status.tone}>{status.label}</StatusPill>
                        </Box>
                        <ReceiptButton earning={earning} />
                    </Box>
                );
            })}
        </Box>
    );
}
