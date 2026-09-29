import { useMemo, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
    Box,
    Typography,
    Card,
    CardContent,
    Button,
    CircularProgress,
    Alert,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Chip,
    IconButton,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import { AccountBalanceWallet, OpenInNew, Download, ReceiptLong } from '@mui/icons-material';
import { Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import dayjs from 'dayjs';
import {
    useGetEarningsQuery,
    useCreatePayoutMutation,
    useLazyGetStripeConnectOnboardingQuery,
    useLazyGetStripeExpressLoginLinkQuery,
} from '@/features/provider/providerApi';

import PageHeader from '@/components/common/PageHeader';
import { useSnackbar } from '@/components/feedback/snackbarContext';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { formatMoney, getErrorMessage } from '@/utils/format';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function Earnings() {
    useDocumentTitle('Earnings');
    const snackbar = useSnackbar();
    const [payoutDialogOpen, setPayoutDialogOpen] = useState(false);
    const [payoutAmount, setPayoutAmount] = useState('');
    const [error, setError] = useState<string | null>(null);

    const { data: earningsData, isLoading, refetch } = useGetEarningsQuery();
    const [createPayout, { isLoading: isCreatingPayout }] = useCreatePayoutMutation();
    const [getOnboardingLink] = useLazyGetStripeConnectOnboardingQuery();
    const [getLoginLink] = useLazyGetStripeExpressLoginLinkQuery();

    const handleWithdrawMethods = async () => {
        try {
            const result = await getOnboardingLink().unwrap();
            window.open(result.url, '_blank');
        } catch {
            setError('Failed to get Stripe onboarding link');
        }
    };

    const handleViewDashboard = async () => {
        try {
            const result = await getLoginLink().unwrap();
            window.open(result.url, '_blank');
        } catch {
            setError('Failed to get Stripe dashboard link');
        }
    };

    const handlePayout = async () => {
        const amount = parseFloat(payoutAmount);
        if (isNaN(amount) || amount <= 0) {
            setError('Please enter a valid amount');
            return;
        }

        if (earningsData && amount > earningsData.availableBalance) {
            setError('Insufficient balance');
            return;
        }

        try {
            setError(null);
            await createPayout({ amount }).unwrap();
            setPayoutDialogOpen(false);
            setPayoutAmount('');
            snackbar.success('Payout requested');
            refetch();
        } catch (err) {
            const message = getErrorMessage(err, 'Failed to create payout');
            setError(message);
            snackbar.error(message);
        }
    };

    // Totals and the monthly chart are derived from the earning rows the API returns.
    const summary = useMemo(() => {
        const rows = earningsData?.earnings ?? [];
        const totalEarnings =
            earningsData?.totalEarnings ??
            rows.filter((e) => e.status === 'completed').reduce((sum, e) => sum + e.amount, 0);
        const pendingBalance =
            earningsData?.pendingBalance ??
            rows.filter((e) => e.status === 'pending').reduce((sum, e) => sum + e.amount, 0);
        let monthlyEarnings = earningsData?.monthlyEarnings;
        if (!monthlyEarnings) {
            const months = Array.from({ length: 6 }, (_, i) => dayjs().subtract(5 - i, 'month'));
            monthlyEarnings = months.map((m) => ({
                month: m.format('MMM'),
                amount: rows
                    .filter((e) => e.status !== 'cancelled' && dayjs(e.date).isSame(m, 'month'))
                    .reduce((sum, e) => sum + e.amount, 0),
            }));
        }
        return { totalEarnings, pendingBalance, monthlyEarnings };
    }, [earningsData]);

    const chartData = {
        labels: summary.monthlyEarnings.map((e) => e.month),
        datasets: [
            {
                label: 'Earnings ($)',
                data: summary.monthlyEarnings.map((e) => e.amount),
                backgroundColor: '#FF5740',
                borderRadius: 8,
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        plugins: {
            legend: {
                display: false,
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    callback: (value: number | string) => `$${value}`,
                },
            },
        },
    };

    if (isLoading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box>
            <PageHeader title="Earnings" subtitle="Track your income and withdraw funds" />

            {error && (
                <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
                    {error}
                </Alert>
            )}

            <Grid container spacing={3} sx={{ mb: 4, maxWidth: 1000 }}>
                {/* Total Earnings */}
                <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
                    <Card>
                        <CardContent>
                            <Typography color="text.secondary" gutterBottom>
                                Total Earnings
                            </Typography>
                            <Typography variant="h4" fontWeight={700}>
                                {formatMoney(summary.totalEarnings)}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Available Balance */}
                <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
                    <Card sx={{ bgcolor: 'primary.main', color: 'white' }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                <AccountBalanceWallet />
                                <Typography>Available Balance</Typography>
                            </Box>
                            <Typography variant="h4" fontWeight={700}>
                                {formatMoney(earningsData?.availableBalance)}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Pending Balance */}
                <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
                    <Card>
                        <CardContent>
                            <Typography color="text.secondary" gutterBottom>
                                Pending Balance
                            </Typography>
                            <Typography variant="h4" fontWeight={700}>
                                {formatMoney(summary.pendingBalance)}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Action Buttons */}
            <Box sx={{ display: 'flex', gap: 2, mb: 4, flexWrap: 'wrap' }}>
                <Button
                    variant="outlined"
                    startIcon={<OpenInNew />}
                    onClick={handleWithdrawMethods}
                >
                    Withdraw Methods
                </Button>
                <Button
                    variant="contained"
                    startIcon={<Download />}
                    onClick={() => setPayoutDialogOpen(true)}
                    disabled={!earningsData?.availableBalance || earningsData.availableBalance <= 0}
                >
                    Withdraw
                </Button>
                <Button variant="outlined" onClick={handleViewDashboard}>
                    View Stripe Dashboard
                </Button>
            </Box>

            <Grid container spacing={3} sx={{ maxWidth: 1200 }}>
                {/* Monthly Chart */}
                <Grid size={{ xs: 12, lg: 8 }}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" fontWeight={600} sx={{ mb: 3 }}>
                                Monthly Earnings
                            </Typography>
                            <Box sx={{ height: 300 }}>
                                <Bar data={chartData} options={chartOptions} />
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Payout History */}
                <Grid size={{ xs: 12, lg: 4 }}>
                    <Card sx={{ height: '100%' }}>
                        <CardContent>
                            <Typography variant="h6" fontWeight={600} sx={{ mb: 3 }}>
                                Payout History
                            </Typography>
                            {earningsData?.payouts && earningsData.payouts.length > 0 ? (
                                <TableContainer>
                                    <Table size="small">
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>Date</TableCell>
                                                <TableCell align="right">Amount</TableCell>
                                                <TableCell align="right">Status</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {earningsData.payouts.map((payout) => (
                                                <TableRow key={payout._id}>
                                                    <TableCell>
                                                        {dayjs(payout.createdAt).format('MMM D')}
                                                    </TableCell>
                                                    <TableCell align="right">
                                                        {formatMoney(payout.amount)}
                                                    </TableCell>
                                                    <TableCell align="right">
                                                        <Chip
                                                            label={payout.status}
                                                            size="small"
                                                            color={
                                                                payout.status === 'paid'
                                                                    ? 'success'
                                                                    : payout.status === 'failed'
                                                                      ? 'error'
                                                                      : 'default'
                                                            }
                                                        />
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            ) : (
                                <Typography color="text.secondary" textAlign="center">
                                    No payouts yet
                                </Typography>
                            )}
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Earnings by job, each linking to its receipt */}
            <Card sx={{ mt: 3, maxWidth: 1200 }}>
                <CardContent>
                    <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
                        Recent earnings
                    </Typography>
                    {earningsData?.earnings && earningsData.earnings.length > 0 ? (
                        <TableContainer>
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Date</TableCell>
                                        <TableCell>Job</TableCell>
                                        <TableCell align="right">Amount</TableCell>
                                        <TableCell align="right">Status</TableCell>
                                        <TableCell align="right">Receipt</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {earningsData.earnings.slice(0, 20).map((earning) => (
                                        <TableRow key={earning._id} hover>
                                            <TableCell>
                                                {dayjs(earning.date).format('MMM D, YYYY')}
                                            </TableCell>
                                            <TableCell>
                                                <Typography
                                                    component={RouterLink}
                                                    to={`/provider/my-orders/${earning.bookingId}`}
                                                    variant="body2"
                                                    color="primary"
                                                    sx={{ textDecoration: 'none' }}
                                                >
                                                    HH-{earning.bookingId.slice(-8).toUpperCase()}
                                                </Typography>
                                            </TableCell>
                                            <TableCell align="right">
                                                {formatMoney(earning.amount)}
                                            </TableCell>
                                            <TableCell align="right">
                                                <Chip
                                                    label={earning.status}
                                                    size="small"
                                                    color={
                                                        earning.status === 'completed'
                                                            ? 'success'
                                                            : earning.status === 'cancelled'
                                                              ? 'error'
                                                              : 'default'
                                                    }
                                                />
                                            </TableCell>
                                            <TableCell align="right">
                                                <IconButton
                                                    size="small"
                                                    component={RouterLink}
                                                    to={`/provider/orders/${earning.bookingId}/receipt`}
                                                    aria-label="View receipt"
                                                >
                                                    <ReceiptLong fontSize="small" />
                                                </IconButton>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    ) : (
                        <Typography color="text.secondary" textAlign="center">
                            Earnings from completed jobs will appear here
                        </Typography>
                    )}
                </CardContent>
            </Card>

            {/* Payout Dialog */}
            <Dialog open={payoutDialogOpen} onClose={() => setPayoutDialogOpen(false)}>
                <DialogTitle>Withdraw Funds</DialogTitle>
                <DialogContent>
                    <Typography sx={{ mb: 3 }}>
                        Available balance: {formatMoney(earningsData?.availableBalance)}
                    </Typography>
                    <TextField
                        fullWidth
                        label="Amount"
                        type="number"
                        value={payoutAmount}
                        onChange={(e) => setPayoutAmount(e.target.value)}
                        InputProps={{
                            startAdornment: <Typography sx={{ mr: 1 }}>$</Typography>,
                        }}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setPayoutDialogOpen(false)}>Cancel</Button>
                    <Button variant="contained" onClick={handlePayout} disabled={isCreatingPayout}>
                        {isCreatingPayout ? <CircularProgress size={24} /> : 'Withdraw'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
