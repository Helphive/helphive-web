import { Outlet, Navigate } from 'react-router-dom';
import { Box, Container, Paper } from '@mui/material';
import { useAppSelector } from '@/store/hooks';
import { selectIsAuthenticated } from '@/features/auth/authSlice';

export default function AuthLayout() {
    const isAuthenticated = useAppSelector(selectIsAuthenticated);

    if (isAuthenticated) {
        return <Navigate to="/home" replace />;
    }

    return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: 'background.default',
                py: 4,
            }}
        >
            <Container maxWidth="sm">
                <Paper
                    elevation={0}
                    sx={{
                        p: { xs: 3, sm: 5 },
                        borderRadius: 3,
                        border: '1px solid',
                        borderColor: 'divider',
                    }}
                >
                    <Outlet />
                </Paper>
            </Container>
        </Box>
    );
}
