// Loads the OneSignal Web SDK (v16) on demand. Nothing here runs until someone signed in has notifications on or turns
// them on, so the public pages never download the SDK. Our own UI replaces OneSignal's bell and slidedown prompt.

/** OneSignal app ids are public identifiers. VITE_ONESIGNAL_APP_ID overrides this (never needed in CI). */
export const ONESIGNAL_APP_ID =
    import.meta.env.VITE_ONESIGNAL_APP_ID || 'ed2df7dd-cdce-4640-b040-53656c312a40';

const SDK_URL = 'https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js';

export interface PushNotificationInfo {
    notificationId?: string;
    additionalData?: Record<string, unknown> | null;
    launchURL?: string;
}

export interface ForegroundEvent {
    notification: PushNotificationInfo & { display?: () => void };
    preventDefault: () => void;
}

export interface ClickEvent {
    notification?: PushNotificationInfo;
    result?: { url?: string; actionId?: string };
}

export interface SubscriptionChange {
    current?: { id?: string | null; optedIn?: boolean };
}

/** The slice of the SDK this app uses. */
export interface OneSignalApi {
    init: (options: Record<string, unknown>) => Promise<void>;
    login: (externalId: string) => Promise<void>;
    logout: () => Promise<void>;
    Notifications: {
        addEventListener: (
            name: 'click' | 'foregroundWillDisplay',
            handler: (event: never) => void
        ) => void;
    };
    User: {
        PushSubscription: {
            id?: string | null;
            optedIn?: boolean;
            optIn: () => Promise<void>;
            optOut: () => Promise<void>;
            addEventListener: (
                name: 'change',
                handler: (event: SubscriptionChange) => void
            ) => void;
        };
    };
}

declare global {
    interface Window {
        OneSignalDeferred?: Array<(sdk: OneSignalApi) => void | Promise<void>>;
    }
}

let loading: Promise<OneSignalApi> | null = null;
let ready: OneSignalApi | null = null;

/** True once the SDK has been loaded in this page (sign-out then talks to it without a download). */
export const isOneSignalLoaded = () => ready !== null;

export function loadOneSignal(): Promise<OneSignalApi> {
    if (loading) return loading;
    loading = new Promise<OneSignalApi>((resolve, reject) => {
        window.OneSignalDeferred = window.OneSignalDeferred || [];
        window.OneSignalDeferred.push(async (sdk) => {
            try {
                await sdk.init({
                    appId: ONESIGNAL_APP_ID,
                    // Only a development server on localhost needs this; production runs on https.
                    allowLocalhostAsSecureOrigin: import.meta.env.DEV,
                    autoResubscribe: true,
                    // Our own settings row and prompt are the only way in: no OneSignal bell, slidedown or welcome message.
                    notifyButton: { enable: false },
                    welcomeNotification: { disable: true },
                    promptOptions: {
                        slidedown: { prompts: [{ type: 'push', autoPrompt: false }] },
                    },
                    // Clicking a notification focuses a tab that is already open (any HelpHive page); the click
                    // handler in pushSession.ts then routes inside the app without a reload.
                    notificationClickHandlerMatch: 'origin',
                    notificationClickHandlerAction: 'focus',
                });
                ready = sdk;
                resolve(sdk);
            } catch (error) {
                reject(error);
            }
        });
        const script = document.createElement('script');
        script.src = SDK_URL;
        script.async = true;
        script.onerror = () => reject(new Error('OneSignal SDK did not load'));
        document.head.appendChild(script);
    }).catch((error) => {
        loading = null; // a later attempt may succeed (offline, blocked, wrong origin)
        throw error;
    });
    return loading;
}

export const withTimeout = <T>(promise: Promise<T>, ms: number): Promise<T> =>
    Promise.race([
        promise,
        new Promise<never>((_, reject) => setTimeout(() => reject(new Error('timeout')), ms)),
    ]);
