import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Typography,
    Card,
    CardContent,
    Button,
    Tabs,
    Tab,
    Chip,
    CircularProgress,
    Alert,
    Slider,
    Stack,
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import {
    CalendarMonth as CalendarIcon,
    AccessTime as TimeIcon,
    LocationOn as LocationIcon,
} from '@mui/icons-material';
import PlacesAutocomplete from '@/components/PlacesAutocomplete';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { selectCurrentUser } from '@/features/auth/authSlice';
import {
    selectBookingFormData,
    setFormData,
    setPaymentInfo,
    resetBookingForm,
} from '@/features/booking/bookingSlice';
import { useCreateBookingMutation, useGetUserBookingsQuery } from '@/features/booking/bookingApi';
import { SERVICES, Booking } from '@/types';

const serviceIcons: Record<number, string> = {
    1: '/icons/sofa.png', // Public Area Attendant
    2: '/icons/bed.png', // Room Attendant
    3: '/icons/door.png', // Linen Porter
};

function BookingCard({ booking, onClick }: { booking: Booking; onClick: () => void }) {
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
                <Stack spacing={1}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CalendarIcon fontSize="small" color="action" />
                        <Typography variant="body2" color="text.secondary">
                            {dayjs(booking.startDate).format('MMM D, YYYY')}
                        </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <TimeIcon fontSize="small" color="action" />
                        <Typography variant="body2" color="text.secondary">
                            {booking.hours || 0} hour{(booking.hours || 0) > 1 ? 's' : ''} @ £{booking.rate || 0}/hr
                        </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <LocationIcon fontSize="small" color="action" />
                        <Typography variant="body2" color="text.secondary" noWrap>
                            {booking.address}
                        </Typography>
                    </Box>
                </Stack>
                <Typography variant="h6" color="primary" sx={{ mt: 2 }}>
                    £{(booking.amount ?? booking.rate * booking.hours).toFixed(2)}
                </Typography>
            </CardContent>
        </Card>
    );
}

export default function UserDashboard() {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const user = useAppSelector(selectCurrentUser);
    const formData = useAppSelector(selectBookingFormData);

    const [activeTab, setActiveTab] = useState(0);
    const [bookingStep, setBookingStep] = useState(1);
    const [date, setDate] = useState<Dayjs | null>(null);
    const [time, setTime] = useState<Dayjs | null>(null);
    const [error, setError] = useState<string | null>(null);

    const [createBooking, { isLoading: isCreating }] = useCreateBookingMutation();
    const { data: bookingsData, isLoading: isLoadingBookings } = useGetUserBookingsQuery();

    const handleServiceSelect = (serviceId: number, serviceName: string) => {
        dispatch(setFormData({ serviceId, serviceName }));
    };

    const handleCreateBooking = async () => {
        if (!formData.serviceId || !date || !time || !formData.address) {
            setError('Please fill in all required fields');
            return;
        }

        try {
            setError(null);
            const result = await createBooking({
                service: { id: formData.serviceId, name: formData.serviceName },
                rate: formData.rate,
                hours: formData.hours,
                startDate: date.toISOString(),
                startTime: time.toISOString(),
                address: formData.address,
                latitude: formData.latitude || 0,
                longitude: formData.longitude || 0,
            }).unwrap();

            dispatch(
                setPaymentInfo({
                    paymentIntentId: result.paymentIntentId,
                    clientSecret: result.clientSecret,
                })
            );

            navigate('/user/payment');
        } catch (err) {
            const error = err as { data?: { message?: string } };
            setError(error.data?.message || 'Failed to create booking. Please try again.');
        }
    };

    const handleResetBooking = () => {
        dispatch(resetBookingForm());
        setBookingStep(1);
        setDate(null);
        setTime(null);
        setError(null);
    };

    return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Box>
                <Typography variant="h4" fontWeight={700} sx={{ mb: 1 }}>
                    Welcome, {user?.firstName}!
                </Typography>
                <Typography color="text.secondary" sx={{ mb: 4 }}>
                    Book hospitality services or manage your bookings
                </Typography>

                <Tabs
                    value={activeTab}
                    onChange={(_, v) => setActiveTab(v)}
                    sx={{ mb: 4, borderBottom: '1px solid', borderColor: 'divider' }}
                >
                    <Tab label="Book Service" />
                    <Tab label="Active Bookings" />
                    <Tab label="History" />
                </Tabs>

                {/* Book Service Tab */}
                {activeTab === 0 && (
                    <Box>
                        {error && (
                            <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
                                {error}
                            </Alert>
                        )}

                        {bookingStep === 1 && (
                            <>
                                <Typography variant="h6" fontWeight={600} sx={{ mb: 3 }}>
                                    Select a Service
                                </Typography>
                                <Grid container spacing={3} sx={{ maxWidth: 900 }}>
                                    {SERVICES.map((service) => (
                                        <Grid size={{ xs: 12, sm: 6, lg: 4 }} key={service.id}>
                                            <Card
                                                sx={{
                                                    cursor: 'pointer',
                                                    border: '2px solid',
                                                    borderColor:
                                                        formData.serviceId === service.id
                                                            ? 'primary.main'
                                                            : 'transparent',
                                                    transition: 'all 0.2s',
                                                    '&:hover': {
                                                        borderColor: 'primary.main',
                                                        transform: 'translateY(-4px)',
                                                    },
                                                }}
                                                onClick={() =>
                                                    handleServiceSelect(service.id, service.name)
                                                }
                                            >
                                                <CardContent sx={{ textAlign: 'center', py: 4 }}>
                                                    <Box
                                                        sx={{
                                                            width: 64,
                                                            height: 64,
                                                            borderRadius: '50%',
                                                            bgcolor: 'primary.light',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            mx: 'auto',
                                                            mb: 2,
                                                        }}
                                                    >
                                                        <Box
                                                            component="img"
                                                            src={serviceIcons[service.id]}
                                                            alt={service.name}
                                                            sx={{ width: 36, height: 36 }}
                                                        />
                                                    </Box>
                                                    <Typography variant="h6" fontWeight={600}>
                                                        {service.name}
                                                    </Typography>
                                                    <Typography
                                                        variant="body2"
                                                        color="text.secondary"
                                                    >
                                                        {service.description}
                                                    </Typography>
                                                </CardContent>
                                            </Card>
                                        </Grid>
                                    ))}
                                </Grid>

                                <Box sx={{ mt: 4, maxWidth: 500 }}>
                                    <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
                                        Hourly Rate: £{formData.rate}
                                    </Typography>
                                    <Slider
                                        value={formData.rate}
                                        onChange={(_, value) =>
                                            dispatch(setFormData({ rate: value as number }))
                                        }
                                        min={20}
                                        max={200}
                                        step={5}
                                        marks={[
                                            { value: 20, label: '£20' },
                                            { value: 100, label: '£100' },
                                            { value: 200, label: '£200' },
                                        ]}
                                        valueLabelDisplay="auto"
                                        valueLabelFormat={(v) => `£${v}`}
                                    />
                                </Box>

                                <Button
                                    variant="contained"
                                    size="large"
                                    onClick={() => setBookingStep(2)}
                                    disabled={!formData.serviceId}
                                    sx={{ mt: 4, px: 6 }}
                                >
                                    Continue
                                </Button>
                            </>
                        )}

                        {bookingStep === 2 && (
                            <Box sx={{ maxWidth: 800 }}>
                                <Button onClick={handleResetBooking} sx={{ mb: 3 }}>
                                    ← Back to Service Selection
                                </Button>

                                <Typography variant="h6" fontWeight={600} sx={{ mb: 3 }}>
                                    Booking Details
                                </Typography>

                                <Card sx={{ mb: 3, bgcolor: 'primary.main', color: 'white' }}>
                                    <CardContent>
                                        <Typography variant="h6">{formData.serviceName}</Typography>
                                        <Typography>£{formData.rate}/hour</Typography>
                                    </CardContent>
                                </Card>

                                <Grid container spacing={3}>
                                    <Grid size={{ xs: 12, sm: 6 }}>
                                        <DatePicker
                                            label="Start Date"
                                            value={date}
                                            onChange={(newValue) => setDate(newValue)}
                                            minDate={dayjs()}
                                            slotProps={{
                                                textField: { fullWidth: true },
                                            }}
                                        />
                                    </Grid>
                                    <Grid size={{ xs: 12, sm: 6 }}>
                                        <TimePicker
                                            label="Start Time"
                                            value={time}
                                            onChange={(newValue) => setTime(newValue)}
                                            slotProps={{
                                                textField: { fullWidth: true },
                                            }}
                                        />
                                    </Grid>
                                    <Grid size={{ xs: 12, sm: 6 }}>
                                        <Typography gutterBottom>
                                            Hours: {formData.hours}
                                        </Typography>
                                        <Slider
                                            value={formData.hours}
                                            onChange={(_, value) =>
                                                dispatch(setFormData({ hours: value as number }))
                                            }
                                            min={1}
                                            max={12}
                                            step={1}
                                            marks
                                            valueLabelDisplay="auto"
                                        />
                                    </Grid>
                                    <Grid size={{ xs: 12 }}>
                                        <PlacesAutocomplete
                                            value={formData.address}
                                            onChange={(address, lat, lng) =>
                                                dispatch(setFormData({ address, latitude: lat, longitude: lng }))
                                            }
                                        />
                                    </Grid>
                                </Grid>

                                <Card sx={{ mt: 4 }}>
                                    <CardContent>
                                        <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
                                            Order Summary
                                        </Typography>
                                        <Box
                                            sx={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                mb: 1,
                                            }}
                                        >
                                            <Typography color="text.secondary">
                                                {formData.serviceName}
                                            </Typography>
                                            <Typography>£{formData.rate}/hr</Typography>
                                        </Box>
                                        <Box
                                            sx={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                mb: 1,
                                            }}
                                        >
                                            <Typography color="text.secondary">Hours</Typography>
                                            <Typography>{formData.hours}</Typography>
                                        </Box>
                                        <Box
                                            sx={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                pt: 2,
                                                borderTop: '1px solid',
                                                borderColor: 'divider',
                                            }}
                                        >
                                            <Typography variant="h6" fontWeight={600}>
                                                Total
                                            </Typography>
                                            <Typography variant="h6" fontWeight={600} color="primary">
                                                £{(formData.rate * formData.hours).toFixed(2)}
                                            </Typography>
                                        </Box>
                                    </CardContent>
                                </Card>

                                <Button
                                    variant="contained"
                                    size="large"
                                    onClick={handleCreateBooking}
                                    disabled={isCreating}
                                    sx={{ mt: 4, px: 6 }}
                                >
                                    {isCreating ? (
                                        <CircularProgress size={24} color="inherit" />
                                    ) : (
                                        'Proceed to Payment'
                                    )}
                                </Button>
                            </Box>
                        )}
                    </Box>
                )}

                {/* Active Bookings Tab */}
                {activeTab === 1 && (
                    <Box>
                        {isLoadingBookings ? (
                            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                                <CircularProgress />
                            </Box>
                        ) : bookingsData?.active && bookingsData.active.length > 0 ? (
                            <Grid container spacing={3} sx={{ maxWidth: 1200 }}>
                                {bookingsData.active.map((booking) => (
                                    <Grid size={{ xs: 12, sm: 6, lg: 4 }} key={booking._id}>
                                        <BookingCard
                                            booking={booking}
                                            onClick={() =>
                                                navigate(`/user/booking/${booking._id}`)
                                            }
                                        />
                                    </Grid>
                                ))}
                            </Grid>
                        ) : (
                            <Box sx={{ textAlign: 'center', py: 8 }}>
                                <Typography color="text.secondary">
                                    No active bookings at the moment
                                </Typography>
                            </Box>
                        )}
                    </Box>
                )}

                {/* History Tab */}
                {activeTab === 2 && (
                    <Box>
                        {isLoadingBookings ? (
                            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                                <CircularProgress />
                            </Box>
                        ) : bookingsData?.history && bookingsData.history.length > 0 ? (
                            <Grid container spacing={3} sx={{ maxWidth: 1200 }}>
                                {bookingsData.history.map((booking) => (
                                    <Grid size={{ xs: 12, sm: 6, lg: 4 }} key={booking._id}>
                                        <BookingCard
                                            booking={booking}
                                            onClick={() =>
                                                navigate(`/user/booking/${booking._id}`)
                                            }
                                        />
                                    </Grid>
                                ))}
                            </Grid>
                        ) : (
                            <Box sx={{ textAlign: 'center', py: 8 }}>
                                <Typography color="text.secondary">
                                    No booking history yet
                                </Typography>
                            </Box>
                        )}
                    </Box>
                )}
            </Box>
        </LocalizationProvider>
    );
}
