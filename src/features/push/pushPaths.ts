// Which links from a notification the app will follow. Only a page of this app: same origin, and one of the areas
// the server links to. Anything else (another site, a script URL, an odd path) is ignored.
const AREAS = /^\/(home|user|provider|chat)(\/|$)/;

/**
 * The in-app path ("/user/booking/…") for a notification link, or null when it must not be opened.
 * `anyOrigin` (development only) takes the path of a link on another origin: a local server on localhost:3000
 * receives the production links the server builds.
 */
export function internalPath(
    raw: unknown,
    origin: string = window.location.origin,
    anyOrigin = false
): string | null {
    if (typeof raw !== 'string' || !raw || raw.length > 2048) return null;
    try {
        const url = new URL(raw, origin);
        if (url.protocol !== 'https:' && url.protocol !== 'http:') return null;
        if (url.origin !== origin && !anyOrigin) return null;
        if (!AREAS.test(url.pathname) || url.pathname.includes('//')) return null;
        return `${url.pathname}${url.search}`;
    } catch {
        return null;
    }
}

/** The conversation a path shows, "/user/messages/<uid>" or "/provider/messages/<uid>", or null. */
export function openConversationUid(pathname: string): string | null {
    const match = /^\/(?:user|provider)\/messages\/([^/]+)\/?$/.exec(pathname);
    if (!match) return null;
    try {
        return decodeURIComponent(match[1]);
    } catch {
        return null;
    }
}
