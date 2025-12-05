import { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
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
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import { useLoginMutation } from '@/features/auth/authApi';
import { useAppDispatch } from '@/store/hooks';
import { setCredentials } from '@/features/auth/authSlice';

interface LoginFormData {
    email: string;
    password: string;
}

export default function LoginPage() {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const [login, { isLoading }] = useLoginMutation();
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginFormData>();

    const onSubmit = async (data: LoginFormData) => {
        try {
            setError(null);
            const result = await login(data).unwrap();
            dispatch(
                setCredentials({
                    user: result.user,
                    accessToken: result.accessToken,
                    refreshToken: result.refreshToken,
                })
            );
            navigate('/home');
        } catch (err) {
            const error = err as { status?: number; data?: { message?: string } };
            if (error.status === 401) {
                setError('Invalid email or password');
            } else if (error.status === 403) {
                setError('Please verify your email before logging in');
            } else {
                setError(error.data?.message || 'An error occurred. Please try again.');
            }
        }
    };

    return (
        <Box>
            <Box sx={{ textAlign: 'center', mb: 4 }}>
                <Typography variant="h4" fontWeight={700} color="primary" sx={{ mb: 1 }}>
                    Welcome Back
                </Typography>
                <Typography color="text.secondary">
                    Sign in to continue to HelpHive
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
                    sx={{ mb: 2 }}
                />

                <Box sx={{ textAlign: 'right', mb: 3 }}>
                    <Link
                        component={RouterLink}
                        to="/forgot-password"
                        color="primary"
                        underline="hover"
                    >
                        Forgot Password?
                    </Link>
                </Box>

                <Button
                    type="submit"
                    variant="contained"
                    fullWidth
                    size="large"
                    disabled={isLoading}
                    sx={{ mb: 3, py: 1.5 }}
                >
                    {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Sign In'}
                </Button>

                <Typography textAlign="center" color="text.secondary">
                    Don't have an account?{' '}
                    <Link component={RouterLink} to="/signup" color="primary" underline="hover">
                        Sign Up
                    </Link>
                </Typography>

                <Typography textAlign="center" color="text.secondary" sx={{ mt: 2 }}>
                    Want to become a provider?{' '}
                    <Link
                        component={RouterLink}
                        to="/provider-signup"
                        color="primary"
                        underline="hover"
                    >
                        Register as Provider
                    </Link>
                </Typography>
            </form>
        </Box>
    );
}
