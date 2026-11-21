// Shared demo logins so reviewers can try both sides of the marketplace without signing up.
// Mirrors helphive-app/src/features/auth/demoAccounts.ts.
export type DemoKey = 'user' | 'provider';

export interface DemoAccount {
    key: DemoKey;
    label: string;
    description: string;
    email: string;
    password: string;
}

export const DEMO_ACCOUNTS: DemoAccount[] = [
    {
        key: 'user',
        label: 'Demo customer',
        description: 'Book and track shifts',
        email: 'user@helphive.himaiz.com',
        password: 'HelphiveUser123!',
    },
    {
        key: 'provider',
        label: 'Demo provider',
        description: 'Accept orders and see earnings',
        email: 'provider@helphive.himaiz.com',
        password: 'HelphiveProvider123!',
    },
];

// Links to the login page with the matching demo button highlighted. It never signs in by itself.
export const demoLoginPath = (key: DemoKey) => `/login?demo=${key}`;

export const isDemoEmail = (email?: string | null) =>
    !!email && DEMO_ACCOUNTS.some((a) => a.email.toLowerCase() === email.toLowerCase());
