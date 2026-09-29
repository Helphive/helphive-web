import { useMemo, useState } from 'react';
import { Button, Tab, Tabs } from '@mui/material';
import { AssignmentTurnedIn, Refresh } from '@mui/icons-material';
import { useGetMyOrdersQuery } from '@/features/provider/providerApi';
import { BookingGrid } from '@/components/common/BookingCard';
import EmptyState from '@/components/common/EmptyState';
import PageHeader from '@/components/common/PageHeader';
import TabLabel from '@/components/common/TabLabel';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import type { Booking } from '@/types';
import { getDisplayStatus } from '@/utils/format';

type OrderTab = 'upcoming' | 'active' | 'history';

const getOrderLink = (id: string) => `/provider/my-orders/${id}`;

const EMPTY_COPY: Record<OrderTab, { title: string; description: string }> = {
    upcoming: {
        title: 'No upcoming orders',
        description: 'Jobs you accept and have not started yet appear here.',
    },
    active: {
        title: 'No jobs in progress',
        description: 'Jobs awaiting customer approval or in progress appear here.',
    },
    history: {
        title: 'No order history yet',
        description: 'Completed, cancelled and expired orders appear here.',
    },
};

export default function MyOrders() {
    useDocumentTitle('My orders');
    const [tab, setTab] = useState<OrderTab>('upcoming');
    const { data: orders, isLoading, isFetching, refetch } = useGetMyOrdersQuery();
    const buckets = useMemo(() => {
        const result: Record<OrderTab, Booking[]> = { upcoming: [], active: [], history: [] };
        for (const order of orders ?? []) {
            const status = getDisplayStatus(order);
            if (status === 'in_progress' || status === 'awaiting_start_approval') {
                result.active.push(order);
            } else if (status === 'accepted' || status === 'scheduled') {
                result.upcoming.push(order);
            } else {
                result.history.push(order);
            }
        }
        const start = (o: Booking) => new Date(o.startDate).getTime();
        result.upcoming.sort((a, b) => start(a) - start(b));
        result.active.sort((a, b) => start(a) - start(b));
        result.history.sort((a, b) => start(b) - start(a));
        return result;
    }, [orders]);

    return (
        <>
            <PageHeader
                title="My orders"
                subtitle="Manage your accepted jobs"
                actions={
                    <Button
                        variant="outlined"
                        startIcon={<Refresh />}
                        onClick={() => refetch()}
                        disabled={isFetching}
                    >
                        {isFetching && !isLoading ? 'Refreshing...' : 'Refresh'}
                    </Button>
                }
            />

            <Tabs
                value={tab}
                onChange={(_, v: OrderTab) => setTab(v)}
                variant="scrollable"
                scrollButtons="auto"
                allowScrollButtonsMobile
                sx={{ mb: 3, borderBottom: '1px solid', borderColor: 'divider' }}
            >
                <Tab
                    value="upcoming"
                    label={
                        <TabLabel
                            label="Upcoming"
                            count={isLoading ? undefined : buckets.upcoming.length}
                        />
                    }
                />
                <Tab
                    value="active"
                    label={
                        <TabLabel
                            label="In progress"
                            count={isLoading ? undefined : buckets.active.length}
                        />
                    }
                />
                <Tab
                    value="history"
                    label={
                        <TabLabel
                            label="History"
                            count={isLoading ? undefined : buckets.history.length}
                        />
                    }
                />
            </Tabs>

            <BookingGrid
                bookings={buckets[tab]}
                loading={isLoading}
                role="provider"
                getLink={getOrderLink}
                empty={
                    <EmptyState
                        icon={<AssignmentTurnedIn />}
                        title={EMPTY_COPY[tab].title}
                        description={EMPTY_COPY[tab].description}
                    />
                }
            />
        </>
    );
}
