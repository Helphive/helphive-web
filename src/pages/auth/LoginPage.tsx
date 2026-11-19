import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams, Link as RouterLink } from 'react-router-dom';
import { Box, Button, CircularProgress, Link, Stack, TextField, Typography } from '@mui/material';
import { PersonOutline, WorkOutline } from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import { PasswordField } from '@/components/ui';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useLoginMutation } from '@/features/auth/authApi';
import { useAppDispatch } from '@/store/hooks';
import { setCredentials } from '@/features/auth/authSlice';
import { color, hairline } from '@/theme/tokens';
import { AuthError, AuthHeading, AuthLinkLine, AuthLinks, SubmitButton } from './authForm';
import { authErrorMessage, emailRules } from './authRules';
import { DEMO_ACCOUNTS, type DemoAccount, type DemoKey } from '@/features/auth/demoAccounts';

interface LoginFormData {
    email: string;
    password: string;
}

const DEMO_ICONS: Record<DemoKey, typeof PersonOutline> = {
    user: PersonOutline,
    provider: WorkOutline,
};

export default function LoginPage() {
    useDocumentTitle('Sign in');
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const [searchParams, setSearchParams] = useSearchParams();
    const [login, { isLoading }] = useLoginMutation();
    const [error, setError] = useState<string | null>(null);
    const [demoKey, setDemoKey] = useState<DemoKey | null>(null);
    const [suggested, setSuggested] = useState<DemoKey | null>(null);
    const handledParam = useRef(false);
    const demoButtons = useRef<Partial<Record<DemoKey, HTMLButtonElement | null>>>({});

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginFormData>();

    const signIn = async (credentials: LoginFormData, isDemo = false) => {
        try {
            setError(null);
            const result = await login(credentials).unwrap();
            dispatch(
                setCredentials({
                    user: result.user,
                    accessToken: result.accessToken,
                    refreshToken: result.refreshToken,
                })
            );
            navigate('/home');
        } catch (err) {
            setError(
                authErrorMessage(
                    err,
                    isDemo
                        ? {
                              401: 'The demo account could not be signed in. Try again in a moment.',
                              403: 'The demo account could not be signed in. Try again in a moment.',
                          }
                        : {
                              401: 'The email or password is incorrect. Check both and try again, or reset your password.',
                              403: 'Verify your email before signing in. Open the verification link we emailed you.',
                          }
                )
            );
        }
    };

    const startDemo = async (account: DemoAccount) => {
        setDemoKey(account.key);
        await signIn({ email: account.email, password: account.password }, true);
        setDemoKey(null);
    };

    // /login?demo=user or ?demo=provider never signs in by itself (a link must not drop a visitor
    // into a shared account). It only points at the matching demo button: scrolls it into view,
    // focuses it and highlights it. The param is read once and dropped, so nothing can loop.
    const demoParam = searchParams.get('demo');
    useEffect(() => {
        if (!demoParam || handledParam.current) return;
        handledParam.current = true;
        setSearchParams({}, { replace: true });
        const account = DEMO_ACCOUNTS.find((a) => a.key === demoParam);
        if (account) setSuggested(account.key);
    }, [demoParam, setSearchParams]);

    useEffect(() => {
        if (!suggested) return;
        const button = demoButtons.current[suggested];
        button?.scrollIntoView({ block: 'center' });
        button?.focus();
    }, [suggested]);
    const suggestedAccount = DEMO_ACCOUNTS.find((a) => a.key === suggested);

    return (
        <Box>
            <AuthHeading
                title="Sign in"
                subtitle="Welcome back. Sign in to continue to HelpHive."
            />
            <form onSubmit={handleSubmit((data) => signIn(data))} noValidate>
                <AuthError message={error} />
                <Stack spacing={2.5}>
                    <TextField
                        label="Email"
                        type="email"
                        required
                        fullWidth
                        autoComplete="email"
                        {...register('email', emailRules)}
                        error={!!errors.email}
                        helperText={errors.email?.message}
                    />
                    <Box>
                        <PasswordField
                            label="Password"
                            required
                            fullWidth
                            {...register('password', { required: 'Enter your password' })}
                            error={!!errors.password}
                            helperText={errors.password?.message}
                        />
                        <Box sx={{ textAlign: 'right', mt: 1 }}>
                            <Link
                                component={RouterLink}
                                to="/forgot-password"
                                variant="body2"
                                sx={{ color: color.coral700 }}
                            >
                                Forgot password?
                            </Link>
                        </Box>
                    </Box>
                    <SubmitButton busy={isLoading && !demoKey} busyLabel="Signing in">
                        Sign in
                    </SubmitButton>
                </Stack>
            </form>

            <Box
                component="section"
                aria-labelledby="demo-title"
                sx={{ mt: 3, pt: 3, borderTop: hairline }}
            >
                <Typography id="demo-title" variant="subtitle2" component="h2">
                    Try a demo account
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    Shared logins for trying HelpHive without signing up. Anyone can use them, so
                    don't enter real details.
                </Typography>
                {suggestedAccount && (
                    <Typography
                        variant="body2"
                        role="status"
                        sx={{ mt: 1.5, fontWeight: 600, color: 'text.primary' }}
                    >
                        Continue as the {suggestedAccount.label.toLowerCase()}: select the
                        highlighted button.
                    </Typography>
                )}
                <Box
                    sx={{
                        mt: 1.5,
                        display: 'grid',
                        gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' },
                        gap: 1.5,
                    }}
                >
                    {DEMO_ACCOUNTS.map((account) => {
                        const Icon = DEMO_ICONS[account.key];
                        const busy = demoKey === account.key;
                        const highlighted = suggested === account.key;
                        return (
                            <Button
                                key={account.key}
                                ref={(el) => {
                                    demoButtons.current[account.key] = el;
                                }}
                                variant="outlined"
                                disabled={isLoading}
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

            <AuthLinks>
                <AuthLinkLine
                    text="Don't have an account?"
                    to="/signup"
                    linkText="Create an account"
                />
                <AuthLinkLine
                    text="Want to work shifts?"
                    to="/provider-signup"
                    linkText="Register as a provider"
                />
            </AuthLinks>
        </Box>
    );
}
