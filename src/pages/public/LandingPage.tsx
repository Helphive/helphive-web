import { useState } from 'react';
import { Box } from '@mui/material';
import { useSnackbar } from '@/components/feedback/snackbarContext';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { color } from '@/theme/tokens';
import Audiences from './landing/Audiences';
import AndroidInstallDialog from './landing/AndroidInstallDialog';
import AppDownload from './landing/AppDownload';
import Hero from './landing/Hero';
import HowItWorks from './landing/HowItWorks';
import LandingFooter from './landing/LandingFooter';
import LandingHeader from './landing/LandingHeader';
import Services from './landing/Services';
import { IOS_UNAVAILABLE_MESSAGE, triggerAndroidDownload } from './landing/constants';

export default function LandingPage() {
    useDocumentTitle('Book reliable hospitality help');
    const snackbar = useSnackbar();
    const [installOpen, setInstallOpen] = useState(false);

    const handleAndroidDownload = () => {
        triggerAndroidDownload();
        setInstallOpen(true);
        snackbar.success('Android download started. Check your downloads when it finishes.');
    };

    const handleIosUnavailable = () => snackbar.notify(IOS_UNAVAILABLE_MESSAGE, 'warning');

    const handleRetry = () => {
        triggerAndroidDownload();
        snackbar.notify('Retrying the Android download.', 'info');
    };

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: color.surface }}>
            <LandingHeader />
            <main>
                <Hero />
                <Services />
                <HowItWorks />
                <Audiences />
                <AppDownload onAndroid={handleAndroidDownload} onIos={handleIosUnavailable} />
            </main>
            <LandingFooter onAndroid={handleAndroidDownload} onIos={handleIosUnavailable} />
            <AndroidInstallDialog
                open={installOpen}
                onClose={() => setInstallOpen(false)}
                onRetry={handleRetry}
            />
        </Box>
    );
}
