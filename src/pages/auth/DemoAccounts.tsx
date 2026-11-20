import { useEffect, useRef, useState } from 'react';
import { Box, ButtonBase, CircularProgress, Typography } from '@mui/material';
import { ForwardIcon, PersonIcon, ProviderIcon, type AppIcon } from '@/components/ui/icons';
import { DEMO_ACCOUNTS, type DemoAccount, type DemoKey } from '@/features/auth/demoAccounts';
import { color, focusRing, font, hairline, radius } from '@/theme/tokens';
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
    /** Highlights one tile (from /login?demo=...). Never signs in by itself. */
    suggested?: DemoKey | null;
    /** The page's own form is busy, so the demo tiles wait. */
    disabled?: boolean;
}

/**
 * The shared demo-account choice on the login and sign-up pages: two tiles, side by side at every
 * width. Nothing signs in without a click: a click runs the normal sign-in with the shared credentials.
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
        if (demoKey) return;
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
                    ? "Shared logins for looking around. Don't enter real details."
                    : "Look around with a shared demo account first. Don't enter real details."}
            </Typography>
            {suggestedAccount && (
                <Typography
                    variant="body2"
                    role="status"
                    sx={{ mt: 1.5, fontWeight: 600, color: 'text.primary' }}
                >
                    Continue as the {suggestedAccount.label.toLowerCase()}: select the highlighted
                    tile.
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
                    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                    gap: 1.5,
                }}
            >
                {accounts.map((account) => (
                    <DemoTile
                        key={account.key}
                        account={account}
                        busy={demoKey === account.key}
                        // The clicked tile stays at full strength while it signs in; the other waits.
                        disabled={(disabled || isLoading || !!demoKey) && demoKey !== account.key}
                        highlighted={suggested === account.key}
                        onClick={() => startDemo(account)}
                        buttonRef={(el) => {
                            buttons.current[account.key] = el;
                        }}
                    />
                ))}
            </Box>
        </Box>
    );
}

function DemoTile({
    account,
    busy,
    disabled,
    highlighted,
    onClick,
    buttonRef,
}: {
    account: DemoAccount;
    busy: boolean;
    disabled: boolean;
    highlighted: boolean;
    onClick: () => void;
    buttonRef: (el: HTMLButtonElement | null) => void;
}) {
    const Icon = DEMO_ICONS[account.key];
    return (
        <ButtonBase
            ref={buttonRef}
            disabled={disabled}
            onClick={busy ? undefined : onClick}
            aria-busy={busy || undefined}
            aria-label={`${account.label}: ${account.description}`}
            sx={{
                // ButtonBase is a centred inline-flex; the tile is a full-width column, top-aligned.
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'stretch',
                justifyContent: 'flex-start',
                width: '100%',
                height: '100%',
                minHeight: 76,
                p: 1.5,
                textAlign: 'left',
                // A <button> does not inherit the page font.
                fontFamily: font.family,
                bgcolor: color.subtle,
                border: hairline,
                borderRadius: `${radius.md}px`,
                color: color.ink900,
                transition: 'background-color .15s, border-color .15s',
                '& .demo-arrow': { transition: 'transform .15s, color .15s' },
                '&:hover': {
                    bgcolor: color.surface,
                    borderColor: color.lineStrong,
                    '& .demo-arrow': { transform: 'translateX(2px)', color: color.ink900 },
                },
                '&:active': { borderColor: color.ink900 },
                '&.Mui-focusVisible': focusRing,
                '&.Mui-disabled': { opacity: 0.55 },
                ...(busy && { cursor: 'progress' }),
                // Suggested: the design system's selected outline (2px ink, inside the tile's size).
                ...(highlighted && {
                    borderColor: color.ink900,
                    boxShadow: `inset 0 0 0 1px ${color.ink900}`,
                    '&:hover': {
                        bgcolor: color.surface,
                        borderColor: color.ink900,
                        '& .demo-arrow': { transform: 'translateX(2px)', color: color.ink900 },
                    },
                }),
                '@media (prefers-reduced-motion: reduce)': {
                    transition: 'none',
                    '& .demo-arrow': { transition: 'none' },
                    '&:hover .demo-arrow': { transform: 'none' },
                },
            }}
        >
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    mb: 1.25,
                }}
            >
                <Box
                    aria-hidden="true"
                    sx={{
                        width: 32,
                        height: 32,
                        display: 'grid',
                        placeItems: 'center',
                        borderRadius: `${radius.sm}px`,
                        bgcolor: color.coral50,
                        color: color.coral600,
                    }}
                >
                    <Icon size={18} />
                </Box>
                {busy ? (
                    <CircularProgress size={16} sx={{ color: color.ink500 }} aria-hidden />
                ) : (
                    <ForwardIcon className="demo-arrow" size={16} sx={{ color: color.ink500 }} />
                )}
            </Box>
            <Box
                component="span"
                sx={{ fontSize: font.size.md, fontWeight: 600, lineHeight: 1.35, mb: 0.25 }}
            >
                {busy ? 'Signing in' : account.label}
            </Box>
            <Box
                component="span"
                sx={{
                    fontSize: font.size.xs,
                    fontWeight: 500,
                    lineHeight: 1.4,
                    color: color.ink500,
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                }}
            >
                {account.description}
            </Box>
        </ButtonBase>
    );
}
