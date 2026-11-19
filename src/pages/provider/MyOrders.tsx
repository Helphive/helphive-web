import { useMemo, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Button, CircularProgress, Tab, Tabs } from '@mui/material';
import { AssignmentTurnedIn, Refresh } from '@mui/icons-material';
import { useGetMyOrdersQuery } from '@/features/provider/providerApi';
import { EmptyState, ErrorState, ListSkeleton, PageHeader, Panel } from '@/components/ui';
import TabLabel from '@/components/common/TabLabel';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import type { Booking } from '@/types';
import { getDisplayStatus, getErrorMessage } from '@/utils/format';
import OrderList from './components/OrderList';
import { startMs } from './orderUtils';

type OrderTab = 'upcoming' | 'active' | 'history';

const getOrderLink = (id: string) => `/provider/my-orders/${id}`;

const TAB_LABEL: Record<OrderTab, string> = {
    upcoming: 'Upcoming',
    active: 'In progress',
    history: 'History',
};

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
    const { data: orders, error, isLoading, isFetching, refetch } = useGetMyOrdersQuery();
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
        result.upcoming.sort((a, b) => startMs(a) - startMs(b));
        result.active.sort((a, b) => startMs(a) - startMs(b));
        result.history.sort((a, b) => startMs(b) - startMs(a));
        return result;
    }, [orders]);

    const current = buckets[tab];
    const failed = !!error && !orders;

    let body;
    if (isLoading) {
        body = <ListSkeleton rows={4} label="Loading your orders" />;
    } else if (failed) {
        body = (
            <ErrorState
                title="Could not load your orders"
                message={getErrorMessage(error, 'Check your connection and try again.')}
                onRetry={() => void refetch()}
            />
        );
    } else if (current.length === 0) {
        body = (
            <EmptyState
                icon={<AssignmentTurnedIn />}
                title={EMPTY_COPY[tab].title}
                description={EMPTY_COPY[tab].description}
                action={
                    tab !== 'history' ? (
                        <Button component={RouterLink} to="/provider/orders" variant="contained">
                            Browse available orders
                        </Button>
                    ) : undefined
                }
            />
        );
    } else {
        body = (
            <Panel flush>
                <OrderList
                    orders={current}
                    getLink={getOrderLink}
                    showStatus
                    label={TAB_LABEL[tab]}
                />
            </Panel>
        );
    }

    return (
        <>
            <PageHeader
                title="My orders"
                subtitle="Jobs you have accepted, from upcoming to finished"
                actions={
                    <Button
                        variant="outlined"
                        startIcon={
                            isFetching && !isLoading ? <CircularProgress size={16} /> : <Refresh />
                        }
                        onClick={() => void refetch()}
                        disabled={isFetching}
                    >
                        Refresh
                    </Button>
                }
            />

            <Tabs
                value={tab}
                onChange={(_, v: OrderTab) => setTab(v)}
                variant="scrollable"
                scrollButtons="auto"
                allowScrollButtonsMobile
                aria-label="Order groups"
                sx={{ mb: 2.5, borderBottom: '1px solid', borderColor: 'divider' }}
            >
                {(Object.keys(TAB_LABEL) as OrderTab[]).map((key) => (
                    <Tab
                        key={key}
                        value={key}
                        label={
                            <TabLabel
                                label={TAB_LABEL[key]}
                                count={isLoading || failed ? undefined : buckets[key].length}
                            />
                        }
                    />
                ))}
            </Tabs>

            {body}
        </>
    );
}
