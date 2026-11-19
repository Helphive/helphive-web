// Choosing a booking's location: search (through the API), a map with a draggable pin, the current location,
// and the customer's own address text. Contract and behaviour: scratch/address/address-contract.md.
import { lazy, Suspense, useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import {
    Alert,
    Autocomplete,
    Box,
    Button,
    CircularProgress,
    FormHelperText,
    Paper,
    Skeleton,
    Stack,
    TextField,
    Typography,
    type PaperProps,
} from '@mui/material';
import { srOnly } from '@/components/ui';
import {
    CurrentLocationIcon,
    EditIcon,
    LocationIcon,
    MapIcon,
    VenueIcon,
} from '@/components/ui/icons';
import { color, font, hairline, radius } from '@/theme/tokens';
import {
    localeHints,
    placesFailure,
    useGetPlaceDetailsMutation,
    useGetPlacesStatusQuery,
    useReverseGeocodeMutation,
    type LatLng,
    type LocationSource,
    type PlaceSuggestion,
    type PlacesFailure,
} from '@/features/places/placesApi';
import {
    baseText,
    displayText,
    fromPlace,
    googleText,
    type PickedLocation,
} from '@/features/places/pickedLocation';
import { useAddressSearch } from '@/features/places/useAddressSearch';

const LocationMap = lazy(() => import('./LocationMap'));

// Central London, used only when there is no pin and no earlier booking to start from.
const DEFAULT_CENTER: LatLng = { latitude: 51.5072, longitude: -0.1276 };
const MAP_HEIGHT = { xs: 240, sm: 300 };

const KIND_ICON = { establishment: VenueIcon, address: LocationIcon, area: MapIcon } as const;

const formatDistance = (m: number | null) =>
    !m || m <= 0
        ? null
        : m < 1000
          ? `${Math.round(m)} m`
          : `${(m / 1000).toFixed(m < 10000 ? 1 : 0)} km`;

const FALLBACK_TEXT: Partial<Record<PlacesFailure, string>> = {
    rate_limited: 'Too many searches in a short time.',
};

function SuggestionPaper({ children, ...props }: PaperProps) {
    return (
        <Paper {...props}>
            {children}
            <Typography
                variant="caption"
                component="p"
                sx={{ px: 2, py: 1, borderTop: hairline, textAlign: 'right' }}
            >
                Google Maps
            </Typography>
        </Paper>
    );
}

function SmallLine({ children, tone }: { children: ReactNode; tone?: 'muted' | 'green' }) {
    return (
        <Typography
            variant="caption"
            component="p"
            sx={{ color: tone === 'green' ? color.green700 : color.ink500, mt: 0.5 }}
        >
            {children}
        </Typography>
    );
}

export interface LocationPickerProps {
    value: PickedLocation | null;
    onChange: (location: PickedLocation | null) => void;
    /** Validation message from the form. */
    error?: string;
    /** Where the map opens when there is no pin (for example the last booking's location). */
    startPoint?: LatLng | null;
}

export default function LocationPicker({
    value,
    onChange,
    error,
    startPoint,
}: LocationPickerProps) {
    const valueRef = useRef(value);
    valueRef.current = value;

    const [fallback, setFallback] = useState<string | null>(null);
    const [mapOpen, setMapOpen] = useState(false);
    const [mapFailed, setMapFailed] = useState(false);
    const [editing, setEditing] = useState(false);
    const [pinBusy, setPinBusy] = useState(false);
    const [picking, setPicking] = useState(false);
    const [notice, setNotice] = useState<string | null>(null);
    const [proposal, setProposal] = useState<string | null>(null);
    const [searchError, setSearchError] = useState<string | null>(null);
    const [geoBusy, setGeoBusy] = useState(false);
    const [geoError, setGeoError] = useState<string | null>(null);
    const [listOpen, setListOpen] = useState(false);

    const status = useGetPlacesStatusQuery();
    const [details] = useGetPlaceDetailsMutation();
    const [reverse] = useReverseGeocodeMutation();

    const goFallback = useCallback((kind: PlacesFailure) => {
        setFallback(
            `${FALLBACK_TEXT[kind] ?? 'Address search is not available right now.'} Place the pin on the map, then type the address.`
        );
        setMapOpen(true);
        setListOpen(false);
    }, []);

    useEffect(() => {
        if (status.data && !status.data.configured) goFallback('not_configured');
        else if (status.error && placesFailure(status.error).kind === 'not_configured') {
            goFallback('not_configured');
        }
    }, [status.data, status.error, goFallback]);

    const pin = value ? { latitude: value.latitude, longitude: value.longitude } : null;
    const search = useAddressSearch({
        near: pin ?? startPoint ?? null,
        enabled: !fallback,
        onUnavailable: goFallback,
    });

    // --- The pin ---------------------------------------------------------------------------------------------
    const reverseSeq = useRef(0);

    const lookUpPin = useCallback(
        async (point: LatLng) => {
            const seq = ++reverseSeq.current;
            setPinBusy(true);
            setNotice(null);
            setProposal(null);
            try {
                const { best } = await reverse({
                    ...point,
                    languageCode: localeHints().languageCode,
                }).unwrap();
                const cur = valueRef.current;
                if (seq !== reverseSeq.current || !cur) return;
                const next: PickedLocation = {
                    ...cur,
                    placeId: best?.placeId ?? null,
                    formattedAddress: best?.formattedAddress ?? null,
                    placeName: null,
                };
                onChange(next);
                if (!best) {
                    setNotice('No address is known for this spot. Type the address below.');
                    if (!baseText(next)) setEditing(true);
                } else if (cur.customText !== null) {
                    // Never overwrite the customer's own text; offer Google's instead.
                    setProposal(best.formattedAddress);
                } else {
                    setNotice('Address updated to match the pin.');
                }
            } catch (err) {
                if (seq !== reverseSeq.current || placesFailure(err).kind === 'aborted') return;
                const cur = valueRef.current;
                if (cur) onChange({ ...cur, placeId: null });
                setNotice(
                    'Could not look up the address for this spot. Check the text, or type the address.'
                );
                if (cur && !baseText(cur)) setEditing(true);
            } finally {
                if (seq === reverseSeq.current) setPinBusy(false);
            }
        },
        [onChange, reverse]
    );

    /** Puts the pin at a point. A fresh pick starts over; moving an existing pin keeps the customer's text. */
    const placePin = useCallback(
        (point: LatLng, source: LocationSource, fresh: boolean) => {
            const cur = valueRef.current;
            const next: PickedLocation =
                cur && !fresh
                    ? { ...cur, ...point, source }
                    : {
                          source,
                          ...point,
                          placeId: null,
                          formattedAddress: null,
                          placeName: null,
                          customText: null,
                          details: cur?.details ?? '',
                      };
            valueRef.current = next;
            onChange(next);
            setMapOpen(true);
            lookUpPin(point);
        },
        [onChange, lookUpPin]
    );

    const onMapPin = useCallback((point: LatLng) => placePin(point, 'map', false), [placePin]);
    const onMapFailed = useCallback(() => setMapFailed(true), []);

    // --- Search ----------------------------------------------------------------------------------------------
    const pick = async (s: PlaceSuggestion) => {
        const sessionToken = search.takeToken();
        setPicking(true);
        setSearchError(null);
        setListOpen(false);
        try {
            const { place } = await details({
                placeId: s.placeId,
                sessionToken,
                languageCode: localeHints().languageCode,
            }).unwrap();
            reverseSeq.current++; // a pending pin lookup no longer applies
            setPinBusy(false);
            setProposal(null);
            setNotice(null);
            setEditing(false);
            onChange(
                fromPlace(place, 'search', { customText: null, details: value?.details ?? '' })
            );
            setMapOpen(true);
            search.setInput('');
        } catch (err) {
            const failure = placesFailure(err);
            if (failure.kind === 'not_found') {
                setSearchError('That place is no longer listed. Search again.');
            } else if (
                ['not_configured', 'unavailable', 'rate_limited', 'timeout'].includes(failure.kind)
            ) {
                goFallback(failure.kind);
            } else {
                setSearchError(
                    'Could not open that place. Try again, or place the pin on the map.'
                );
            }
        } finally {
            setPicking(false);
        }
    };

    // --- Current location --------------------------------------------------------------------------------------
    const useCurrentLocation = () => {
        setGeoError(null);
        if (!('geolocation' in navigator)) {
            setGeoError('This browser cannot share your location. Search for the address instead.');
            return;
        }
        setGeoBusy(true);
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                setGeoBusy(false);
                placePin(
                    { latitude: pos.coords.latitude, longitude: pos.coords.longitude },
                    'current_location',
                    true
                );
            },
            (err) => {
                setGeoBusy(false);
                setGeoError(
                    err.code === err.PERMISSION_DENIED
                        ? 'Location access is blocked for this site. Allow it from the icon in the address bar, or search for the address.'
                        : 'Could not find your location. Search for the address, or place the pin on the map.'
                );
            },
            { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 }
        );
    };

    // --- Rendering -------------------------------------------------------------------------------------------
    const searching = search.status === 'waiting' || search.status === 'loading';
    const showMap = mapOpen || !!value || !!fallback;
    const google = value ? googleText(value) : '';
    const custom = !!value && value.customText !== null && !!google;
    const shown = displayText(value);
    const resultsText =
        search.status === 'done'
            ? search.suggestions.length
                ? `${search.suggestions.length} ${search.suggestions.length === 1 ? 'place' : 'places'} found`
                : 'No places found'
            : search.status === 'loading'
              ? 'Searching'
              : '';

    return (
        <Stack spacing={2}>
            {fallback ? (
                <Alert severity="info">{fallback}</Alert>
            ) : (
                <Box>
                    <Autocomplete<PlaceSuggestion, false, false, false>
                        options={search.suggestions}
                        filterOptions={(x) => x}
                        getOptionLabel={(o) => o.fullText}
                        isOptionEqualToValue={(a, b) => a.placeId === b.placeId}
                        value={null}
                        inputValue={search.input}
                        onInputChange={(_, v, reason) => {
                            if (reason === 'input' || reason === 'clear') {
                                search.setInput(v);
                                setSearchError(null);
                                setListOpen(true);
                            }
                        }}
                        onChange={(_, s) => s && pick(s)}
                        open={listOpen && search.ready}
                        onOpen={() => setListOpen(true)}
                        onClose={() => setListOpen(false)}
                        onFocus={search.startSession}
                        onBlur={() => {
                            if (!picking) search.endSession();
                        }}
                        autoHighlight
                        blurOnSelect
                        disabled={picking}
                        loading={searching && search.suggestions.length === 0}
                        loadingText="Searching for places"
                        noOptionsText={
                            search.status === 'error'
                                ? search.error
                                : `No places match “${search.input.trim()}”. Check the spelling, try the venue's name or postcode, or choose the spot on the map.`
                        }
                        PaperComponent={SuggestionPaper}
                        renderOption={(props, o) => {
                            const { key, ...rest } = props as typeof props & { key: string };
                            const Icon = KIND_ICON[o.kind] ?? LocationIcon;
                            const distance = formatDistance(o.distanceMeters);
                            return (
                                <Box
                                    component="li"
                                    key={key}
                                    {...rest}
                                    sx={{
                                        gap: 1.5,
                                        alignItems: 'flex-start !important',
                                        py: '10px !important',
                                    }}
                                >
                                    <Icon sx={{ color: color.ink500, mt: '2px' }} />
                                    <Box sx={{ minWidth: 0, flex: 1 }}>
                                        <Typography variant="body2" sx={{ fontWeight: 700 }}>
                                            {o.primaryText}
                                        </Typography>
                                        {o.secondaryText && (
                                            <Typography variant="caption" component="p">
                                                {o.secondaryText}
                                            </Typography>
                                        )}
                                    </Box>
                                    {distance && (
                                        <Typography variant="caption" sx={{ whiteSpace: 'nowrap' }}>
                                            {distance}
                                        </Typography>
                                    )}
                                </Box>
                            );
                        }}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                label={
                                    value
                                        ? 'Search for a different place'
                                        : 'Hotel, venue or address'
                                }
                                placeholder="For example: The Savoy, London"
                                error={!!(searchError || search.error) || (!value && !!error)}
                                helperText={
                                    searchError ?? search.error ?? (!value ? error : undefined)
                                }
                                InputProps={{
                                    ...params.InputProps,
                                    startAdornment: (
                                        <LocationIcon sx={{ color: color.ink500, ml: 0.5 }} />
                                    ),
                                    endAdornment: (
                                        <>
                                            {(searching || picking) && (
                                                <Box
                                                    sx={{
                                                        position: 'absolute',
                                                        right: 44,
                                                        top: '50%',
                                                        mt: '-9px',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: 1,
                                                        color: color.ink500,
                                                        fontSize: font.size.sm,
                                                        fontWeight: 600,
                                                        pointerEvents: 'none',
                                                    }}
                                                >
                                                    <CircularProgress size={16} color="inherit" />
                                                    <span>{picking ? 'Opening' : 'Searching'}</span>
                                                </Box>
                                            )}
                                            {params.InputProps.endAdornment}
                                        </>
                                    ),
                                }}
                            />
                        )}
                    />
                    <Box
                        role="status"
                        aria-live="polite"
                        sx={{ ...srOnly, width: '1px', height: '1px' }}
                    >
                        {resultsText}
                    </Box>
                </Box>
            )}

            <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 1 }}>
                <Button
                    variant="outlined"
                    size="small"
                    onClick={useCurrentLocation}
                    disabled={geoBusy}
                    startIcon={
                        geoBusy ? (
                            <CircularProgress size={16} color="inherit" />
                        ) : (
                            <CurrentLocationIcon />
                        )
                    }
                >
                    {geoBusy ? 'Finding your location' : 'Use my current location'}
                </Button>
                {!showMap && !mapFailed && (
                    <Button
                        variant="outlined"
                        size="small"
                        onClick={() => setMapOpen(true)}
                        startIcon={<MapIcon />}
                    >
                        Choose on map
                    </Button>
                )}
            </Stack>
            {geoError && (
                <Alert severity="warning" onClose={() => setGeoError(null)}>
                    {geoError}
                </Alert>
            )}

            {showMap && (
                <Box
                    sx={{
                        height: mapFailed ? 'auto' : MAP_HEIGHT,
                        border: hairline,
                        borderRadius: `${radius.md}px`,
                        overflow: 'hidden',
                        bgcolor: color.subtle,
                    }}
                >
                    <Suspense
                        fallback={
                            <Skeleton
                                variant="rectangular"
                                sx={{ height: '100%' }}
                                aria-label="Loading the map"
                            />
                        }
                    >
                        <LocationMap
                            pin={pin}
                            center={startPoint ?? DEFAULT_CENTER}
                            busy={pinBusy}
                            onPinChange={onMapPin}
                            onLoadFailed={onMapFailed}
                        />
                    </Suspense>
                </Box>
            )}

            {value && (
                <Box sx={{ border: hairline, borderRadius: `${radius.md}px` }}>
                    <Box sx={{ p: 2 }}>
                        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'flex-start' }}>
                            <LocationIcon sx={{ color: color.coral600, mt: '2px' }} />
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                                <Typography variant="caption" component="p" id="picker-shown-label">
                                    Address your provider will see
                                </Typography>
                                {editing || (!google && !pinBusy) ? (
                                    <TextField
                                        autoFocus={editing}
                                        fullWidth
                                        multiline
                                        minRows={1}
                                        maxRows={4}
                                        value={baseText(value)}
                                        onChange={(e) => {
                                            const text = e.target.value;
                                            setProposal(null);
                                            setNotice(null);
                                            onChange({
                                                ...value,
                                                customText: text === google ? null : text,
                                            });
                                        }}
                                        inputProps={{
                                            maxLength: 400,
                                            'aria-labelledby': 'picker-shown-label',
                                        }}
                                        placeholder="Type the full address"
                                        helperText="Changing the text does not move the pin."
                                        sx={{ mt: 0.75 }}
                                    />
                                ) : pinBusy && !custom ? (
                                    <Skeleton width="80%" sx={{ fontSize: font.size.md }} />
                                ) : (
                                    <Typography
                                        variant="body2"
                                        sx={{ fontWeight: 700, overflowWrap: 'anywhere' }}
                                    >
                                        {shown}
                                    </Typography>
                                )}
                                {custom ? (
                                    <SmallLine>Your own text. The pin is at {google}.</SmallLine>
                                ) : google && !editing ? (
                                    <SmallLine>
                                        {value.source === 'search'
                                            ? 'From search. Drag the pin if the entrance is elsewhere.'
                                            : 'Matches the pin on the map.'}
                                    </SmallLine>
                                ) : null}
                            </Box>
                        </Stack>
                        <Stack
                            direction="row"
                            sx={{ gap: 1, mt: 1.5, ml: { sm: 4 }, flexWrap: 'wrap' }}
                        >
                            {google && (
                                <Button
                                    size="small"
                                    variant={editing ? 'contained' : 'outlined'}
                                    color={editing ? 'secondary' : undefined}
                                    startIcon={editing ? undefined : <EditIcon />}
                                    onClick={() => setEditing((v) => !v)}
                                >
                                    {editing ? 'Done' : 'Edit address'}
                                </Button>
                            )}
                            {custom && (
                                <Button
                                    size="small"
                                    variant="text"
                                    onClick={() => {
                                        onChange({ ...value, customText: null });
                                        setProposal(null);
                                        setEditing(false);
                                    }}
                                >
                                    Use the pin's address
                                </Button>
                            )}
                        </Stack>
                    </Box>

                    {(proposal || notice) && (
                        <Box sx={{ px: 2, pb: 2 }} role="status" aria-live="polite">
                            {proposal ? (
                                <Alert
                                    severity="info"
                                    action={
                                        <Stack direction="row" spacing={0.5}>
                                            <Button
                                                size="small"
                                                color="inherit"
                                                onClick={() => {
                                                    onChange({ ...value, customText: null });
                                                    setProposal(null);
                                                }}
                                            >
                                                Use it
                                            </Button>
                                            <Button
                                                size="small"
                                                color="inherit"
                                                onClick={() => setProposal(null)}
                                            >
                                                Keep mine
                                            </Button>
                                        </Stack>
                                    }
                                    sx={{ '& .MuiAlert-action': { alignItems: 'center' } }}
                                >
                                    The pin moved. Google's address here is {proposal}. Use it
                                    instead of your text?
                                </Alert>
                            ) : (
                                <SmallLine
                                    tone={notice?.startsWith('Address updated') ? 'green' : 'muted'}
                                >
                                    {notice}
                                </SmallLine>
                            )}
                        </Box>
                    )}

                    <Box sx={{ borderTop: hairline, p: 2, bgcolor: color.subtle }}>
                        <TextField
                            fullWidth
                            label="Entrance, floor or room (optional)"
                            placeholder="For example: staff entrance on Savoy Court, 2nd floor"
                            value={value.details}
                            onChange={(e) => onChange({ ...value, details: e.target.value })}
                            inputProps={{ maxLength: 90 }}
                        />
                    </Box>
                </Box>
            )}

            {error && (value || fallback) && (
                <FormHelperText error sx={{ mx: 0 }}>
                    {error}
                </FormHelperText>
            )}
        </Stack>
    );
}
