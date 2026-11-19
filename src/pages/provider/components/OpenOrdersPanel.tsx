import { Link as RouterLink } from 'react-router-dom';
import { Button, Link } from '@mui/material';
import { WorkOutline } from '@mui/icons-material';
import type { Booking } from '@/types';
import { getErrorMessage } from '@/utils/format';
import { EmptyState, ErrorState, ListSkeleton, Panel } from '@/components/ui';
import OrderList from './OrderList';

const getOrderLink = (id: string) => `/provider/orders/${id}`;
const PREVIEW_COUNT = 5;

interface OpenOrdersPanelProps {
    orders: Booking[];
    loading: boolean;
    error?: unknown;
    onRetry: () => void;
}

/** The next few open orders, each linking to its details where it can be accepted. */
export default function OpenOrdersPanel({ orders, loading, error, onRetry }: OpenOrdersPanelProps) {
    if (loading) return <ListSkeleton rows={3} label="Loading open orders" />;

    return (
        <Panel
            title="Open orders near you"
            actions={
                <Link component={RouterLink} to="/provider/orders" underline="hover">
                    All available orders
                </Link>
            }
            flush
        >
            {error ? (
                <ErrorState
                    bare
                    title="Could not load open orders"
                    message={getErrorMessage(error, 'Check your connection and try again.')}
                    onRetry={onRetry}
                />
            ) : orders.length === 0 ? (
                <EmptyState
                    bare
                    icon={<WorkOutline />}
                    title="No open orders right now"
                    description="New orders for your services appear here as customers book them."
                    action={
                        <Button component={RouterLink} to="/provider/orders" variant="outlined">
                            Check available orders
                        </Button>
                    }
                />
            ) : (
                <OrderList
                    orders={orders.slice(0, PREVIEW_COUNT)}
                    getLink={getOrderLink}
                    label="Open orders near you"
                />
            )}
        </Panel>
    );
}
