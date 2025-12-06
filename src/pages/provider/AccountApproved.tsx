import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Card, CardContent, Button, CircularProgress, Alert } from '@mui/material';
import { CheckCircle } from '@mui/icons-material';
import { useMarkApprovalScreenSeenMutation } from '@/features/provider/providerApi';
import { useAppDispatch } from '@/store/hooks';
import { updateUser } from '@/features/auth/authSlice';

export default function AccountApproved() {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const [markSeen, { isLoading }] = useMarkApprovalScreenSeenMutation();
    const [error, setError] = useState<string | null>(null);

    const handleBeginJourney = async () => {
        try {
            setError(null);
            await markSeen().unwrap();
            // Update user state so they don't see this screen again
            dispatch(updateUser({ providerAccountApproval: true }));
            navigate('/provider');
        } catch {
            setError('An error occurred. Please try again.');
        }
    };

    return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: 'background.default',
                p: 3,
            }}
        >
            <Card sx={{ maxWidth: 500, textAlign: 'center' }}>
                <CardContent sx={{ py: 6 }}>
                    <Box
                        sx={{
                            width: 100,
                            height: 100,
                            borderRadius: '50%',
                            bgcolor: 'success.light',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            mx: 'auto',
                            mb: 3,
                        }}
                    >
                        <CheckCircle sx={{ fontSize: 60, color: 'success.main' }} />
                    </Box>
                    <Typography variant="h4" fontWeight={700} sx={{ mb: 2 }}>
                        Congratulations!
                    </Typography>
                    <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                        Your profile has been approved!
                    </Typography>
                    <Typography color="text.secondary" sx={{ mb: 4 }}>
                        Start accepting opportunities and connect with hotels in need today!
                    </Typography>
                    {error && (
                        <Alert severity="error" sx={{ mb: 3 }}>
                            {error}
                        </Alert>
                    )}
                    <Button
                        variant="contained"
                        size="large"
                        onClick={handleBeginJourney}
                        disabled={isLoading}
                        sx={{ px: 6 }}
                    >
                        {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Begin Your Journey'}
                    </Button>
                </CardContent>
            </Card>
        </Box>
    );
}
