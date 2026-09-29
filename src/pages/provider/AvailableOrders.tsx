import { Button, Chip } from '@mui/material';
import { Refresh, WorkOutline } from '@mui/icons-material';
import { useGetAvailableBookingsQuery } from '@/features/provider/providerApi';
import { BookingGrid } from '@/components/common/BookingCard';
import EmptyState from '@/components/common/EmptyState';
import PageHeader from '@/components/common/PageHeader';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

const getOrderLink = (id: string) => `/provider/orders/${id}`;
const availableBadge = <Chip label="Available" color="success" size="small" />;

export default function AvailableOrders() {
    useDocumentTitle('Available orders');
    const { data: bookings, isLoading, isFetching, refetch } = useGetAvailableBookingsQuery();

    return (
        <>
            <PageHeader
                title="Available orders"
                subtitle="Browse and accept jobs in your area"
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
            <BookingGrid
                bookings={bookings ?? []}
                loading={isLoading}
                role="provider"
                getLink={getOrderLink}
                badge={availableBadge}
                empty={
                    <EmptyState
                        icon={<WorkOutline />}
                        title="No available orders right now"
                        description="Check back later or make sure your services are enabled in the dashboard."
                    />
                }
            />
        </>
    );
}
