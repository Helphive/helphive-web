// The Google map with the booking's pin. Loaded lazily (LocationPicker imports it with React.lazy), so the Maps
// JavaScript API is only fetched once a customer opens the map. Maps only: no Places library.
import { useEffect, useMemo, useRef, useState } from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import { GoogleMap, MarkerF, useJsApiLoader } from '@react-google-maps/api';
import { color, hairline, palettes, radius, shadow, type Scheme } from '@/theme/tokens';
import { useColorScheme } from '@/theme/colorScheme';
import type { LatLng } from '@/features/places/placesApi';

export interface LocationMapProps {
    pin: LatLng | null;
    /** Where the map opens when there is no pin yet. */
    center: LatLng;
    busy: boolean;
    onPinChange: (point: LatLng) => void;
    onLoadFailed: () => void;
}

// The pin is a data-URL image, so it needs real colours (CSS variables do not reach inside it).
const pinSvg = (scheme: Scheme) =>
    `<svg xmlns="http://www.w3.org/2000/svg" width="36" height="46" viewBox="0 0 36 46"><path d="M18 1C8.6 1 1 8.5 1 17.8 1 30.4 18 45 18 45s17-14.6 17-27.2C35 8.5 27.4 1 18 1z" fill="${palettes[scheme].brandFill}" stroke="${palettes[scheme].onBrand}" stroke-width="2"/><circle cx="18" cy="17.5" r="6.5" fill="${palettes[scheme].onBrand}"/></svg>`;

const toLiteral = (p: LatLng) => ({ lat: p.latitude, lng: p.longitude });

export default function LocationMap({
    pin,
    center,
    busy,
    onPinChange,
    onLoadFailed,
}: LocationMapProps) {
    const { isLoaded, loadError } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY ?? '',
    });
    const [authFailed, setAuthFailed] = useState(false);
    const mapRef = useRef<google.maps.Map | null>(null);
    const { scheme } = useColorScheme();

    // Google calls this global when the key is refused (wrong referrer, API not enabled); loadError stays empty.
    useEffect(() => {
        const w = window as unknown as { gm_authFailure?: () => void };
        w.gm_authFailure = () => setAuthFailed(true);
        return () => {
            delete w.gm_authFailure;
        };
    }, []);

    const failed = !!loadError || authFailed || !import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    useEffect(() => {
        if (failed) onLoadFailed();
    }, [failed, onLoadFailed]);

    // Follow the pin when it is set from outside the map (a search pick, current location).
    useEffect(() => {
        if (pin && mapRef.current) {
            mapRef.current.panTo(toLiteral(pin));
            if ((mapRef.current.getZoom() ?? 0) < 15) mapRef.current.setZoom(17);
        }
    }, [pin]);

    const icon = useMemo(
        () =>
            isLoaded
                ? {
                      url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(pinSvg(scheme))}`,
                      scaledSize: new google.maps.Size(36, 46),
                      anchor: new google.maps.Point(18, 45),
                  }
                : undefined,
        [isLoaded, scheme]
    );
    // The map opens once at the pin (or the default centre); later moves go through panTo above.
    const [initialCenter] = useState(() => toLiteral(pin ?? center));
    const [initialZoom] = useState(pin ? 17 : 12);

    if (failed) {
        return (
            <Box
                sx={{
                    height: '100%',
                    display: 'grid',
                    placeItems: 'center',
                    p: 3,
                    textAlign: 'center',
                }}
            >
                <Typography variant="body2" color="text.secondary">
                    The map could not load. Search for the address, or use your current location.
                </Typography>
            </Box>
        );
    }
    if (!isLoaded) {
        return (
            <Box sx={{ height: '100%', display: 'grid', placeItems: 'center' }} role="status">
                <CircularProgress size={20} aria-label="Loading the map" />
            </Box>
        );
    }

    const fromEvent = (e: google.maps.MapMouseEvent) => {
        if (e.latLng) onPinChange({ latitude: e.latLng.lat(), longitude: e.latLng.lng() });
    };

    return (
        <Box sx={{ position: 'relative', height: '100%' }}>
            {/* Google's colour scheme is fixed when a map is created, so a scheme switch makes a new map. */}
            <GoogleMap
                key={scheme}
                mapContainerStyle={{ width: '100%', height: '100%' }}
                center={initialCenter}
                zoom={initialZoom}
                onLoad={(map) => {
                    mapRef.current = map;
                    // After a scheme switch the new map opens at the current pin.
                    if (pin) map.setCenter(toLiteral(pin));
                }}
                onUnmount={() => {
                    mapRef.current = null;
                }}
                onClick={fromEvent}
                options={{
                    disableDefaultUI: true,
                    zoomControl: true,
                    clickableIcons: false,
                    gestureHandling: 'cooperative',
                    keyboardShortcuts: true,
                    ...(scheme === 'dark' && { colorScheme: 'DARK' }),
                }}
            >
                {pin && (
                    <MarkerF
                        position={toLiteral(pin)}
                        draggable
                        icon={icon}
                        title="Booking location. Drag to move."
                        onDragEnd={fromEvent}
                    />
                )}
            </GoogleMap>
            {(busy || !pin) && (
                <Box
                    role="status"
                    sx={{
                        position: 'absolute',
                        top: 12,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        px: 1.5,
                        py: 0.75,
                        bgcolor: color.raised,
                        border: hairline,
                        borderRadius: `${radius.md}px`,
                        boxShadow: shadow.float,
                        whiteSpace: 'nowrap',
                        pointerEvents: 'none',
                    }}
                >
                    {busy && <CircularProgress size={14} color="inherit" />}
                    <Typography variant="body2" component="span" sx={{ fontWeight: 600 }}>
                        {busy ? 'Finding the address' : 'Tap the map to drop the pin'}
                    </Typography>
                </Box>
            )}
        </Box>
    );
}
