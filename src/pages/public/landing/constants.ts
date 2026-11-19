export const ANDROID_APK_URL =
    'https://github.com/Helphive/helphive-app/releases/download/production-07/helphive-universal.apk';

export const IOS_UNAVAILABLE_MESSAGE =
    'iOS is unavailable for now. Android and web access are ready.';

export const NAV_LINKS = [
    { label: 'Services', href: '#services' },
    { label: 'How it works', href: '#how-it-works' },
    { label: 'Become a provider', href: '#providers' },
    { label: 'Get the app', href: '#get-the-app' },
] as const;

/** Starts the APK download by clicking a temporary link, as the page always has. */
export function triggerAndroidDownload() {
    const link = document.createElement('a');
    link.href = ANDROID_APK_URL;
    link.download = 'helphive-universal.apk';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    link.remove();
}

/** Horizontal page gutters (MUI spacing units): 16 / 24 / 32px. */
export const sectionGutter = { xs: 2, sm: 3, md: 4 } as const;
