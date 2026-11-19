import type { ReactNode } from 'react';
import { Box, Skeleton } from '@mui/material';
import { ErrorState, Money, StatGroup, StatTile } from '@/components/ui';

interface EarningsStatsProps {
    loading: boolean;
    failed: boolean;
    onRetry: () => void;
    errorMessage?: string;
    available: number;
    pending: number;
    total: number;
    /** Button next to the available balance (Withdraw). Hidden while loading. */
    availableAction?: ReactNode;
    availableHint?: ReactNode;
}

/** Available, pending and total earnings as one hairline strip, with its own loading and error state. */
export default function EarningsStats({
    loading,
    failed,
    onRetry,
    errorMessage,
    available,
    pending,
    total,
    availableAction,
    availableHint,
}: EarningsStatsProps) {
    if (failed) {
        return (
            <ErrorState
                title="Could not load your earnings"
                message={errorMessage ?? 'Check your connection and try again.'}
                onRetry={onRetry}
            />
        );
    }

    const figure = (amount: number) =>
        loading ? <Skeleton width={110} sx={{ fontSize: 'inherit' }} /> : <Money amount={amount} />;

    return (
        <Box role={loading ? 'status' : undefined} aria-busy={loading || undefined}>
            <StatGroup columns={3} aria-label="Earnings summary">
                <StatTile
                    featured
                    label="Available balance"
                    value={figure(available)}
                    action={loading ? undefined : availableAction}
                    hint={availableHint}
                />
                <StatTile
                    label="Pending balance"
                    value={figure(pending)}
                    hint="Released after completion"
                />
                <StatTile label="Total earnings" value={figure(total)} hint="All completed jobs" />
            </StatGroup>
        </Box>
    );
}
