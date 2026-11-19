// Every URL and file in a message is untrusted. Only these types, sizes and hosts are ever used.

export const MAX_FILE_BYTES = 10 * 1024 * 1024;

export const IMAGE_TYPES = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'image/heic',
    'image/heif',
];
export const FILE_TYPES = ['application/pdf'];
export const ACCEPT = [...IMAGE_TYPES, ...FILE_TYPES, '.heic', '.heif', '.pdf'].join(',');

// Browsers cannot draw HEIC/HEIF; they are offered as downloads.
const RENDERABLE = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);

const EXT_TYPES: Record<string, string> = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    webp: 'image/webp',
    gif: 'image/gif',
    heic: 'image/heic',
    heif: 'image/heif',
    pdf: 'application/pdf',
};

/** Normalised MIME type; some browsers leave HEIC files untyped, so fall back to the extension. */
export const fileType = (file: { type?: string; name?: string }) => {
    const type = (file.type || '').toLowerCase();
    if (type) return type;
    const ext = file.name?.split('.').pop()?.toLowerCase() ?? '';
    return EXT_TYPES[ext] ?? '';
};

export type FileCheck = { ok: true; kind: 'image' | 'file' } | { ok: false; error: string };

export function checkFile(file: File): FileCheck {
    const type = fileType(file);
    if (!IMAGE_TYPES.includes(type) && !FILE_TYPES.includes(type)) {
        return {
            ok: false,
            error: 'This file type is not allowed. Send a photo (JPG, PNG, WebP, GIF, HEIC) or a PDF.',
        };
    }
    if (file.size > MAX_FILE_BYTES) return { ok: false, error: 'Files up to 10 MB.' };
    if (file.size === 0) return { ok: false, error: 'This file is empty.' };
    return { ok: true, kind: IMAGE_TYPES.includes(type) ? 'image' : 'file' };
}

// CometChat media and HelpHive profile photos. Anything else is not rendered or linked.
const ALLOWED_HOSTS = [
    /(^|\.)cometchat\.io$/i,
    /(^|\.)cometchat\.com$/i,
    /^storage\.googleapis\.com$/i,
];

export function safeUrl(raw: unknown): string | undefined {
    if (typeof raw !== 'string' || !raw) return undefined;
    try {
        const url = new URL(raw);
        if (url.protocol !== 'https:') return undefined;
        if (!ALLOWED_HOSTS.some((re) => re.test(url.hostname))) return undefined;
        return url.href;
    } catch {
        return undefined;
    }
}

export const isRenderableImage = (mimeType?: string) =>
    !!mimeType && RENDERABLE.has(mimeType.toLowerCase());
export const isAllowedType = (mimeType?: string) =>
    !!mimeType &&
    (IMAGE_TYPES.includes(mimeType.toLowerCase()) || FILE_TYPES.includes(mimeType.toLowerCase()));

export const formatBytes = (bytes?: number) => {
    if (!bytes || bytes < 0) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

/** A file name safe to show: no control characters, bounded length. */
export const safeName = (name?: string) =>
    // eslint-disable-next-line no-control-regex
    (name || 'Attachment').replace(/[\u0000-\u001f\u007f‪-‮⁦-⁩]/g, '').slice(0, 120) ||
    'Attachment';
