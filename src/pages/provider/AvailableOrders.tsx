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
import { CalendarMonth, AccessTime, LocationOn, AttachMoney } from '@mui/icons-material';
import dayjs from 'dayjs';
import { useGetAvailableBookingsQuery } from '@/features/provider/providerApi';
import type { Booking } from '@/types';

function OrderCard({ booking, onClick }: { booking: Booking; onClick: () => void }) {
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
                    <Chip label="Available" color="success" size="small" />
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
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <AttachMoney fontSize="small" color="action" />
                        <Typography variant="body2" color="text.secondary">
                            £{booking.rate || 0}/hr
                        </Typography>
                    </Box>
                </Stack>
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        mt: 3,
                        pt: 2,
                        borderTop: '1px solid',
                        borderColor: 'divider',
                    }}
                >
                    <Typography variant="body2" color="text.secondary">
                        Total Earnings
                    </Typography>
                    <Typography variant="h6" color="primary" fontWeight={600}>
                        £{(((booking.rate || 0) * (booking.hours || 0)) * 0.95).toFixed(2)}
                    </Typography>
                </Box>
            </CardContent>
        </Card>
    );
}

export default function AvailableOrders() {
    const navigate = useNavigate();
    const { data: bookings, isLoading, refetch } = useGetAvailableBookingsQuery();

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Box>
                    <Typography variant="h4" fontWeight={700}>
                        Available Orders
                    </Typography>
                    <Typography color="text.secondary">
                        Browse and accept jobs in your area
                    </Typography>
                </Box>
                <Button variant="outlined" onClick={() => refetch()}>
                    Refresh
                </Button>
            </Box>

            {isLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                    <CircularProgress />
                </Box>
            ) : bookings && bookings.length > 0 ? (
                <Grid container spacing={3} sx={{ maxWidth: 1200 }}>
                    {bookings.map((booking) => (
                        <Grid size={{ xs: 12, sm: 6, lg: 4 }} key={booking._id}>
                            <OrderCard
                                booking={booking}
                                onClick={() => navigate(`/provider/orders/${booking._id}`)}
                            />
                        </Grid>
                    ))}
                </Grid>
            ) : (
                <Box sx={{ textAlign: 'center', py: 8 }}>
                    <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
                        No available orders at the moment
                    </Typography>
                    <Typography color="text.secondary">
                        Check back later or make sure your services are enabled in the dashboard
                    </Typography>
                </Box>
            )}
        </Box>
    );
}
