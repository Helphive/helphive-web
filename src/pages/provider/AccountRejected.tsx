import { useNavigate } from 'react-router-dom';
import { Box, Typography, Card, CardContent, Button } from '@mui/material';
import { Cancel, Email } from '@mui/icons-material';
import { useGetAccountApprovalScreenQuery } from '@/features/provider/providerApi';

export default function AccountRejected() {
    const navigate = useNavigate();
    const { data } = useGetAccountApprovalScreenQuery();

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
                    <Cancel sx={{ fontSize: 80, color: 'error.main', mb: 3 }} />
                    <Typography variant="h4" fontWeight={700} sx={{ mb: 2 }}>
                        Application Not Approved
                    </Typography>
                    <Typography color="text.secondary" sx={{ mb: 2 }}>
                        Unfortunately, your provider application was not approved.
                    </Typography>
                    {data?.rejectReason && (
                        <Card variant="outlined" sx={{ mb: 4, bgcolor: 'error.50' }}>
                            <CardContent>
                                <Typography variant="body2" color="error.main">
                                    Reason: {data.rejectReason}
                                </Typography>
                            </CardContent>
                        </Card>
                    )}
                    <Typography color="text.secondary" sx={{ mb: 4 }}>
                        If you believe this was a mistake or have questions, please contact our
                        support team.
                    </Typography>
                    <Button
                        variant="contained"
                        startIcon={<Email />}
                        href="mailto:support@helphivenow.com"
                        sx={{ px: 4 }}
                    >
                        Contact Support
                    </Button>
                    <Button
                        variant="text"
                        onClick={() => navigate('/provider/onboarding')}
                        sx={{ display: 'block', mx: 'auto', mt: 2 }}
                    >
                        Resubmit Application
                    </Button>
                </CardContent>
            </Card>
        </Box>
    );
}
