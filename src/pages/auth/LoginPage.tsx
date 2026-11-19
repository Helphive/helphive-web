import { useEffect, useRef, useState } from 'react';
import { useSearchParams, Link as RouterLink } from 'react-router-dom';
import { Box, Link, Stack, TextField } from '@mui/material';
import { useForm } from 'react-hook-form';
import { PasswordField } from '@/components/ui';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { color } from '@/theme/tokens';
import { AuthError, AuthHeading, AuthLinkLine, AuthLinks, SubmitButton } from './authForm';
import { emailRules } from './authRules';
import { DEMO_ACCOUNTS, type DemoKey } from '@/features/auth/demoAccounts';
import DemoAccounts from './DemoAccounts';
import { useSessionSignIn } from './useSessionSignIn';

interface LoginFormData {
    email: string;
    password: string;
}

export default function LoginPage() {
    useDocumentTitle('Sign in');
    const [searchParams, setSearchParams] = useSearchParams();
    const { signIn, isLoading } = useSessionSignIn();
    const [error, setError] = useState<string | null>(null);
    const [suggested, setSuggested] = useState<DemoKey | null>(null);
    const handledParam = useRef(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginFormData>();

    const onSubmit = async (credentials: LoginFormData) => {
        setError(null);
        setError(
            await signIn(credentials, {
                401: 'The email or password is incorrect. Check both and try again, or reset your password.',
                403: 'Verify your email before signing in. Open the verification link we emailed you.',
            })
        );
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

    return (
        <Box>
            <AuthHeading
                title="Sign in"
                subtitle="Welcome back. Sign in to continue to HelpHive."
            />
            <form onSubmit={handleSubmit(onSubmit)} noValidate>
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
                    <SubmitButton busy={isLoading} busyLabel="Signing in">
                        Sign in
                    </SubmitButton>
                </Stack>
            </form>

            <DemoAccounts context="login" suggested={suggested} disabled={isLoading} />

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
