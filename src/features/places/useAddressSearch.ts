import { useCallback, useEffect, useRef, useState } from 'react';
import {
    localeHints,
    placesFailure,
    useAutocompletePlacesMutation,
    type LatLng,
    type PlaceSuggestion,
    type PlacesFailure,
} from './placesApi';

const DEBOUNCE_MS = 275;
const MIN_CHARS = 2;

export type SearchStatus = 'idle' | 'waiting' | 'loading' | 'done' | 'error';

/** Kinds of failure after which search stops for this screen and the map pin takes over. */
const FALL_BACK: PlacesFailure[] = ['not_configured', 'unavailable', 'rate_limited', 'timeout'];

/**
 * Debounced autocomplete through the API with Google session tokens (contract sections 2 and 3): one token from
 * focus until a pick (or until the field is left), the previous request aborted, stale answers ignored.
 */
export function useAddressSearch({
    near,
    enabled,
    onUnavailable,
}: {
    near: LatLng | null;
    enabled: boolean;
    onUnavailable: (kind: PlacesFailure, message?: string) => void;
}) {
    const [trigger] = useAutocompletePlacesMutation();
    const [input, setInput] = useState('');
    const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([]);
    const [status, setStatus] = useState<SearchStatus>('idle');
    const [error, setError] = useState<string | null>(null);

    const token = useRef<string | null>(null);
    const latest = useRef('');
    const inflight = useRef<{ abort: () => void } | null>(null);
    const nearRef = useRef(near);
    nearRef.current = near;
    const unavailableRef = useRef(onUnavailable);
    unavailableRef.current = onUnavailable;

    const startSession = useCallback(() => {
        if (!token.current) token.current = crypto.randomUUID();
    }, []);
    /** Hands the token to the details call; the next search starts a new session. */
    const takeToken = useCallback(() => {
        const t = token.current ?? crypto.randomUUID();
        token.current = null;
        return t;
    }, []);
    const endSession = useCallback(() => {
        token.current = null;
    }, []);

    const run = useCallback(
        async (query: string, retried = false) => {
            inflight.current?.abort();
            startSession();
            setStatus('loading');
            const p = nearRef.current;
            const req = trigger({
                input: query,
                sessionToken: token.current!,
                near: p ? { ...p, radiusMeters: 20000 } : undefined,
                ...localeHints(),
            });
            inflight.current = req;
            try {
                const res = await req.unwrap();
                if (latest.current !== query) return;
                setSuggestions(res.suggestions);
                setError(null);
                setStatus('done');
            } catch (err) {
                const failure = placesFailure(err);
                if (failure.kind === 'aborted' || latest.current !== query) return;
                if (failure.kind === 'timeout' && !retried) return run(query, true);
                setSuggestions([]);
                setStatus('error');
                if (FALL_BACK.includes(failure.kind)) {
                    setError(null);
                    unavailableRef.current(failure.kind, failure.message);
                } else if (failure.kind === 'invalid') {
                    console.warn('Address search request was rejected', failure.message);
                    setError('Search could not run. Place the pin on the map instead.');
                } else {
                    setError(
                        'Search failed. Check your connection and try again, or place the pin on the map.'
                    );
                }
            } finally {
                if (inflight.current === req) inflight.current = null;
            }
        },
        [trigger, startSession]
    );

    useEffect(() => {
        const query = input.trim();
        latest.current = query;
        if (!enabled || query.length < MIN_CHARS) {
            inflight.current?.abort();
            setSuggestions([]);
            setStatus('idle');
            setError(null);
            return;
        }
        setStatus('waiting');
        const timer = window.setTimeout(() => run(query), DEBOUNCE_MS);
        return () => window.clearTimeout(timer);
    }, [input, enabled, run]);

    useEffect(() => () => inflight.current?.abort(), []);

    return {
        input,
        setInput,
        suggestions,
        status,
        error,
        ready: input.trim().length >= MIN_CHARS,
        startSession,
        endSession,
        takeToken,
    };
}
