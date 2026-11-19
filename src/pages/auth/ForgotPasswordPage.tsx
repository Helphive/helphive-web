import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Box, Button, Link, Stack, TextField } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useGetPasswordResetMutation } from '@/features/auth/authApi';
import { AuthError, AuthHeading, AuthSuccess, SubmitButton } from './authForm';
import { authErrorMessage, emailRules } from './authRules';

interface ForgotPasswordFormData {
    email: string;
}

export default function ForgotPasswordPage() {
    useDocumentTitle('Reset password');
    const [getPasswordReset, { isLoading }] = useGetPasswordResetMutation();
    const [error, setError] = useState<string | null>(null);
    const [sentTo, setSentTo] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<ForgotPasswordFormData>();

    const onSubmit = async (data: ForgotPasswordFormData) => {
        try {
            setError(null);
            await getPasswordReset({ email: data.email }).unwrap();
            setSentTo(data.email);
        } catch (err) {
            setError(
                authErrorMessage(err, {
                    404: 'We could not find an account with that email. Check the address, or create an account.',
                })
            );
        }
    };

    if (sentTo) {
        return (
            <AuthSuccess
                title="Check your email"
                actions={
                    <>
                        <Button component={RouterLink} to="/login" variant="contained" size="large">
                            Back to sign in
                        </Button>
                        <Button onClick={() => setSentTo(null)}>Use a different email</Button>
                    </>
                }
            >
                We sent a password reset link to <strong>{sentTo}</strong>. Open the link in that
                email to choose a new password.
            </AuthSuccess>
        );
    }

    return (
        <Box>
            <Link
                component={RouterLink}
                to="/login"
                variant="body2"
                sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, mb: 3 }}
            >
                <ArrowBack sx={{ fontSize: 16 }} />
                Back to sign in
            </Link>
            <AuthHeading
                title="Reset your password"
                subtitle="Enter your email and we will send you a link to choose a new password."
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
                    <SubmitButton busy={isLoading} busyLabel="Sending link">
                        Send reset link
                    </SubmitButton>
                </Stack>
            </form>
        </Box>
    );
}
