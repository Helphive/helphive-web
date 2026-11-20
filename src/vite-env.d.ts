/// <reference types="vite/client" />

/** Set at build time by vite.config.ts: package version plus short commit hash. */
declare const __APP_VERSION__: string;

interface ImportMetaEnv {
    readonly VITE_API_URL: string;
    readonly VITE_STRIPE_PUBLISHABLE_KEY: string;
    readonly VITE_GOOGLE_MAPS_API_KEY: string;
    readonly VITE_GCLOUD_BUCKET_USERS?: string;
    /** OneSignal app id (public). Optional: the code has the production id as its default. */
    readonly VITE_ONESIGNAL_APP_ID?: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}
