import { Box, Typography } from '@mui/material';
import { hairline } from '@/theme/tokens';
import { IOS_UNAVAILABLE_MESSAGE } from './constants';
import { revealChild } from './motion';
import { Section, SectionHead } from './Section';

// Every answer here describes the product as built (booking payment, provider onboarding,
// job start approval, payouts). Check the code before changing one.
const QUESTIONS = [
    {
        q: 'How do I pay for a booking?',
        a: 'By card, when you book. Payments are processed securely by Stripe.',
    },
    {
        q: 'How are providers checked?',
        a: 'Providers apply with a profile photo, an ID document, a DBS certificate and a CV. Our team reviews each application, usually within 1 to 2 business days, and only approved providers can accept orders.',
    },
    {
        q: 'How does a job start?',
        a: 'When the provider is ready, they ask to start the job. You approve the start from the booking, and the status moves to in progress.',
    },
    {
        q: 'How do providers get paid?',
        a: 'Earnings stay pending until the job is completed. Providers then withdraw their available balance to the bank account they connect through Stripe.',
    },
    {
        q: 'Is there a mobile app?',
        a: `Yes, for Android: download the APK from this page. ${IOS_UNAVAILABLE_MESSAGE}`,
    },
];

export default function Faq() {
    return (
        <Section id="faq" aria-labelledby="faq-title">
            <Box
                sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 4fr) minmax(0, 7fr)' },
                    gap: { xs: 0, md: 8 },
                    alignItems: 'start',
                }}
            >
                <SectionHead
                    id="faq-title"
                    title="Questions, answered"
                    description="How payment, provider checks and payouts work today."
                    maxWidth="12ch"
                />
                <Box component="dl" data-reveal="" sx={{ m: 0, borderTop: hairline }}>
                    {QUESTIONS.map((item, index) => (
                        <Box
                            key={item.q}
                            {...revealChild(index)}
                            sx={{ py: { xs: 2.5, md: 3 }, borderBottom: hairline }}
                        >
                            <Typography component="dt" variant="h5">
                                {item.q}
                            </Typography>
                            <Typography
                                component="dd"
                                color="text.secondary"
                                sx={{ m: 0, mt: 1, maxWidth: '62ch' }}
                            >
                                {item.a}
                            </Typography>
                        </Box>
                    ))}
                </Box>
            </Box>
        </Section>
    );
}
