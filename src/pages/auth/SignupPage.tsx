import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
    Box,
    Typography,
    TextField,
    Button,
    Link,
    Alert,
    InputAdornment,
    IconButton,
    CircularProgress,
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import { Visibility, VisibilityOff, CheckCircle } from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import { useSignupMutation } from '@/features/auth/authApi';

interface SignupFormData {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    confirmPassword: string;
}

export default function SignupPage() {
    const [signup, { isLoading }] = useSignupMutation();
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm<SignupFormData>();

    const password = watch('password');

    const onSubmit = async (data: SignupFormData) => {
        try {
            setError(null);
            await signup({
                firstName: data.firstName,
                lastName: data.lastName,
                email: data.email,
                password: data.password,
            }).unwrap();
            setSuccess(true);
        } catch (err) {
            const error = err as { status?: number; data?: { message?: string } };
            if (error.status === 409) {
                setError('An account with this email already exists');
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
                    Account Created!
                </Typography>
                <Typography color="text.secondary" sx={{ mb: 4 }}>
                    We've sent a verification email to your inbox. Please verify your email to
                    continue.
                </Typography>
                <Button
                    component={RouterLink}
                    to="/login"
                    variant="contained"
                    size="large"
                    sx={{ px: 4 }}
                >
                    Go to Login
                </Button>
            </Box>
        );
    }

    return (
        <Box>
            <Box sx={{ textAlign: 'center', mb: 4 }}>
                <Typography variant="h4" fontWeight={700} color="primary" sx={{ mb: 1 }}>
                    Create Account
                </Typography>
                <Typography color="text.secondary">
                    Sign up to book hospitality services
                </Typography>
            </Box>

            {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                </Alert>
            )}

            <form onSubmit={handleSubmit(onSubmit)}>
                <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                            fullWidth
                            label="First Name"
                            {...register('firstName', {
                                required: 'First name is required',
                                minLength: {
                                    value: 2,
                                    message: 'First name must be at least 2 characters',
                                },
                            })}
                            error={!!errors.firstName}
                            helperText={errors.firstName?.message}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                            fullWidth
                            label="Last Name"
                            {...register('lastName', {
                                required: 'Last name is required',
                                minLength: {
                                    value: 2,
                                    message: 'Last name must be at least 2 characters',
                                },
                            })}
                            error={!!errors.lastName}
                            helperText={errors.lastName?.message}
                        />
                    </Grid>
                </Grid>

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
                    sx={{ mt: 3 }}
                />

                <TextField
                    fullWidth
                    label="Password"
                    type={showPassword ? 'text' : 'password'}
                    {...register('password', {
                        required: 'Password is required',
                        minLength: {
                            value: 6,
                            message: 'Password must be at least 6 characters',
                        },
                    })}
                    error={!!errors.password}
                    helperText={errors.password?.message}
                    InputProps={{
                        endAdornment: (
                            <InputAdornment position="end">
                                <IconButton
                                    onClick={() => setShowPassword(!showPassword)}
                                    edge="end"
                                >
                                    {showPassword ? <VisibilityOff /> : <Visibility />}
                                </IconButton>
                            </InputAdornment>
                        ),
                    }}
                    sx={{ mt: 3 }}
                />

                <TextField
                    fullWidth
                    label="Confirm Password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    {...register('confirmPassword', {
                        required: 'Please confirm your password',
                        validate: (value) => value === password || 'Passwords do not match',
                    })}
                    error={!!errors.confirmPassword}
                    helperText={errors.confirmPassword?.message}
                    InputProps={{
                        endAdornment: (
                            <InputAdornment position="end">
                                <IconButton
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    edge="end"
                                >
                                    {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                                </IconButton>
                            </InputAdornment>
                        ),
                    }}
                    sx={{ mt: 3, mb: 3 }}
                />

                <Button
                    type="submit"
                    variant="contained"
                    fullWidth
                    size="large"
                    disabled={isLoading}
                    sx={{ mb: 3, py: 1.5 }}
                >
                    {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Create Account'}
                </Button>

                <Typography textAlign="center" color="text.secondary">
                    Already have an account?{' '}
                    <Link component={RouterLink} to="/login" color="primary" underline="hover">
                        Sign In
                    </Link>
                </Typography>
            </form>
        </Box>
    );
}
