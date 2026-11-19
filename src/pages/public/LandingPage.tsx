import { useEffect, useRef, useState } from 'react';
import { Box } from '@mui/material';
import { useSnackbar } from '@/components/feedback/snackbarContext';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { color } from '@/theme/tokens';
import AndroidInstallDialog from './landing/AndroidInstallDialog';
import AppDownload from './landing/AppDownload';
import { ForProviders, ForTeams } from './landing/Audiences';
import ClosingCta from './landing/ClosingCta';
import Faq from './landing/Faq';
import Hero from './landing/Hero';
import HowItWorks from './landing/HowItWorks';
import LandingFooter from './landing/LandingFooter';
import LandingHeader from './landing/LandingHeader';
import { revealStyles, useReveal } from './landing/motion';
import Services from './landing/Services';
import StayInTouch from './landing/StayInTouch';
import { IOS_UNAVAILABLE_MESSAGE, triggerAndroidDownload } from './landing/constants';

export default function LandingPage() {
    useDocumentTitle('Book reliable hospitality help');
    const snackbar = useSnackbar();
    const [installOpen, setInstallOpen] = useState(false);
    const rootRef = useRef<HTMLDivElement>(null);
    useReveal(rootRef);

    // Arriving with a #section in the URL: land on it once the page has rendered.
    useEffect(() => {
        const id = window.location.hash.slice(1);
        if (id) document.getElementById(id)?.scrollIntoView({ block: 'start' });
    }, []);

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
        <Box
            ref={rootRef}
            sx={{ minHeight: '100vh', bgcolor: color.surface, overflowX: 'clip', ...revealStyles }}
        >
            <LandingHeader />
            <main>
                <Hero />
                <Services />
                <HowItWorks />
                <ForTeams />
                <ForProviders />
                <StayInTouch />
                <AppDownload onAndroid={handleAndroidDownload} onIos={handleIosUnavailable} />
                <Faq />
                <ClosingCta />
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
