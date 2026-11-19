import { Box, Typography } from '@mui/material';
import { color, font, hairlineStrong, radius } from '@/theme/tokens';
import { DotsBackdrop } from './Backdrops';
import { Section, SectionHead } from './Section';

const STEPS = [
    { title: 'Choose a service', description: 'Pick the role you need for the shift.' },
    {
        title: 'Set the shift',
        description: 'Date, start time, hours, hourly rate, and location.',
    },
    {
        title: 'Pay securely',
        description: 'Stripe-powered payments keep bookings and provider payouts organized.',
    },
    {
        title: 'Follow the status',
        description: 'Track the booking from accepted to in progress to completed.',
    },
];

export default function HowItWorks() {
    return (
        <Section
            id="how-it-works"
            aria-labelledby="how-title"
            decoration={<DotsBackdrop focus="100% 0%" />}
        >
            <SectionHead
                id="how-title"
                title="How it works"
                description="From request to close, every booking moves through the same clear steps."
            />
            <Box
                component="ol"
                sx={{
                    listStyle: 'none',
                    p: 0,
                    m: 0,
                    display: 'grid',
                    gridTemplateColumns: {
                        xs: '1fr',
                        sm: 'repeat(2, minmax(0, 1fr))',
                        md: 'repeat(4, minmax(0, 1fr))',
                    },
                    gap: { xs: 3, md: 3 },
                    rowGap: 4,
                }}
            >
                {STEPS.map((step, index) => (
                    <Box component="li" key={step.title} sx={{ borderTop: hairlineStrong, pt: 2 }}>
                        <Box
                            aria-hidden="true"
                            sx={{
                                display: 'grid',
                                placeItems: 'center',
                                width: 24,
                                height: 24,
                                mb: 1.5,
                                borderRadius: `${radius.sm}px`,
                                bgcolor: color.ink900,
                                color: color.surface,
                                fontSize: font.size.xs,
                                fontWeight: 700,
                            }}
                        >
                            {index + 1}
                        </Box>
                        <Typography variant="h6" component="h3">
                            {step.title}
                        </Typography>
                        <Typography color="text.secondary" sx={{ mt: 0.5 }}>
                            {step.description}
                        </Typography>
                    </Box>
                ))}
            </Box>
        </Section>
    );
}
