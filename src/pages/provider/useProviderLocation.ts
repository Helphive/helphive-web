import { useEffect, useState } from 'react';
import type { User } from '@/types';

export interface Coordinates {
    lat: number;
    lng: number;
}

/**
 * Starts from the location saved on the account, then replaces it with the browser's position
 * when the person allows it. `error` is set when the browser could not provide a position.
 */
export function useProviderLocation(user: User | null | undefined) {
    const [location, setLocation] = useState<Coordinates | null>(
        user?.currentLocation
            ? { lat: user.currentLocation.latitude, lng: user.currentLocation.longitude }
            : null
    );
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!navigator.geolocation) return;
        navigator.geolocation.getCurrentPosition(
            (position) => {
                setLocation({ lat: position.coords.latitude, lng: position.coords.longitude });
            },
            () => {
                setError(
                    'Could not get your location. Turn on location services to see orders near you.'
                );
            }
        );
    }, []);

    return { location, error };
}
