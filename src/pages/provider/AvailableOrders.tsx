import { useMemo } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Button, CircularProgress } from '@mui/material';
import { Refresh, WorkOutline } from '@mui/icons-material';
import { useGetAvailableBookingsQuery } from '@/features/provider/providerApi';
import { EmptyState, ErrorState, ListSkeleton, PageHeader, Panel } from '@/components/ui';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { getErrorMessage } from '@/utils/format';
import OrderList from './components/OrderList';
import { byStartAsc } from './orderUtils';

const getOrderLink = (id: string) => `/provider/orders/${id}`;

export default function AvailableOrders() {
    useDocumentTitle('Available orders');
    const {
        data: bookings,
        error,
        isLoading,
        isFetching,
        refetch,
    } = useGetAvailableBookingsQuery();
    const orders = useMemo(() => [...(bookings ?? [])].sort(byStartAsc), [bookings]);

    let body;
    if (isLoading) {
        body = <ListSkeleton rows={5} label="Loading available orders" />;
    } else if (error && !bookings) {
        body = (
            <ErrorState
                title="Could not load available orders"
                message={getErrorMessage(error, 'Check your connection and try again.')}
                onRetry={() => void refetch()}
            />
        );
    } else if (orders.length === 0) {
        body = (
            <EmptyState
                icon={<WorkOutline />}
                title="No open orders right now"
                description="New orders for your services appear here as customers book them. Check that your services are switched on."
                action={
                    <Button component={RouterLink} to="/provider" variant="outlined">
                        Review my services
                    </Button>
                }
            />
        );
    } else {
        body = (
            <Panel
                title="Open orders"
                subtitle={`${orders.length} ${orders.length === 1 ? 'order' : 'orders'} you can accept, soonest first`}
                flush
            >
                <OrderList orders={orders} getLink={getOrderLink} label="Open orders" />
            </Panel>
        );
    }

    return (
        <>
            <PageHeader
                title="Available orders"
                subtitle="Browse jobs in your area and accept the ones that fit your day"
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
            {body}
        </>
    );
}
