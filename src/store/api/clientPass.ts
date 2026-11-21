// Client attestation: trade a reCAPTCHA Enterprise token for a short-lived "client pass" that the API
// expects in X-Client-Pass. Every failure resolves to null: a missing pass must never block a request.

export const API_URL =
    import.meta.env.VITE_API_URL ||
    (import.meta.env.DEV ? 'http://localhost:8080' : 'https://api.helphive.himaiz.com');

// A random id made once and kept in localStorage, sent as X-Device-Id. Undefined when storage is unavailable.
export const getDeviceId = (): string | undefined => {
    try {
        let id = localStorage.getItem('deviceId');
        if (!id) {
            id = crypto.randomUUID();
            localStorage.setItem('deviceId', id);
        }
        return id;
    } catch {
        return undefined;
    }
};

interface Grecaptcha {
    enterprise: {
        ready: (cb: () => void) => void;
        execute: (siteKey: string, opts: { action: string }) => Promise<string>;
    };
}
declare global {
    interface Window {
        grecaptcha?: Grecaptcha;
    }
}

interface Pass {
    pass: string;
    expiresAt: number;
    deviceId: string;
}

const SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY ?? '';
const CACHE_KEY = 'clientPass';
const REFRESH_BEFORE_MS = 2 * 60_000;
const PAUSE_AFTER_FAILURE_MS = 60_000;
const STEP_TIMEOUT_MS = 10_000;

let current: Pass | null = null;
let inFlight: Promise<string | null> | null = null;
let pausedUntil = 0;
let scriptLoad: Promise<void> | null = null;

const withTimeout = <T>(p: Promise<T>): Promise<T> =>
    Promise.race([
        p,
        new Promise<T>((_, reject) =>
            setTimeout(() => reject(new Error('timeout')), STEP_TIMEOUT_MS)
        ),
    ]);

const loadRecaptcha = (): Promise<void> => {
    scriptLoad ??= new Promise<void>((resolve, reject) => {
        const script = document.createElement('script');
        script.src = `https://www.google.com/recaptcha/enterprise.js?render=${encodeURIComponent(SITE_KEY)}`;
        script.async = true;
        script.onload = () => window.grecaptcha?.enterprise.ready(resolve);
        script.onerror = () => reject(new Error('recaptcha script failed'));
        document.head.appendChild(script);
    }).catch((e) => {
        scriptLoad = null; // allow a later attempt to load it again
        throw e;
    });
    return scriptLoad;
};

const load = (): Pass | null => {
    if (current) return current;
    try {
        const raw = localStorage.getItem(CACHE_KEY);
        if (raw) current = JSON.parse(raw) as Pass;
    } catch {
        current = null;
    }
    return current;
};

const store = (p: Pass | null) => {
    current = p;
    try {
        if (p) localStorage.setItem(CACHE_KEY, JSON.stringify(p));
        else localStorage.removeItem(CACHE_KEY);
    } catch {
        // Storage unavailable: the in-memory copy still works for this page load.
    }
};

// A cached pass that is still accepted, for this device, with at least `margin` ms left.
const usable = (margin: number): string | null => {
    const p = load();
    return p && p.deviceId === getDeviceId() && p.expiresAt - Date.now() > margin ? p.pass : null;
};

const attest = (): Promise<string | null> => {
    inFlight ??= (async () => {
        try {
            const deviceId = getDeviceId();
            if (!deviceId) throw new Error('no device id');
            await withTimeout(loadRecaptcha());
            const recaptchaToken = await withTimeout(
                window.grecaptcha!.enterprise.execute(SITE_KEY, { action: 'client_attest' })
            );
            const headers: Record<string, string> = {
                'Content-Type': 'application/json',
                'X-App-Platform': 'web',
                'X-Device-Id': deviceId,
            };
            try {
                headers['X-App-Version'] = __APP_VERSION__;
            } catch {
                // Not defined (e.g. a tool that skips the Vite build): leave the header out.
            }
            const res = await withTimeout(
                fetch(`${API_URL}/client-attest`, {
                    method: 'POST',
                    headers,
                    body: JSON.stringify({ platform: 'web', deviceId, recaptchaToken }),
                })
            );
            if (!res.ok) throw new Error(`attest ${res.status}`);
            const body = (await res.json()) as { pass?: string; expiresAt?: number };
            if (!body.pass || typeof body.expiresAt !== 'number') throw new Error('bad response');
            store({ pass: body.pass, expiresAt: body.expiresAt, deviceId });
            return body.pass;
        } catch {
            pausedUntil = Date.now() + PAUSE_AFTER_FAILURE_MS;
            return usable(0); // an old pass that has not expired yet beats none
        } finally {
            inFlight = null;
        }
    })();
    return inFlight;
};

/** The pass to send as X-Client-Pass, or null when attestation is off, paused or failed. Never throws. */
export const getClientPass = async (): Promise<string | null> => {
    if (!SITE_KEY) return null;
    try {
        return usable(REFRESH_BEFORE_MS) ?? (Date.now() < pausedUntil ? usable(0) : await attest());
    } catch {
        return null;
    }
};

/** For a 428 CLIENT_PASS_REQUIRED: drop the cached pass and attest again now, ignoring the pause. */
export const forceReattest = async (): Promise<string | null> => {
    if (!SITE_KEY) return null;
    try {
        if (!inFlight) {
            store(null);
            pausedUntil = 0;
        }
        return await attest();
    } catch {
        return null;
    }
};
