// Shared demo logins so reviewers can try both sides of the marketplace without signing up.
// Mirrors helphive-app/src/utils/demoAccounts.ts.
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
        email: 'user@helphivenow.com',
        password: 'HelphiveUser123!',
    },
    {
        key: 'provider',
        label: 'Demo provider',
        description: 'Accept orders and see earnings',
        email: 'provider@helphivenow.com',
        password: 'HelphiveProvider123!',
    },
];

export const demoLoginPath = (key: DemoKey) => `/login?demo=${key}`;
