import { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Card,
    CardContent,
    Switch,
    FormControlLabel,
    Checkbox,
    Avatar,
    CircularProgress,
    Alert,
    Chip,
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import {
    CleaningServices as CleaningIcon,
    Hotel as HotelIcon,
    LocalLaundryService as LinenIcon,
    LocationOn,
} from '@mui/icons-material';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { selectCurrentUser, updateUser } from '@/features/auth/authSlice';
import { useUpdateProviderAvailabilityMutation } from '@/features/provider/providerApi';
import { SERVICES } from '@/types';

// Fix for default marker icons in Leaflet
delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const serviceIcons: Record<number, React.ReactNode> = {
    1: <CleaningIcon />,
    2: <HotelIcon />,
    3: <LinenIcon />,
};

export default function ProviderDashboard() {
    const dispatch = useAppDispatch();
    const user = useAppSelector(selectCurrentUser);

    const [isAvailable, setIsAvailable] = useState(user?.isProviderAvailable || false);
    const [selectedJobTypes, setSelectedJobTypes] = useState<number[]>(user?.selectedJobTypes || []);
    const [location, setLocation] = useState<{ lat: number; lng: number } | null>(
        user?.currentLocation
            ? { lat: user.currentLocation.latitude, lng: user.currentLocation.longitude }
            : null
    );
    const [locationError, setLocationError] = useState<string | null>(null);

    const [updateAvailability, { isLoading }] = useUpdateProviderAvailabilityMutation();

    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setLocation({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                    });
                },
                () => {
                    setLocationError('Unable to get your location. Please enable location services.');
                }
            );
        }
    }, []);

    const handleAvailabilityChange = async (available: boolean) => {
        setIsAvailable(available);
        await syncAvailability(available, selectedJobTypes);
    };

    const handleJobTypeChange = async (jobId: number) => {
        const newJobTypes = selectedJobTypes.includes(jobId)
            ? selectedJobTypes.filter((id) => id !== jobId)
            : [...selectedJobTypes, jobId];
        setSelectedJobTypes(newJobTypes);
        await syncAvailability(isAvailable, newJobTypes);
    };

    const syncAvailability = async (available: boolean, jobTypes: number[]) => {
        try {
            await updateAvailability({
                isProviderAvailable: available,
                selectedJobTypes: jobTypes,
                currentLocation: location
                    ? { latitude: location.lat, longitude: location.lng }
                    : undefined,
            }).unwrap();

            dispatch(
                updateUser({
                    isProviderAvailable: available,
                    selectedJobTypes: jobTypes,
                })
            );
        } catch {
            // Revert on error
            setIsAvailable(user?.isProviderAvailable || false);
            setSelectedJobTypes(user?.selectedJobTypes || []);
        }
    };

    return (
        <Box>
            <Typography variant="h4" fontWeight={700} sx={{ mb: 4 }}>
                Provider Dashboard
            </Typography>

            <Grid container spacing={3} sx={{ maxWidth: 1200 }}>
                {/* Profile Card */}
                <Grid size={{ xs: 12, md: 4, lg: 3 }}>
                    <Card>
                        <CardContent sx={{ textAlign: 'center', py: 4 }}>
                            <Avatar
                                src={user?.profile}
                                sx={{
                                    width: 100,
                                    height: 100,
                                    mx: 'auto',
                                    mb: 2,
                                    bgcolor: 'primary.main',
                                    fontSize: '2.5rem',
                                }}
                            >
                                {user?.firstName?.[0]}
                            </Avatar>
                            <Typography variant="h5" fontWeight={600}>
                                {user?.firstName} {user?.lastName}
                            </Typography>
                            <Typography color="text.secondary" sx={{ mb: 2 }}>
                                {user?.email}
                            </Typography>
                            {user?.rating && (
                                <Chip
                                    label={`⭐ ${user.rating.toFixed(1)} Rating`}
                                    color="primary"
                                    variant="outlined"
                                />
                            )}
                        </CardContent>
                    </Card>
                </Grid>

                {/* Availability Card */}
                <Grid size={{ xs: 12, md: 8, lg: 9 }}>
                    <Card sx={{ mb: 3 }}>
                        <CardContent>
                            <Box
                                sx={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    mb: 3,
                                }}
                            >
                                <Typography variant="h6" fontWeight={600}>
                                    Availability
                                </Typography>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={isAvailable}
                                            onChange={(e) => handleAvailabilityChange(e.target.checked)}
                                            disabled={isLoading}
                                            color="success"
                                        />
                                    }
                                    label={isAvailable ? 'Online' : 'Offline'}
                                />
                            </Box>

                            {isLoading && (
                                <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                                    <CircularProgress size={24} />
                                </Box>
                            )}

                            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2 }}>
                                Select the services you want to provide:
                            </Typography>

                            <Grid container spacing={2}>
                                {SERVICES.map((service) => (
                                    <Grid size={{ xs: 12, sm: 4 }} key={service.id}>
                                        <Card
                                            variant="outlined"
                                            sx={{
                                                cursor: 'pointer',
                                                borderColor: selectedJobTypes.includes(service.id)
                                                    ? 'primary.main'
                                                    : 'divider',
                                                borderWidth: selectedJobTypes.includes(service.id)
                                                    ? 2
                                                    : 1,
                                                transition: 'all 0.2s',
                                                '&:hover': {
                                                    borderColor: 'primary.main',
                                                },
                                            }}
                                            onClick={() => handleJobTypeChange(service.id)}
                                        >
                                            <CardContent sx={{ textAlign: 'center', py: 2 }}>
                                                <Checkbox
                                                    checked={selectedJobTypes.includes(service.id)}
                                                    sx={{ mb: 1 }}
                                                />
                                                <Box
                                                    sx={{
                                                        color: selectedJobTypes.includes(service.id)
                                                            ? 'primary.main'
                                                            : 'text.secondary',
                                                        mb: 1,
                                                    }}
                                                >
                                                    {serviceIcons[service.id]}
                                                </Box>
                                                <Typography
                                                    variant="body2"
                                                    fontWeight={500}
                                                    sx={{
                                                        color: selectedJobTypes.includes(service.id)
                                                            ? 'primary.main'
                                                            : 'text.primary',
                                                    }}
                                                >
                                                    {service.name}
                                                </Typography>
                                            </CardContent>
                                        </Card>
                                    </Grid>
                                ))}
                            </Grid>
                        </CardContent>
                    </Card>

                    {/* Location Map */}
                    <Card>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                <LocationOn color="primary" />
                                <Typography variant="h6" fontWeight={600}>
                                    Your Location
                                </Typography>
                            </Box>

                            {locationError && (
                                <Alert severity="warning" sx={{ mb: 2 }}>
                                    {locationError}
                                </Alert>
                            )}

                            <Box
                                sx={{
                                    height: 300,
                                    borderRadius: 2,
                                    overflow: 'hidden',
                                    bgcolor: 'grey.100',
                                }}
                            >
                                {location ? (
                                    <MapContainer
                                        center={[location.lat, location.lng]}
                                        zoom={15}
                                        style={{ height: '100%', width: '100%' }}
                                    >
                                        <TileLayer
                                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                        />
                                        <Marker position={[location.lat, location.lng]}>
                                            <Popup>Your current location</Popup>
                                        </Marker>
                                    </MapContainer>
                                ) : (
                                    <Box
                                        sx={{
                                            height: '100%',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                        }}
                                    >
                                        <CircularProgress />
                                    </Box>
                                )}
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );
}
