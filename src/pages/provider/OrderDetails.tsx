import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Box,
    Typography,
    Card,
    CardContent,
    Button,
    CircularProgress,
    Alert,
    Stack,
    Divider,
    Avatar,
} from '@mui/material';
import { ArrowBack, CalendarMonth, AccessTime, LocationOn } from '@mui/icons-material';
import dayjs from 'dayjs';
import {
    useGetProviderBookingByIdMutation,
    useAcceptBookingMutation,
} from '@/features/provider/providerApi';
import type { Booking, User } from '@/types';

export default function OrderDetails() {
    const { bookingId } = useParams<{ bookingId: string }>();
    const navigate = useNavigate();

    const [booking, setBooking] = useState<Booking | null>(null);
    const [error, setError] = useState<string | null>(null);

    const [getBooking, { isLoading }] = useGetProviderBookingByIdMutation();
    const [acceptBooking, { isLoading: isAccepting }] = useAcceptBookingMutation();

    useEffect(() => {
        if (bookingId) {
            fetchBooking();
        }
    }, [bookingId]);

    const fetchBooking = async () => {
        try {
            const result = await getBooking({ bookingId: bookingId! }).unwrap();
            setBooking(result.booking);
        } catch {
            setError('Failed to load order details');
        }
    };

    const handleAccept = async () => {
        try {
            await acceptBooking({ bookingId: bookingId! }).unwrap();
            navigate('/provider/my-orders');
        } catch {
            setError('Failed to accept order');
        }
    };

    if (isLoading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error || !booking) {
        return (
            <Box>
                <Button startIcon={<ArrowBack />} onClick={() => navigate('/provider/orders')} sx={{ mb: 3 }}>
                    Back to Orders
                </Button>
                <Alert severity="error">{error || 'Order not found'}</Alert>
            </Box>
        );
    }

    const user = booking.userId as User;
    const subtotal = (booking.rate || 0) * (booking.hours || 0);
    const platformFee = subtotal * 0.05;
    const earnings = subtotal - platformFee;

    return (
        <Box>
            <Button startIcon={<ArrowBack />} onClick={() => navigate('/provider/orders')} sx={{ mb: 3 }}>
                Back to Orders
            </Button>

            <Typography variant="h4" fontWeight={700} sx={{ mb: 4 }}>
                Order Details
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 4, maxWidth: 1000 }}>
                <Box sx={{ flex: 2, minWidth: 0 }}>
                    {/* Service Info */}
                    <Card sx={{ mb: 3 }}>
                        <CardContent>
                            <Box
                                sx={{
                                    bgcolor: 'primary.main',
                                    color: 'white',
                                    p: 3,
                                    borderRadius: 2,
                                    mb: 3,
                                }}
                            >
                                <Typography variant="h5" fontWeight={600}>
                                    {booking.service?.name || 'Service'}
                                </Typography>
                            </Box>

                            <Stack spacing={2}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <CalendarMonth color="action" />
                                    <Box>
                                        <Typography variant="body2" color="text.secondary">
                                            Date
                                        </Typography>
                                        <Typography>
                                            {dayjs(booking.startDate).format('MMMM D, YYYY')}
                                        </Typography>
                                    </Box>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <AccessTime color="action" />
                                    <Box>
                                        <Typography variant="body2" color="text.secondary">
                                            Time & Duration
                                        </Typography>
                                        <Typography>
                                            {dayjs(booking.startTime).format('h:mm A')} • {booking.hours || 0}{' '}
                                            hour{(booking.hours || 0) > 1 ? 's' : ''}
                                        </Typography>
                                    </Box>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <LocationOn color="action" />
                                    <Box>
                                        <Typography variant="body2" color="text.secondary">
                                            Location
                                        </Typography>
                                        <Typography>{booking.address}</Typography>
                                    </Box>
                                </Box>
                            </Stack>
                        </CardContent>
                    </Card>

                    {/* Customer Info */}
                    {user && typeof user === 'object' && (
                        <Card>
                            <CardContent>
                                <Typography variant="h6" fontWeight={600} sx={{ mb: 3 }}>
                                    Customer
                                </Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <Avatar sx={{ width: 56, height: 56, bgcolor: 'primary.main' }}>
                                        {user.firstName?.[0]}
                                    </Avatar>
                                    <Box>
                                        <Typography variant="h6">
                                            {user.firstName} {user.lastName}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            {user.email}
                                        </Typography>
                                    </Box>
                                </Box>
                            </CardContent>
                        </Card>
                    )}
                </Box>

                {/* Earnings & Actions */}
                <Box sx={{ flex: 1 }}>
                    <Card sx={{ mb: 3 }}>
                        <CardContent>
                            <Typography variant="h6" fontWeight={600} sx={{ mb: 3 }}>
                                Earnings Breakdown
                            </Typography>

                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                <Typography color="text.secondary">Hourly Rate</Typography>
                                <Typography>£{booking.rate || 0}</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                <Typography color="text.secondary">Hours</Typography>
                                <Typography>{booking.hours || 0}</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                <Typography color="text.secondary">Subtotal</Typography>
                                <Typography>£{subtotal.toFixed(2)}</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                <Typography color="text.secondary">Platform Fee (5%)</Typography>
                                <Typography color="error">-£{platformFee.toFixed(2)}</Typography>
                            </Box>

                            <Divider sx={{ my: 2 }} />

                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Typography variant="h6" fontWeight={600}>
                                    Your Earnings
                                </Typography>
                                <Typography variant="h6" fontWeight={600} color="success.main">
                                    £{earnings.toFixed(2)}
                                </Typography>
                            </Box>
                        </CardContent>
                    </Card>

                    <Button
                        variant="contained"
                        fullWidth
                        size="large"
                        onClick={handleAccept}
                        disabled={isAccepting}
                        sx={{ py: 1.5 }}
                    >
                        {isAccepting ? <CircularProgress size={24} color="inherit" /> : 'Accept Order'}
                    </Button>
                </Box>
            </Box>
        </Box>
    );
}
