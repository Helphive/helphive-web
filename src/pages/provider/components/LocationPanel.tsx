import { Alert, Box, Skeleton } from '@mui/material';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { EmptyState, ErrorBoundary, ErrorState, Panel } from '@/components/ui';
import { radius } from '@/theme/tokens';
import type { Coordinates } from '../useProviderLocation';
import { LocationOffIcon } from '@/components/ui/icons';

// Fix for default marker icons in Leaflet
delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const MAP_HEIGHT = 280;

interface LocationPanelProps {
    location: Coordinates | null;
    error: string | null;
}

/** The provider's position on a map. A map failure shows an error here instead of breaking the page. */
export default function LocationPanel({ location, error }: LocationPanelProps) {
    const hasLocation = !!location && !!location.lat && !!location.lng;

    return (
        <Panel title="Your location" subtitle="Used to show you orders near you">
            {error && (
                <Alert severity="warning" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}
            <Box
                sx={{
                    height: MAP_HEIGHT,
                    borderRadius: `${radius.sm}px`,
                    overflow: 'hidden',
                    isolation: 'isolate',
                    bgcolor: 'background.default',
                }}
            >
                {hasLocation ? (
                    <ErrorBoundary
                        resetKey={`${location.lat}-${location.lng}`}
                        fallback={(reset) => (
                            <ErrorState
                                bare
                                title="The map could not load"
                                message="Your availability still works. Try loading the map again."
                                onRetry={reset}
                            />
                        )}
                    >
                        <MapContainer
                            key={`${location.lat}-${location.lng}`}
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
                    </ErrorBoundary>
                ) : error ? (
                    <EmptyState
                        bare
                        icon={<LocationOffIcon />}
                        title="Location unavailable"
                        description="Allow location access in your browser settings to see your position here."
                        sx={{ py: 4 }}
                    />
                ) : (
                    <Skeleton variant="rectangular" height="100%" aria-label="Loading map" />
                )}
            </Box>
        </Panel>
    );
}
