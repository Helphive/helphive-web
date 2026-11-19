import { useNavigate } from 'react-router-dom';
import { Button } from '@mui/material';
import { Email, ErrorOutline } from '@mui/icons-material';
import { useGetAccountApprovalScreenQuery } from '@/features/provider/providerApi';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { Panel } from '@/components/ui';
import StatusScreen from './components/StatusScreen';
import { SUPPORT_EMAIL } from './constants';

export default function AccountRejected() {
    useDocumentTitle('Application not approved');
    const navigate = useNavigate();
    const { data } = useGetAccountApprovalScreenQuery();

    return (
        <StatusScreen
            tone="red"
            statusLabel="Not approved"
            icon={<ErrorOutline />}
            title="Application not approved"
            description="We could not approve your provider application this time. You can send a new application or ask our team about the decision."
            notice={
                data?.rejectReason ? (
                    <Panel title="Reason from our team">{data.rejectReason}</Panel>
                ) : undefined
            }
            nextTitle="What you can do"
            next={[
                'Check your documents and details against the reason above.',
                'Apply again with the corrected documents.',
                'If you think this was a mistake, contact our support team.',
            ]}
            actions={
                <>
                    <Button variant="contained" onClick={() => navigate('/provider/onboarding')}>
                        Apply again
                    </Button>
                    <Button
                        variant="outlined"
                        startIcon={<Email />}
                        href={`mailto:${SUPPORT_EMAIL}`}
                    >
                        Contact support
                    </Button>
                </>
            }
            support={false}
        />
    );
}
