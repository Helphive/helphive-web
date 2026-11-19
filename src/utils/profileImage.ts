// Profile photos are stored as object paths in the users bucket (same scheme as the mobile app).
export function getProfileImageUrl(profile?: string | null): string | undefined {
    if (!profile) return undefined;
    if (/^(https?:|blob:|data:)/.test(profile)) return profile;
    const bucket = import.meta.env.VITE_GCLOUD_BUCKET_USERS;
    return bucket ? `https://storage.googleapis.com/${bucket}/${profile}` : undefined;
}

export function getInitials(firstName?: string, lastName?: string): string {
    return `${firstName?.[0] ?? ''}${lastName?.[0] ?? ''}`.toUpperCase() || '?';
}
