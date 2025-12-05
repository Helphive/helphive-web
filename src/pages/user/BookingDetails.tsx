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
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Avatar,
    Divider,
    Stack,
} from '@mui/material';
import {
    ArrowBack,
    CalendarMonth,
    AccessTime,
    LocationOn,
    Person,
    Phone,
    Email,
} from '@mui/icons-material';
import dayjs from 'dayjs';
import {
    useGetBookingByIdMutation,
    useCancelBookingMutation,
    useApproveStartJobRequestMutation,
} from '@/features/booking/bookingApi';
import type { Booking, User } from '@/types';

export default function BookingDetails() {
    const { bookingId } = useParams<{ bookingId: string }>();
    const navigate = useNavigate();

    const [booking, setBooking] = useState<Booking | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
    const [cancelReason, setCancelReason] = useState('');

    const [getBooking, { isLoading }] = useGetBookingByIdMutation();
    const [cancelBooking, { isLoading: isCancelling }] = useCancelBookingMutation();
    const [approveStartJob, { isLoading: isApproving }] = useApproveStartJobRequestMutation();

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
            setError('Failed to load booking details');
        }
    };

    const handleCancel = async () => {
        try {
            await cancelBooking({ bookingId: bookingId!, reason: cancelReason }).unwrap();
            setCancelDialogOpen(false);
            fetchBooking();
        } catch {
            setError('Failed to cancel booking');
        }
    };

    const handleApproveStart = async () => {
        try {
            await approveStartJob({ bookingId: bookingId! }).unwrap();
            fetchBooking();
        } catch {
            setError('Failed to approve job start');
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

    if (error) {
        return (
            <Box>
                <Button startIcon={<ArrowBack />} onClick={() => navigate('/user')} sx={{ mb: 3 }}>
                    Back to Dashboard
                </Button>
                <Alert severity="error">{error}</Alert>
            </Box>
        );
    }

    if (isLoading || !booking) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                <CircularProgress />
            </Box>
        );
    }

    const provider = booking.providerId as User | undefined;

    return (
        <Box>
            <Button startIcon={<ArrowBack />} onClick={() => navigate('/user')} sx={{ mb: 3 }}>
                Back to Dashboard
            </Button>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Typography variant="h4" fontWeight={700}>
                    Booking Details
                </Typography>
                <Chip
                    label={(booking.status || 'pending').replace('_', ' ')}
                    color={getStatusColor(booking.status || 'pending')}
                    size="medium"
                />
            </Box>

            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 4, maxWidth: 1000 }}>
                {/* Main Details */}
                <Box sx={{ flex: 2, minWidth: 0 }}>
                    <Card sx={{ mb: 3 }}>
                        <CardContent>
                            <Typography variant="h6" fontWeight={600} sx={{ mb: 3 }}>
                                Service Details
                            </Typography>

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
                                            {dayjs(booking.startTime).format('h:mm A')} •{' '}
                                            {booking.hours || 0} hour{(booking.hours || 0) > 1 ? 's' : ''}
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

                    {/* Provider Info */}
                    {provider && typeof provider === 'object' && (
                        <Card>
                            <CardContent>
                                <Typography variant="h6" fontWeight={600} sx={{ mb: 3 }}>
                                    Provider
                                </Typography>

                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                                    <Avatar
                                        src={provider.profile}
                                        sx={{ width: 64, height: 64, bgcolor: 'primary.main' }}
                                    >
                                        {provider.firstName?.[0]}
                                    </Avatar>
                                    <Box>
                                        <Typography variant="h6">
                                            {provider.firstName} {provider.lastName}
                                        </Typography>
                                        {provider.rating && (
                                            <Typography variant="body2" color="text.secondary">
                                                ⭐ {provider.rating.toFixed(1)} rating
                                            </Typography>
                                        )}
                                    </Box>
                                </Box>

                                <Stack spacing={2}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        <Email color="action" fontSize="small" />
                                        <Typography>{provider.email}</Typography>
                                    </Box>
                                    {provider.phone && (
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                            <Phone color="action" fontSize="small" />
                                            <Typography>{provider.phone}</Typography>
                                        </Box>
                                    )}
                                </Stack>
                            </CardContent>
                        </Card>
                    )}

                    {!provider && booking.status === 'paid' && (
                        <Card>
                            <CardContent sx={{ textAlign: 'center', py: 4 }}>
                                <Person sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                                <Typography color="text.secondary">
                                    Waiting for a provider to accept your booking
                                </Typography>
                            </CardContent>
                        </Card>
                    )}
                </Box>

                {/* Payment & Actions */}
                <Box sx={{ flex: 1 }}>
                    <Card sx={{ mb: 3 }}>
                        <CardContent>
                            <Typography variant="h6" fontWeight={600} sx={{ mb: 3 }}>
                                Payment Summary
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
                                <Typography>£{((booking.rate || 0) * (booking.hours || 0)).toFixed(2)}</Typography>
                            </Box>

                            {booking.platformFee != null && (
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                    <Typography color="text.secondary">Platform Fee</Typography>
                                    <Typography>£{booking.platformFee.toFixed(2)}</Typography>
                                </Box>
                            )}

                            <Divider sx={{ my: 2 }} />

                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Typography variant="h6" fontWeight={600}>
                                    Total
                                </Typography>
                                <Typography variant="h6" fontWeight={600} color="primary">
                                    £{(booking.amount ?? booking.rate * booking.hours).toFixed(2)}
                                </Typography>
                            </Box>

                            <Chip
                                label={booking.paymentStatus === 'completed' ? 'Paid' : 'Pending'}
                                color={booking.paymentStatus === 'completed' ? 'success' : 'warning'}
                                sx={{ mt: 2 }}
                            />
                        </CardContent>
                    </Card>

                    {/* Actions */}
                    <Stack spacing={2}>
                        {booking.userApprovalRequested && booking.status === 'accepted' && (
                            <Button
                                variant="contained"
                                fullWidth
                                onClick={handleApproveStart}
                                disabled={isApproving}
                            >
                                {isApproving ? (
                                    <CircularProgress size={24} color="inherit" />
                                ) : (
                                    'Approve Job Start'
                                )}
                            </Button>
                        )}

                        {['pending', 'paid', 'accepted'].includes(booking.status) && (
                            <Button
                                variant="outlined"
                                color="error"
                                fullWidth
                                onClick={() => setCancelDialogOpen(true)}
                            >
                                Cancel Booking
                            </Button>
                        )}
                    </Stack>
                </Box>
            </Box>

            {/* Cancel Dialog */}
            <Dialog open={cancelDialogOpen} onClose={() => setCancelDialogOpen(false)}>
                <DialogTitle>Cancel Booking</DialogTitle>
                <DialogContent>
                    <Typography sx={{ mb: 3 }}>
                        Are you sure you want to cancel this booking? This action cannot be undone.
                    </Typography>
                    <TextField
                        fullWidth
                        label="Reason for cancellation (optional)"
                        multiline
                        rows={3}
                        value={cancelReason}
                        onChange={(e) => setCancelReason(e.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setCancelDialogOpen(false)}>Keep Booking</Button>
                    <Button
                        variant="contained"
                        color="error"
                        onClick={handleCancel}
                        disabled={isCancelling}
                    >
                        {isCancelling ? <CircularProgress size={24} /> : 'Cancel Booking'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
