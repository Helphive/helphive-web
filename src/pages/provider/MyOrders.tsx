import { useNavigate } from 'react-router-dom';
import {
    Box,
    Typography,
    Card,
    CardContent,
    CircularProgress,
    Chip,
    Stack,
    Button,
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import { CalendarMonth, AccessTime, LocationOn } from '@mui/icons-material';
import dayjs from 'dayjs';
import { useGetMyOrdersQuery } from '@/features/provider/providerApi';
import type { Booking } from '@/types';

function OrderCard({ booking, onClick }: { booking: Booking; onClick: () => void }) {
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed':
                return 'success';
            case 'cancelled':
                return 'error';
            case 'in_progress':
                return 'warning';
            case 'accepted':
                return 'info';
            default:
                return 'default';
        }
    };

    return (
        <Card
            sx={{
                cursor: 'pointer',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                },
            }}
            onClick={onClick}
        >
            <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="h6" fontWeight={600}>
                        {booking.service?.name || 'Service'}
                    </Typography>
                    <Chip
                        label={(booking.status || 'pending').replace('_', ' ')}
                        color={getStatusColor(booking.status || 'pending')}
                        size="small"
                    />
                </Box>
                <Stack spacing={1.5}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CalendarMonth fontSize="small" color="action" />
                        <Typography variant="body2" color="text.secondary">
                            {dayjs(booking.startDate).format('MMM D, YYYY')}
                        </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <AccessTime fontSize="small" color="action" />
                        <Typography variant="body2" color="text.secondary">
                            {dayjs(booking.startTime).format('h:mm A')} • {booking.hours || 0} hour
                            {(booking.hours || 0) > 1 ? 's' : ''}
                        </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <LocationOn fontSize="small" color="action" />
                        <Typography variant="body2" color="text.secondary" noWrap>
                            {booking.address}
                        </Typography>
                    </Box>
                </Stack>
                <Typography variant="h6" color="primary" sx={{ mt: 2 }}>
                    £{(((booking.rate || 0) * (booking.hours || 0)) * 0.95).toFixed(2)}
                </Typography>
            </CardContent>
        </Card>
    );
}

export default function MyOrders() {
    const navigate = useNavigate();
    const { data: orders, isLoading, refetch } = useGetMyOrdersQuery();

    const activeOrders = orders?.filter((o) => ['accepted', 'in_progress'].includes(o.status || '')) || [];
    const completedOrders = orders?.filter((o) => (o.status || '') === 'completed') || [];

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Box>
                    <Typography variant="h4" fontWeight={700}>
                        My Orders
                    </Typography>
                    <Typography color="text.secondary">Manage your accepted jobs</Typography>
                </Box>
                <Button variant="outlined" onClick={() => refetch()}>
                    Refresh
                </Button>
            </Box>

            {isLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                    <CircularProgress />
                </Box>
            ) : (
                <>
                    {/* Active Orders */}
                    <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
                        Active Orders ({activeOrders.length})
                    </Typography>
                    {activeOrders.length > 0 ? (
                        <Grid container spacing={3} sx={{ mb: 4, maxWidth: 1200 }}>
                            {activeOrders.map((order) => (
                                <Grid size={{ xs: 12, sm: 6, lg: 4 }} key={order._id}>
                                    <OrderCard
                                        booking={order}
                                        onClick={() => navigate(`/provider/my-orders/${order._id}`)}
                                    />
                                </Grid>
                            ))}
                        </Grid>
                    ) : (
                        <Box sx={{ textAlign: 'center', py: 4, mb: 4 }}>
                            <Typography color="text.secondary">No active orders</Typography>
                        </Box>
                    )}

                    {/* Completed Orders */}
                    <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
                        Completed Orders ({completedOrders.length})
                    </Typography>
                    {completedOrders.length > 0 ? (
                        <Grid container spacing={3} sx={{ maxWidth: 1200 }}>
                            {completedOrders.map((order) => (
                                <Grid size={{ xs: 12, sm: 6, lg: 4 }} key={order._id}>
                                    <OrderCard
                                        booking={order}
                                        onClick={() => navigate(`/provider/my-orders/${order._id}`)}
                                    />
                                </Grid>
                            ))}
                        </Grid>
                    ) : (
                        <Box sx={{ textAlign: 'center', py: 4 }}>
                            <Typography color="text.secondary">No completed orders yet</Typography>
                        </Box>
                    )}
                </>
            )}
        </Box>
    );
}
