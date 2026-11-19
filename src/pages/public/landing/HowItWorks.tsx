import { Box, Typography } from '@mui/material';
import { ShiftRuler } from '@/components/ui';
import { color, font, hairline, hairlineStrong, radius } from '@/theme/tokens';
import { DotsBackdrop } from './Backdrops';
import { revealChild } from './motion';
import { Section, SectionHead } from './Section';

const STEPS = [
    {
        title: 'Choose a service',
        description: 'A room attendant, a public area attendant or a linen porter.',
    },
    {
        title: 'Set the shift',
        description: 'Date, start time, hours, hourly rate and the address.',
    },
    {
        title: 'Pay by card',
        description: 'Payments are processed securely by Stripe when you book.',
    },
    {
        title: 'Follow it through',
        description:
            'See when a provider accepts, approve the job start, then watch it reach completed.',
    },
];

const NODE = 28;
const RAIL = 8;
const ease = 'cubic-bezier(0.2, 0.7, 0.2, 1)';

/** The four booking steps strung on a rail drawn like the shift ruler. */
function StepRail() {
    const railBase = {
        content: '""',
        position: 'absolute',
        borderRadius: `${radius.pill}px`,
        pointerEvents: 'none',
    } as const;
    return (
        <Box
            component="ol"
            data-reveal=""
            sx={{
                listStyle: 'none',
                m: 0,
                p: 0,
                position: 'relative',
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', md: 'repeat(4, minmax(0, 1fr))' },
                columnGap: 4,
                rowGap: 4,
                pl: { xs: `${NODE + 20}px`, md: 0 },
                pt: { xs: 0, md: `${NODE + 24}px` },
                // The rail: hairline track with hour-like ticks.
                '&::before': {
                    ...railBase,
                    bgcolor: color.subtle,
                    border: hairlineStrong,
                    backgroundImage: {
                        xs: `repeating-linear-gradient(to bottom, transparent 0 23px, ${color.lineStrong} 23px 24px)`,
                        md: `repeating-linear-gradient(to right, transparent 0 39px, ${color.lineStrong} 39px 40px)`,
                    },
                    top: { xs: NODE / 2, md: (NODE - RAIL) / 2 },
                    bottom: { xs: NODE / 2, md: 'auto' },
                    left: { xs: (NODE - RAIL) / 2, md: NODE / 2 },
                    right: { xs: 'auto', md: 0 },
                    width: { xs: RAIL, md: 'auto' },
                    height: { xs: 'auto', md: RAIL },
                },
                // The coral fill, drawn along the rail as the section arrives.
                '&::after': {
                    ...railBase,
                    bgcolor: color.coral500,
                    top: { xs: NODE / 2, md: (NODE - RAIL) / 2 },
                    bottom: { xs: NODE / 2, md: 'auto' },
                    left: { xs: (NODE - RAIL) / 2, md: NODE / 2 },
                    // Ends at the fourth node: its column starts at 75% + 24px of the rail.
                    right: { xs: 'auto', md: `calc(25% - ${24 + NODE / 2}px)` },
                    width: { xs: RAIL, md: 'auto' },
                    height: { xs: 'auto', md: RAIL },
                    transformOrigin: { xs: 'top', md: 'left' },
                    transition: `transform 1100ms ${ease} 250ms`,
                },
                '&[data-reveal="hidden"]::after': {
                    transform: { xs: 'scaleY(0)', md: 'scaleX(0)' },
                },
                '@media (prefers-reduced-motion: reduce)': {
                    '&::after': { transition: 'none', transform: 'none' },
                },
            }}
        >
            {STEPS.map((step, index) => (
                <Box
                    component="li"
                    key={step.title}
                    {...revealChild(index + 1)}
                    sx={{ position: 'relative', minWidth: 0 }}
                >
                    <Box
                        aria-hidden="true"
                        sx={{
                            position: 'absolute',
                            zIndex: 1,
                            top: { xs: 0, md: -(NODE + 24) },
                            left: { xs: -(NODE + 20), md: 0 },
                            width: NODE,
                            height: NODE,
                            display: 'grid',
                            placeItems: 'center',
                            borderRadius: `${radius.sm}px`,
                            bgcolor: color.ink900,
                            color: color.surface,
                            boxShadow: `0 0 0 4px ${color.surface}`,
                            fontSize: font.size.sm,
                            fontWeight: 800,
                        }}
                    >
                        {index + 1}
                    </Box>
                    <Typography variant="h5" component="h3" sx={{ lineHeight: `${NODE}px` }}>
                        {step.title}
                    </Typography>
                    <Typography color="text.secondary" sx={{ mt: 0.75, maxWidth: '30ch' }}>
                        {step.description}
                    </Typography>
                </Box>
            ))}
        </Box>
    );
}

export default function HowItWorks() {
    return (
        <Section
            id="how-it-works"
            aria-labelledby="how-title"
            decoration={<DotsBackdrop focus="100% 0%" />}
        >
            <SectionHead
                id="how-title"
                title="From request to completed, in four steps"
                description="Every booking moves through the same clear stages, so you always know where a shift stands."
                maxWidth="20ch"
            />
            <StepRail />
            <Box
                data-reveal=""
                sx={{
                    mt: { xs: 6, md: 9 },
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 4fr) minmax(0, 8fr)' },
                    gap: { xs: 2.5, md: 5 },
                    alignItems: 'center',
                    p: { xs: 2.5, md: 4 },
                    bgcolor: color.subtle,
                    border: hairline,
                    borderRadius: `${radius.lg}px`,
                }}
            >
                <Box>
                    <Typography variant="h5" component="h3">
                        The whole shift, at a glance
                    </Typography>
                    <Typography color="text.secondary" sx={{ mt: 0.75 }}>
                        Bookings show their hours on a ruler, from the booking form to a
                        provider&apos;s day.
                    </Typography>
                </Box>
                <ShiftRuler
                    aria-label="Example day: a room attendant from 08:00 to 14:00 and a linen porter from 15:00 to 19:00"
                    blocks={[
                        { start: 8, end: 14, label: 'Room Attendant', tone: 'coral' },
                        { start: 15, end: 19, label: 'Linen Porter', tone: 'ink' },
                    ]}
                    from={6}
                    to={22}
                    fixed
                />
            </Box>
        </Section>
    );
}
