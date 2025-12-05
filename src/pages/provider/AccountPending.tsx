import { useNavigate } from 'react-router-dom';
import { Box, Typography, Card, CardContent, Button } from '@mui/material';
import { HourglassTop, Refresh } from '@mui/icons-material';
import { useGetAccountApprovalScreenQuery } from '@/features/provider/providerApi';

export default function AccountPending() {
    const navigate = useNavigate();
    const { refetch, isFetching } = useGetAccountApprovalScreenQuery();

    const handleRefresh = async () => {
        const result = await refetch();
        if (result.data?.status === 'approved') {
            navigate('/provider');
        } else if (result.data?.status === 'rejected') {
            navigate('/provider/rejected');
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
                    <HourglassTop sx={{ fontSize: 80, color: 'warning.main', mb: 3 }} />
                    <Typography variant="h4" fontWeight={700} sx={{ mb: 2 }}>
                        Application Under Review
                    </Typography>
                    <Typography color="text.secondary" sx={{ mb: 4 }}>
                        Your provider application is being reviewed by our team. This usually takes
                        1-2 business days. We'll notify you once a decision has been made.
                    </Typography>
                    <Button
                        variant="contained"
                        startIcon={<Refresh />}
                        onClick={handleRefresh}
                        disabled={isFetching}
                        sx={{ px: 4 }}
                    >
                        {isFetching ? 'Checking...' : 'Check Status'}
                    </Button>
                </CardContent>
            </Card>
        </Box>
    );
}
