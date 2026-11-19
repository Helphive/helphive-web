import { useNavigate } from 'react-router-dom';
import { Button, CircularProgress } from '@mui/material';
import { HourglassTop, Refresh } from '@mui/icons-material';
import dayjs from 'dayjs';
import { useGetAccountApprovalScreenQuery } from '@/features/provider/providerApi';
import { useAppDispatch } from '@/store/hooks';
import { updateUser } from '@/features/auth/authSlice';
import { useSnackbar } from '@/components/feedback/snackbarContext';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import StatusScreen from './components/StatusScreen';

export default function AccountPending() {
    useDocumentTitle('Application under review');
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const snackbar = useSnackbar();
    const { data, refetch, isFetching } = useGetAccountApprovalScreenQuery();

    const handleRefresh = async () => {
        const result = await refetch();
        if (result.data?.status === 'approved') {
            // Update user state so routing works correctly
            dispatch(updateUser({ providerStatus: 'approved' }));
            navigate('/provider');
        } else if (result.data?.status === 'rejected') {
            dispatch(updateUser({ providerStatus: 'rejected' }));
            navigate('/provider/rejected');
        } else if (result.isError) {
            snackbar.error('Could not check your status. Try again in a moment.');
        } else {
            snackbar.notify('Your application is still under review.', 'info');
        }
    };

    return (
        <StatusScreen
            tone="amber"
            statusLabel="In review"
            icon={<HourglassTop />}
            title="Application under review"
            description={
                data?.createdAt
                    ? `We received your application on ${dayjs(data.createdAt).format('D MMM YYYY')}. Reviews usually take 1-2 business days.`
                    : 'Your provider application is being reviewed by our team. This usually takes 1-2 business days.'
            }
            next={[
                'Our team checks your documents and details.',
                "We notify you once a decision has been made. You don't need to do anything else.",
                'When you are approved, you can switch on availability and accept orders.',
            ]}
            actions={
                <Button
                    variant="contained"
                    startIcon={
                        isFetching ? <CircularProgress size={16} color="inherit" /> : <Refresh />
                    }
                    onClick={() => void handleRefresh()}
                    disabled={isFetching}
                >
                    {isFetching ? 'Checking' : 'Check status'}
                </Button>
            }
        />
    );
}
