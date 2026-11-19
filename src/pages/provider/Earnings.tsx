import { useMemo, useState } from 'react';
import { Box, Button, CircularProgress, Skeleton } from '@mui/material';
import { AccountBalanceWallet, OpenInNew, ReceiptLong } from '@mui/icons-material';
import {
    useGetEarningsQuery,
    useCreatePayoutMutation,
    useLazyGetStripeConnectOnboardingQuery,
    useLazyGetStripeExpressLoginLinkQuery,
} from '@/features/provider/providerApi';
import { EmptyState, ErrorState, ListSkeleton, PageHeader, Panel } from '@/components/ui';
import { useSnackbar } from '@/components/feedback/snackbarContext';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { formatMoney, getErrorMessage } from '@/utils/format';
import { color, font, hairline } from '@/theme/tokens';
import EarningsStats from './components/EarningsStats';
import { EarningsHistoryList, PayoutTable } from './components/EarningsTables';
import MonthlyChart from './components/MonthlyChart';
import PayoutDialog from './components/PayoutDialog';
import { monthlyStats, summarizeEarnings } from './orderUtils';

const HISTORY_LIMIT = 20;

interface StripeRowProps {
    title: string;
    description: string;
    label: string;
    busy: boolean;
    onClick: () => void;
    divider?: boolean;
}

function StripeRow({ title, description, label, busy, onClick, divider }: StripeRowProps) {
    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                alignItems: { xs: 'flex-start', sm: 'center' },
                justifyContent: 'space-between',
                gap: 1.5,
                px: { xs: 2, sm: 2.5 },
                py: 2,
                borderTop: divider ? hairline : 0,
            }}
        >
            <Box sx={{ minWidth: 0, maxWidth: '60ch' }}>
                <Box sx={{ fontWeight: 700, fontSize: font.size.md }}>{title}</Box>
                <Box sx={{ fontSize: font.size.sm, color: color.ink600, mt: 0.25 }}>
                    {description}
                </Box>
            </Box>
            <Button
                variant="outlined"
                onClick={onClick}
                disabled={busy}
                startIcon={busy ? <CircularProgress size={16} /> : undefined}
                endIcon={busy ? undefined : <OpenInNew />}
                sx={{ flexShrink: 0 }}
            >
                {label}
            </Button>
        </Box>
    );
}

export default function Earnings() {
    useDocumentTitle('Earnings');
    const snackbar = useSnackbar();
    const [payoutOpen, setPayoutOpen] = useState(false);
    const [payoutError, setPayoutError] = useState<string | null>(null);

    const { data: earningsData, error, isLoading, refetch } = useGetEarningsQuery();
    const [createPayout, { isLoading: isCreatingPayout }] = useCreatePayoutMutation();
    const [getOnboardingLink, { isFetching: loadingOnboarding }] =
        useLazyGetStripeConnectOnboardingQuery();
    const [getLoginLink, { isFetching: loadingLogin }] = useLazyGetStripeExpressLoginLinkQuery();

    const handleWithdrawMethods = async () => {
        try {
            const result = await getOnboardingLink().unwrap();
            window.open(result.url, '_blank');
        } catch {
            snackbar.error('Could not open Stripe payout setup. Try again in a moment.');
        }
    };

    const handleViewDashboard = async () => {
        try {
            const result = await getLoginLink().unwrap();
            window.open(result.url, '_blank');
        } catch {
            snackbar.error('Could not open the Stripe dashboard. Try again in a moment.');
        }
    };

    const handlePayout = async (amount: number) => {
        try {
            setPayoutError(null);
            await createPayout({ amount }).unwrap();
            setPayoutOpen(false);
            snackbar.success('Payout requested');
            void refetch();
        } catch (err) {
            const message = getErrorMessage(err, 'Could not request the payout');
            setPayoutError(message);
            snackbar.error(message);
        }
    };

    const summary = useMemo(() => summarizeEarnings(earningsData), [earningsData]);
    const stats = useMemo(() => monthlyStats(summary.monthlyEarnings), [summary.monthlyEarnings]);

    const available = earningsData?.availableBalance ?? 0;
    const failed = !!error && !earningsData;
    const earnings = earningsData?.earnings ?? [];
    const payouts = earningsData?.payouts ?? [];

    return (
        <>
            <PageHeader
                title="Earnings"
                subtitle="Track your income and withdraw it to your bank account"
            />

            <Box sx={{ display: 'grid', gap: 2.5 }}>
                {failed ? (
                    <ErrorState
                        title="Could not load your earnings"
                        message={getErrorMessage(error, 'Check your connection and try again.')}
                        onRetry={() => void refetch()}
                    />
                ) : (
                    <EarningsStats
                        loading={isLoading}
                        failed={false}
                        onRetry={() => void refetch()}
                        available={available}
                        pending={summary.pendingBalance}
                        total={summary.totalEarnings}
                        availableHint={
                            available > 0
                                ? 'Ready to withdraw'
                                : 'Available after jobs are completed'
                        }
                        availableAction={
                            <Button
                                size="small"
                                variant="contained"
                                disabled={available <= 0}
                                onClick={() => {
                                    setPayoutError(null);
                                    setPayoutOpen(true);
                                }}
                            >
                                Withdraw
                            </Button>
                        }
                    />
                )}

                <Panel
                    title="Payout account"
                    subtitle="Payouts are handled by Stripe, our payments partner."
                    flush
                >
                    <StripeRow
                        title="Set up or update payout details"
                        description="Add the bank account and identity details Stripe needs to pay you. Opens Stripe in a new tab."
                        label="Set up payouts"
                        busy={loadingOnboarding}
                        onClick={() => void handleWithdrawMethods()}
                    />
                    <StripeRow
                        divider
                        title="View your Stripe dashboard"
                        description="See transfers and payouts to your bank, and manage your account in Stripe. Opens in a new tab."
                        label="Open Stripe dashboard"
                        busy={loadingLogin}
                        onClick={() => void handleViewDashboard()}
                    />
                </Panel>

                {!failed && (
                    <>
                        <Box
                            sx={{
                                display: 'grid',
                                gap: 2.5,
                                gridTemplateColumns: {
                                    xs: '1fr',
                                    lg: 'minmax(0, 1.35fr) minmax(0, 1fr)',
                                },
                                alignItems: 'start',
                            }}
                        >
                            <Panel
                                title="Monthly earnings"
                                footer={
                                    stats && !isLoading ? (
                                        <>
                                            <span>
                                                Best month: <strong>{stats.best.month}</strong>
                                            </span>
                                            <span>{formatMoney(stats.average)} average</span>
                                        </>
                                    ) : undefined
                                }
                            >
                                {isLoading ? (
                                    <Skeleton variant="rounded" height={260} />
                                ) : (
                                    <MonthlyChart data={summary.monthlyEarnings} height={260} />
                                )}
                            </Panel>

                            <Panel title="Payout history" flush>
                                {isLoading ? (
                                    <Box sx={{ p: 2.5 }}>
                                        <Skeleton height={28} />
                                        <Skeleton height={28} />
                                        <Skeleton height={28} />
                                    </Box>
                                ) : payouts.length > 0 ? (
                                    <PayoutTable payouts={payouts} />
                                ) : (
                                    <EmptyState
                                        bare
                                        icon={<AccountBalanceWallet />}
                                        title="No payouts yet"
                                        description="Payouts you request appear here with their status."
                                        sx={{ py: 4 }}
                                    />
                                )}
                            </Panel>
                        </Box>

                        {isLoading ? (
                            <ListSkeleton rows={4} label="Loading earnings history" />
                        ) : (
                            <Panel
                                title="Earnings history"
                                subtitle={
                                    earnings.length > HISTORY_LIMIT
                                        ? `Showing your ${HISTORY_LIMIT} most recent earnings`
                                        : undefined
                                }
                                flush
                            >
                                {earnings.length > 0 ? (
                                    <EarningsHistoryList
                                        earnings={earnings.slice(0, HISTORY_LIMIT)}
                                    />
                                ) : (
                                    <EmptyState
                                        bare
                                        icon={<ReceiptLong />}
                                        title="No earnings yet"
                                        description="Earnings from completed jobs appear here, each with a receipt."
                                    />
                                )}
                            </Panel>
                        )}
                    </>
                )}
            </Box>

            <PayoutDialog
                open={payoutOpen}
                availableBalance={available}
                loading={isCreatingPayout}
                submitError={payoutError}
                onSubmit={(amount) => void handlePayout(amount)}
                onClose={() => setPayoutOpen(false)}
            />
        </>
    );
}
