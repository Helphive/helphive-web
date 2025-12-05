/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_API_URL: string;
    readonly VITE_GOOGLE_MAPS_API_KEY: string;
    readonly VITE_STRIPE_PUBLISHABLE_KEY: string;
    readonly VITE_ONESIGNAL_APP_ID: string;
    readonly VITE_GCLOUD_BUCKET_USERS: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}
