import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Box,
    Typography,
    Card,
    CardContent,
    Button,
    Chip,
    CircularProgress,
    Alert,
    Stack,
    Divider,
    Avatar,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
} from '@mui/material';
import { ArrowBack, CalendarMonth, AccessTime, LocationOn } from '@mui/icons-material';
import dayjs from 'dayjs';
import {
    useGetProviderBookingByIdMutation,
    useStartBookingMutation,
} from '@/features/provider/providerApi';
import { useCompleteBookingMutation, useCancelBookingMutation } from '@/features/booking/bookingApi';
import type { Booking, User } from '@/types';

export default function MyOrderDetails() {
    const { bookingId } = useParams<{ bookingId: string }>();
    const navigate = useNavigate();

    const [booking, setBooking] = useState<Booking | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
    const [cancelReason, setCancelReason] = useState('');

    const [getBooking, { isLoading }] = useGetProviderBookingByIdMutation();
    const [startBooking, { isLoading: isStarting }] = useStartBookingMutation();
    const [completeBooking, { isLoading: isCompleting }] = useCompleteBookingMutation();
    const [cancelBooking, { isLoading: isCancelling }] = useCancelBookingMutation();

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

    const handleStart = async () => {
        try {
            await startBooking({ bookingId: bookingId! }).unwrap();
            fetchBooking();
        } catch {
            setError('Failed to start job');
        }
    };

    const handleComplete = async () => {
        try {
            await completeBooking({ bookingId: bookingId! }).unwrap();
            fetchBooking();
        } catch {
            setError('Failed to complete job');
        }
    };

    const handleCancel = async () => {
        try {
            await cancelBooking({ bookingId: bookingId!, reason: cancelReason }).unwrap();
            setCancelDialogOpen(false);
            fetchBooking();
        } catch {
            setError('Failed to cancel order');
        }
    };

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
                <Button
                    startIcon={<ArrowBack />}
                    onClick={() => navigate('/provider/my-orders')}
                    sx={{ mb: 3 }}
                >
                    Back to My Orders
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
            <Button
                startIcon={<ArrowBack />}
                onClick={() => navigate('/provider/my-orders')}
                sx={{ mb: 3 }}
            >
                Back to My Orders
            </Button>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Typography variant="h4" fontWeight={700}>
                    Order Details
                </Typography>
                <Chip
                    label={(booking.status || 'pending').replace('_', ' ')}
                    color={getStatusColor(booking.status || 'pending')}
                    size="medium"
                />
            </Box>

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
                                        {user.phone && (
                                            <Typography variant="body2" color="text.secondary">
                                                {user.phone}
                                            </Typography>
                                        )}
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

                    {/* Action Buttons */}
                    <Stack spacing={2}>
                        {booking.status === 'accepted' && (
                            <>
                                <Button
                                    variant="contained"
                                    fullWidth
                                    size="large"
                                    onClick={handleStart}
                                    disabled={isStarting}
                                >
                                    {isStarting ? (
                                        <CircularProgress size={24} color="inherit" />
                                    ) : (
                                        'Start Job'
                                    )}
                                </Button>
                                <Button
                                    variant="outlined"
                                    color="error"
                                    fullWidth
                                    onClick={() => setCancelDialogOpen(true)}
                                >
                                    Cancel Order
                                </Button>
                            </>
                        )}

                        {booking.status === 'in_progress' && (
                            <Button
                                variant="contained"
                                color="success"
                                fullWidth
                                size="large"
                                onClick={handleComplete}
                                disabled={isCompleting}
                            >
                                {isCompleting ? (
                                    <CircularProgress size={24} color="inherit" />
                                ) : (
                                    'Complete Job'
                                )}
                            </Button>
                        )}

                        {booking.status === 'completed' && (
                            <Alert severity="success">This job has been completed!</Alert>
                        )}

                        {booking.status === 'cancelled' && (
                            <Alert severity="error">This order was cancelled</Alert>
                        )}
                    </Stack>
                </Box>
            </Box>

            {/* Cancel Dialog */}
            <Dialog open={cancelDialogOpen} onClose={() => setCancelDialogOpen(false)}>
                <DialogTitle>Cancel Order</DialogTitle>
                <DialogContent>
                    <Typography sx={{ mb: 3 }}>
                        Are you sure you want to cancel this order?
                    </Typography>
                    <TextField
                        fullWidth
                        label="Reason for cancellation"
                        multiline
                        rows={3}
                        value={cancelReason}
                        onChange={(e) => setCancelReason(e.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setCancelDialogOpen(false)}>Keep Order</Button>
                    <Button
                        variant="contained"
                        color="error"
                        onClick={handleCancel}
                        disabled={isCancelling}
                    >
                        {isCancelling ? <CircularProgress size={24} /> : 'Cancel Order'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
