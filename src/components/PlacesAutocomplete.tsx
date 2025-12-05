import { useRef, useEffect, useState } from 'react';
import { TextField, CircularProgress, InputAdornment } from '@mui/material';
import { LocationOn } from '@mui/icons-material';
import { useLoadScript, Autocomplete } from '@react-google-maps/api';

const libraries: ('places')[] = ['places'];

interface PlacesAutocompleteProps {
    value: string;
    onChange: (address: string, lat: number, lng: number) => void;
    placeholder?: string;
    label?: string;
    error?: boolean;
    helperText?: string;
}

export default function PlacesAutocomplete({
    value,
    onChange,
    placeholder = 'Enter the service location',
    label = 'Address',
    error,
    helperText,
}: PlacesAutocompleteProps) {
    const [inputValue, setInputValue] = useState(value);
    const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

    const { isLoaded, loadError } = useLoadScript({
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
        libraries,
    });

    useEffect(() => {
        setInputValue(value);
    }, [value]);

    const onLoad = (autocomplete: google.maps.places.Autocomplete) => {
        autocompleteRef.current = autocomplete;
    };

    const onPlaceChanged = () => {
        if (autocompleteRef.current) {
            const place = autocompleteRef.current.getPlace();
            if (place.geometry?.location) {
                const address = place.formatted_address || '';
                const lat = place.geometry.location.lat();
                const lng = place.geometry.location.lng();
                setInputValue(address);
                onChange(address, lat, lng);
            }
        }
    };

    if (loadError) {
        return (
            <TextField
                fullWidth
                label={label}
                value={inputValue}
                onChange={(e) => {
                    setInputValue(e.target.value);
                    onChange(e.target.value, 0, 0);
                }}
                placeholder={placeholder}
                error={error}
                helperText={helperText || 'Maps failed to load. Enter address manually.'}
                InputProps={{
                    startAdornment: (
                        <InputAdornment position="start">
                            <LocationOn color="action" />
                        </InputAdornment>
                    ),
                }}
            />
        );
    }

    if (!isLoaded) {
        return (
            <TextField
                fullWidth
                label={label}
                disabled
                placeholder="Loading..."
                InputProps={{
                    startAdornment: (
                        <InputAdornment position="start">
                            <CircularProgress size={20} />
                        </InputAdornment>
                    ),
                }}
            />
        );
    }

    return (
        <Autocomplete
            onLoad={onLoad}
            onPlaceChanged={onPlaceChanged}
            options={{
                componentRestrictions: { country: 'gb' },
                types: ['address'],
            }}
        >
            <TextField
                fullWidth
                label={label}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={placeholder}
                error={error}
                helperText={helperText}
                InputProps={{
                    startAdornment: (
                        <InputAdornment position="start">
                            <LocationOn color="action" />
                        </InputAdornment>
                    ),
                }}
            />
        </Autocomplete>
    );
}
