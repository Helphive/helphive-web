import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
    Box,
    Typography,
    TextField,
    Button,
    Alert,
    CircularProgress,
} from '@mui/material';
import { CheckCircle, ArrowBack } from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import { useGetPasswordResetMutation } from '@/features/auth/authApi';

interface ForgotPasswordFormData {
    email: string;
}

export default function ForgotPasswordPage() {
    const [getPasswordReset, { isLoading }] = useGetPasswordResetMutation();
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<ForgotPasswordFormData>();

    const onSubmit = async (data: ForgotPasswordFormData) => {
        try {
            setError(null);
            await getPasswordReset({ email: data.email }).unwrap();
            setSuccess(true);
        } catch (err) {
            const error = err as { status?: number; data?: { message?: string } };
            if (error.status === 404) {
                setError('No account found with this email address');
            } else {
                setError(error.data?.message || 'An error occurred. Please try again.');
            }
        }
    };

    if (success) {
        return (
            <Box sx={{ textAlign: 'center' }}>
                <CheckCircle sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
                <Typography variant="h5" fontWeight={600} sx={{ mb: 2 }}>
                    Email Sent!
                </Typography>
                <Typography color="text.secondary" sx={{ mb: 4 }}>
                    We've sent password reset instructions to your email. Please check your inbox
                    and follow the link to reset your password.
                </Typography>
                <Button
                    component={RouterLink}
                    to="/login"
                    variant="contained"
                    size="large"
                    sx={{ px: 4 }}
                >
                    Back to Login
                </Button>
            </Box>
        );
    }

    return (
        <Box>
            <Button
                component={RouterLink}
                to="/login"
                startIcon={<ArrowBack />}
                sx={{ mb: 3 }}
            >
                Back to Login
            </Button>

            <Box sx={{ textAlign: 'center', mb: 4 }}>
                <Typography variant="h4" fontWeight={700} color="primary" sx={{ mb: 1 }}>
                    Forgot Password?
                </Typography>
                <Typography color="text.secondary">
                    Enter your email and we'll send you reset instructions
                </Typography>
            </Box>

            {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                </Alert>
            )}

            <form onSubmit={handleSubmit(onSubmit)}>
                <TextField
                    fullWidth
                    label="Email"
                    type="email"
                    {...register('email', {
                        required: 'Email is required',
                        pattern: {
                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                            message: 'Invalid email address',
                        },
                    })}
                    error={!!errors.email}
                    helperText={errors.email?.message}
                    sx={{ mb: 3 }}
                />

                <Button
                    type="submit"
                    variant="contained"
                    fullWidth
                    size="large"
                    disabled={isLoading}
                    sx={{ py: 1.5 }}
                >
                    {isLoading ? (
                        <CircularProgress size={24} color="inherit" />
                    ) : (
                        'Send Reset Link'
                    )}
                </Button>
            </form>
        </Box>
    );
}
