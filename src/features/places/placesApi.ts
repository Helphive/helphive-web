// Address lookup through the API (contract: scratch/address/address-contract.md). The browser never calls
// Google for addresses; it only loads Maps JavaScript to draw the map.
import { apiSlice } from '@/store/api/apiSlice';

export type PlaceKind = 'establishment' | 'address' | 'area';
export type LocationSource = 'search' | 'map' | 'current_location';

export interface LatLng {
    latitude: number;
    longitude: number;
}

export interface PlaceSuggestion {
    placeId: string;
    primaryText: string;
    secondaryText: string | null;
    fullText: string;
    kind: PlaceKind;
    types: string[];
    distanceMeters: number | null;
}

export interface PlaceResult {
    placeId: string;
    name?: string | null;
    formattedAddress: string;
    location: LatLng;
    kind: PlaceKind;
    types: string[];
}

interface AutocompleteRequest {
    input: string;
    sessionToken: string;
    near?: LatLng & { radiusMeters?: number };
    languageCode?: string;
    regionCode?: string;
}

export const placesApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getPlacesStatus: builder.query<{ configured: boolean; attribution: string }, void>({
            query: () => '/auth/places/status',
        }),
        autocompletePlaces: builder.mutation<
            { suggestions: PlaceSuggestion[]; attribution: string },
            AutocompleteRequest
        >({
            query: (body) => ({ url: '/auth/places/autocomplete', method: 'POST', body }),
        }),
        getPlaceDetails: builder.mutation<
            { place: PlaceResult },
            { placeId: string; sessionToken: string; languageCode?: string }
        >({
            query: (body) => ({ url: '/auth/places/details', method: 'POST', body }),
        }),
        reverseGeocode: builder.mutation<
            { best: PlaceResult | null; results: PlaceResult[] },
            LatLng & { languageCode?: string }
        >({
            query: (body) => ({ url: '/auth/places/reverse-geocode', method: 'POST', body }),
        }),
    }),
});

export const {
    useGetPlacesStatusQuery,
    useAutocompletePlacesMutation,
    useGetPlaceDetailsMutation,
    useReverseGeocodeMutation,
} = placesApi;

/** The browser's language and Google's region form of its country ("gb" is "uk"). */
export function localeHints(): { languageCode?: string; regionCode?: string } {
    const lang = typeof navigator !== 'undefined' ? navigator.language : '';
    if (!/^[a-z]{2,3}(-[A-Za-z0-9]{2,8})*$/.test(lang)) return {};
    const region = lang.split('-')[1]?.toLowerCase();
    return {
        languageCode: lang,
        regionCode:
            region && /^[a-z]{2}$/.test(region) ? (region === 'gb' ? 'uk' : region) : undefined,
    };
}

export type PlacesFailure =
    | 'aborted'
    | 'invalid'
    | 'not_found'
    | 'rate_limited'
    | 'unavailable'
    | 'not_configured'
    | 'timeout'
    | 'other';

/** Sorts an RTK Query error from the places endpoints into what the picker does next (contract section 4). */
export function placesFailure(err: unknown): { kind: PlacesFailure; message?: string } {
    const e = err as {
        name?: string;
        status?: number | string;
        data?: { code?: string; message?: string };
    };
    if (e?.name === 'AbortError') return { kind: 'aborted' };
    const message = typeof e?.data?.message === 'string' ? e.data.message : undefined;
    switch (e?.data?.code) {
        case 'places_invalid_request':
            return { kind: 'invalid', message };
        case 'places_not_found':
            return { kind: 'not_found', message };
        case 'places_unavailable':
            return { kind: 'unavailable', message };
        case 'places_not_configured':
            return { kind: 'not_configured', message };
        case 'places_timeout':
            return { kind: 'timeout', message };
    }
    if (e?.status === 429) return { kind: 'rate_limited', message };
    // A server without the endpoints (404 before the deploy) behaves like one with search switched off.
    if (e?.status === 404) return { kind: 'not_configured' };
    return { kind: 'other', message };
}
