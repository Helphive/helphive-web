import { useState, type ReactNode } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Box, Button, Stack, TextField } from '@mui/material';
import { useForm } from 'react-hook-form';
import { PasswordField } from '@/components/ui';
import { AuthError, AuthHeading, AuthLinks, AuthSuccess, SubmitButton } from './authForm';
import {
    PASSWORD_HINT,
    authErrorMessage,
    emailRules,
    nameRules,
    validateNewPassword,
} from './authRules';

export interface SignupPayload {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
}

interface SignupFormData extends SignupPayload {
    confirmPassword: string;
}

interface SignupFormProps {
    title: string;
    subtitle: string;
    submitLabel: string;
    busyLabel: string;
    /** Calls the sign-up endpoint; must reject on failure. */
    onRegister: (payload: SignupPayload) => Promise<unknown>;
    isLoading: boolean;
    successTitle: string;
    successMessage: ReactNode;
    /** Links shown under the form. */
    links: ReactNode;
}

/** Shared sign-up form for customers and providers. */
export default function SignupForm({
    title,
    subtitle,
    submitLabel,
    busyLabel,
    onRegister,
    isLoading,
    successTitle,
    successMessage,
    links,
}: SignupFormProps) {
    const [error, setError] = useState<string | null>(null);
    const [sentTo, setSentTo] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        getValues,
        formState: { errors },
    } = useForm<SignupFormData>();

    const onSubmit = async (data: SignupFormData) => {
        setError(null);
        try {
            await onRegister({
                firstName: data.firstName,
                lastName: data.lastName,
                email: data.email,
                password: data.password,
            });
            setSentTo(data.email);
        } catch (err) {
            setError(
                authErrorMessage(err, {
                    409: 'An account with this email already exists. Sign in instead, or use a different email.',
                })
            );
        }
    };

    if (sentTo) {
        return (
            <AuthSuccess
                title={successTitle}
                actions={
                    <Button component={RouterLink} to="/login" variant="contained" size="large">
                        Go to sign in
                    </Button>
                }
            >
                We sent a verification email to <strong>{sentTo}</strong>. {successMessage}
            </AuthSuccess>
        );
    }

    return (
        <Box>
            <AuthHeading title={title} subtitle={subtitle} />
            <form onSubmit={handleSubmit(onSubmit)} noValidate>
                <AuthError message={error} />
                <Stack spacing={2.5}>
                    <Box
                        sx={{
                            display: 'grid',
                            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' },
                            gap: 2.5,
                        }}
                    >
                        <TextField
                            label="First name"
                            required
                            autoComplete="given-name"
                            {...register('firstName', nameRules('first'))}
                            error={!!errors.firstName}
                            helperText={errors.firstName?.message}
                        />
                        <TextField
                            label="Last name"
                            required
                            autoComplete="family-name"
                            {...register('lastName', nameRules('last'))}
                            error={!!errors.lastName}
                            helperText={errors.lastName?.message}
                        />
                    </Box>
                    <TextField
                        label="Email"
                        type="email"
                        required
                        autoComplete="email"
                        fullWidth
                        {...register('email', emailRules)}
                        error={!!errors.email}
                        helperText={errors.email?.message}
                    />
                    <PasswordField
                        label="Password"
                        required
                        fullWidth
                        autoComplete="new-password"
                        {...register('password', { validate: validateNewPassword })}
                        error={!!errors.password}
                        helperText={errors.password?.message ?? PASSWORD_HINT}
                    />
                    <PasswordField
                        label="Confirm password"
                        required
                        fullWidth
                        autoComplete="new-password"
                        {...register('confirmPassword', {
                            required: 'Enter your password again to confirm it',
                            validate: (value) =>
                                value === getValues('password') ||
                                'Passwords do not match. Enter the same password in both fields.',
                        })}
                        error={!!errors.confirmPassword}
                        helperText={errors.confirmPassword?.message}
                    />
                    <SubmitButton busy={isLoading} busyLabel={busyLabel}>
                        {submitLabel}
                    </SubmitButton>
                </Stack>
                <AuthLinks>{links}</AuthLinks>
            </form>
        </Box>
    );
}
