import { Box, Button, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { useAppSelector } from '@/store/hooks';
import { selectIsAuthenticated } from '@/features/auth/authSlice';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

export default function NotFoundPage() {
    useDocumentTitle('Page not found');
    const isAuthenticated = useAppSelector(selectIsAuthenticated);

    return (
        <Box
            sx={{
                textAlign: 'center',
                py: { xs: 8, sm: 12 },
                px: 2,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
            }}
        >
            <Typography
                sx={{
                    fontSize: { xs: 72, sm: 96 },
                    fontWeight: 800,
                    lineHeight: 1,
                    color: 'primary.main',
                }}
            >
                404
            </Typography>
            <Typography variant="h5" fontWeight={700} sx={{ mt: 2 }}>
                Page not found
            </Typography>
            <Typography color="text.secondary" sx={{ mt: 1, mb: 4, maxWidth: 420 }}>
                The page you are looking for does not exist or has been moved.
            </Typography>
            <Button
                variant="contained"
                size="large"
                component={RouterLink}
                to={isAuthenticated ? '/home' : '/'}
            >
                {isAuthenticated ? 'Back to my dashboard' : 'Back to home'}
            </Button>
        </Box>
    );
}
