import { useMemo } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Box, Button, Skeleton } from '@mui/material';
import dayjs from 'dayjs';
import { useAppSelector } from '@/store/hooks';
import { selectCurrentUser } from '@/features/auth/authSlice';
import {
    useGetAvailableBookingsQuery,
    useGetEarningsQuery,
    useGetMyOrdersQuery,
} from '@/features/provider/providerApi';
import { ErrorState, PageHeader, Panel } from '@/components/ui';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { formatMoney, getErrorMessage } from '@/utils/format';
import AvailabilityPanel from './components/AvailabilityPanel';
import EarningsStats from './components/EarningsStats';
import LocationPanel from './components/LocationPanel';
import MonthlyChart from './components/MonthlyChart';
import OpenOrdersPanel from './components/OpenOrdersPanel';
import TodaysJobs from './components/TodaysJobs';
import { byStartAsc, jobsToday, monthlyStats, summarizeEarnings } from './orderUtils';
import { useProviderLocation } from './useProviderLocation';

function greeting(hour: number) {
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
}

export default function ProviderDashboard() {
    useDocumentTitle('Home');
    const user = useAppSelector(selectCurrentUser);
    const { location, error: locationError } = useProviderLocation(user);

    const earningsQuery = useGetEarningsQuery();
    const ordersQuery = useGetMyOrdersQuery();
    const availableQuery = useGetAvailableBookingsQuery();

    const summary = useMemo(() => summarizeEarnings(earningsQuery.data), [earningsQuery.data]);
    const today = useMemo(() => jobsToday(ordersQuery.data), [ordersQuery.data]);
    const openOrders = useMemo(
        () => [...(availableQuery.data ?? [])].sort(byStartAsc),
        [availableQuery.data]
    );
    const stats = useMemo(() => monthlyStats(summary.monthlyEarnings), [summary.monthlyEarnings]);

    const earningsFailed = !!earningsQuery.error && !earningsQuery.data;
    const now = dayjs();
    const subtitle = ordersQuery.isLoading
        ? now.format('dddd D MMMM')
        : `${now.format('dddd D MMMM')} · ${today.length === 0 ? 'No jobs today' : `${today.length} ${today.length === 1 ? 'job' : 'jobs'} today`}`;

    return (
        <>
            <PageHeader
                title={`${greeting(now.hour())}${user?.firstName ? `, ${user.firstName}` : ''}`}
                subtitle={subtitle}
                actions={
                    <Button component={RouterLink} to="/provider/my-orders" variant="outlined">
                        View my orders
                    </Button>
                }
            />

            <Box sx={{ display: 'grid', gap: 2.5 }}>
                <AvailabilityPanel location={location} />

                <EarningsStats
                    loading={earningsQuery.isLoading}
                    failed={earningsFailed}
                    errorMessage={getErrorMessage(earningsQuery.error, '') || undefined}
                    onRetry={() => void earningsQuery.refetch()}
                    available={earningsQuery.data?.availableBalance ?? 0}
                    pending={summary.pendingBalance}
                    total={summary.totalEarnings}
                    availableAction={
                        (earningsQuery.data?.availableBalance ?? 0) > 0 ? (
                            <Button
                                component={RouterLink}
                                to="/provider/earnings"
                                size="small"
                                variant="contained"
                            >
                                Withdraw
                            </Button>
                        ) : undefined
                    }
                />

                <Box
                    sx={{
                        display: 'grid',
                        gap: 2.5,
                        gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 1.35fr) minmax(0, 1fr)' },
                        alignItems: 'start',
                    }}
                >
                    <TodaysJobs
                        jobs={today}
                        loading={ordersQuery.isLoading}
                        error={
                            ordersQuery.error && !ordersQuery.data ? ordersQuery.error : undefined
                        }
                        onRetry={() => void ordersQuery.refetch()}
                    />
                    <Panel
                        title="Monthly earnings"
                        footer={
                            stats && (
                                <>
                                    <span>
                                        Best month: <strong>{stats.best.month}</strong>
                                    </span>
                                    <span>{formatMoney(stats.average)} average</span>
                                </>
                            )
                        }
                    >
                        {earningsQuery.isLoading ? (
                            <Skeleton variant="rounded" height={240} />
                        ) : earningsFailed ? (
                            <ErrorState
                                bare
                                title="Could not load the chart"
                                onRetry={() => void earningsQuery.refetch()}
                            />
                        ) : (
                            <MonthlyChart data={summary.monthlyEarnings} />
                        )}
                    </Panel>
                </Box>

                <OpenOrdersPanel
                    orders={openOrders}
                    loading={availableQuery.isLoading}
                    error={
                        availableQuery.error && !availableQuery.data
                            ? availableQuery.error
                            : undefined
                    }
                    onRetry={() => void availableQuery.refetch()}
                />

                <LocationPanel location={location} error={locationError} />
            </Box>
        </>
    );
}
