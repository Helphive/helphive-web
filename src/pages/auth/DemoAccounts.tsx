import { useEffect, useRef, useState } from 'react';
import { Box, Button, CircularProgress, Typography } from '@mui/material';
import { PersonIcon, ProviderIcon, type AppIcon } from '@/components/ui/icons';
import { DEMO_ACCOUNTS, type DemoAccount, type DemoKey } from '@/features/auth/demoAccounts';
import { color, hairline } from '@/theme/tokens';
import { AuthError } from './authForm';
import { useSessionSignIn } from './useSessionSignIn';

const DEMO_ICONS: Record<DemoKey, AppIcon> = {
    user: PersonIcon,
    provider: ProviderIcon,
};

const DEMO_FAILED = 'The demo account could not be signed in. Try again in a moment.';

interface DemoAccountsProps {
    /** Login page: "Try a demo account". Sign-up pages: offered as an alternative to the form. */
    context: 'login' | 'signup';
    /** The account shown first. */
    lead?: DemoKey;
    /** Highlights one button (from /login?demo=...). Never signs in by itself. */
    suggested?: DemoKey | null;
    /** The page's own form is busy, so the demo buttons wait. */
    disabled?: boolean;
}

/**
 * The shared demo-account choice on the login and sign-up pages. Nothing signs in without a
 * click: a click runs the normal sign-in with the shared credentials.
 */
export default function DemoAccounts({
    context,
    lead = 'user',
    suggested = null,
    disabled = false,
}: DemoAccountsProps) {
    const { signIn, isLoading } = useSessionSignIn();
    const [demoKey, setDemoKey] = useState<DemoKey | null>(null);
    const [error, setError] = useState<string | null>(null);
    const buttons = useRef<Partial<Record<DemoKey, HTMLButtonElement | null>>>({});

    const accounts = [...DEMO_ACCOUNTS].sort(
        (a, b) => Number(b.key === lead) - Number(a.key === lead)
    );
    const suggestedAccount = DEMO_ACCOUNTS.find((a) => a.key === suggested);

    useEffect(() => {
        if (!suggested) return;
        const button = buttons.current[suggested];
        button?.scrollIntoView({ block: 'center' });
        button?.focus();
    }, [suggested]);

    const startDemo = async (account: DemoAccount) => {
        setError(null);
        setDemoKey(account.key);
        const message = await signIn(
            { email: account.email, password: account.password },
            { 401: DEMO_FAILED, 403: DEMO_FAILED }
        );
        setDemoKey(null);
        setError(message);
    };

    const titleId = `demo-title-${context}`;
    return (
        <Box
            component="section"
            aria-labelledby={titleId}
            sx={{ mt: 3, pt: 3, borderTop: hairline }}
        >
            <Typography id={titleId} variant="subtitle2" component="h2">
                {context === 'login' ? 'Try a demo account' : 'Not ready to sign up?'}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                {context === 'login'
                    ? "Shared logins for trying HelpHive without signing up. Anyone can use them, so don't enter real details."
                    : "Look around with a demo account first. It's a shared login anyone can use, so don't enter real details."}
            </Typography>
            {suggestedAccount && (
                <Typography
                    variant="body2"
                    role="status"
                    sx={{ mt: 1.5, fontWeight: 600, color: 'text.primary' }}
                >
                    Continue as the {suggestedAccount.label.toLowerCase()}: select the highlighted
                    button.
                </Typography>
            )}
            {error && (
                <Box sx={{ mt: 1.5 }}>
                    <AuthError message={error} />
                </Box>
            )}
            <Box
                sx={{
                    mt: 1.5,
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' },
                    gap: 1.5,
                }}
            >
                {accounts.map((account) => {
                    const Icon = DEMO_ICONS[account.key];
                    const busy = demoKey === account.key;
                    const highlighted = suggested === account.key;
                    return (
                        <Button
                            key={account.key}
                            ref={(el) => {
                                buttons.current[account.key] = el;
                            }}
                            variant="outlined"
                            disabled={disabled || isLoading}
                            onClick={() => startDemo(account)}
                            startIcon={
                                busy ? <CircularProgress size={16} color="inherit" /> : <Icon />
                            }
                            aria-label={`${account.label}: ${account.description}`}
                            sx={{
                                justifyContent: 'flex-start',
                                // Selected is an ink outline across the design system.
                                ...(highlighted && {
                                    borderColor: color.ink900,
                                    boxShadow: `inset 0 0 0 1px ${color.ink900}`,
                                    '&:hover': { borderColor: color.ink900 },
                                }),
                            }}
                        >
                            {busy ? 'Signing in' : account.label}
                        </Button>
                    );
                })}
            </Box>
        </Box>
    );
}
