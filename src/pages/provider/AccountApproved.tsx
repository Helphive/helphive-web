import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert, Button, CircularProgress } from '@mui/material';
import { CheckCircleOutline } from '@mui/icons-material';
import { useMarkApprovalScreenSeenMutation } from '@/features/provider/providerApi';
import { useAppDispatch } from '@/store/hooks';
import { updateUser } from '@/features/auth/authSlice';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import StatusScreen from './components/StatusScreen';

export default function AccountApproved() {
    useDocumentTitle('Application approved');
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
            setError('Something went wrong. Try again.');
        }
    };

    return (
        <StatusScreen
            tone="green"
            statusLabel="Approved"
            icon={<CheckCircleOutline />}
            title="You are approved"
            description="Your provider profile has been approved. You can start accepting jobs from hotels and venues today."
            notice={error ? <Alert severity="error">{error}</Alert> : undefined}
            nextTitle="Get started"
            next={[
                'Switch on availability on your dashboard and choose the services you provide.',
                'Browse available orders and accept the ones that fit your day.',
                'Set up payouts under Earnings so you can withdraw what you earn.',
            ]}
            actions={
                <Button
                    variant="contained"
                    size="large"
                    onClick={() => void handleBeginJourney()}
                    disabled={isLoading}
                    startIcon={
                        isLoading ? <CircularProgress size={16} color="inherit" /> : undefined
                    }
                >
                    Go to my dashboard
                </Button>
            }
        />
    );
}
