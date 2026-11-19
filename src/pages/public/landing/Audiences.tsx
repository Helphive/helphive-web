import type { ReactNode } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Box, Button, Link, Typography } from '@mui/material';
import { demoLoginPath } from '@/features/auth/demoAccounts';
import { color, font, hairline, radius } from '@/theme/tokens';
import { HoneycombBackdrop, InkBackdrop } from './Backdrops';
import { revealChild } from './motion';
import PhoneImage from './PhoneImage';
import { Section, SectionHead } from './Section';
import { toneMuted, type SectionTone } from './tones';
import { CheckMarkIcon, ForwardIcon } from '@/components/ui/icons';

interface Point {
    title: string;
    text: string;
}

function Points({ points, tone }: { points: Point[]; tone: SectionTone }) {
    const dark = tone === 'ink';
    return (
        <Box
            component="ul"
            data-reveal=""
            sx={{ listStyle: 'none', p: 0, m: 0, display: 'grid', gap: 2.5 }}
        >
            {points.map((point, index) => (
                <Box
                    component="li"
                    key={point.title}
                    {...revealChild(index)}
                    sx={{ display: 'grid', gridTemplateColumns: '28px minmax(0, 1fr)', gap: 1.5 }}
                >
                    <Box
                        aria-hidden="true"
                        sx={{
                            width: 28,
                            height: 28,
                            display: 'grid',
                            placeItems: 'center',
                            borderRadius: `${radius.sm}px`,
                            bgcolor: dark ? color.ink700 : color.coral50,
                            color: dark ? color.coral100 : color.coral700,
                        }}
                    >
                        <CheckMarkIcon sx={{ fontSize: 18 }} />
                    </Box>
                    <Box>
                        <Typography sx={{ fontWeight: 700, color: 'inherit' }}>
                            {point.title}
                        </Typography>
                        <Typography sx={{ mt: 0.25, color: toneMuted(tone) }}>
                            {point.text}
                        </Typography>
                    </Box>
                </Box>
            ))}
        </Box>
    );
}

function Actions({ children }: { children: ReactNode }) {
    return (
        <Box
            data-reveal=""
            sx={{
                mt: { xs: 4, md: 5 },
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                columnGap: 3,
                rowGap: 2,
            }}
        >
            {children}
        </Box>
    );
}

const demoLink = (dark: boolean) => ({
    display: 'inline-flex',
    alignItems: 'center',
    gap: 0.5,
    fontWeight: 700,
    fontSize: font.size.md,
    color: dark ? color.coral100 : color.coral700,
});

/** For operations teams: the booking-details phone on a framed honeycomb stage, copy on the right. */
export function ForTeams() {
    return (
        <Section id="teams" tone="canvas" aria-labelledby="teams-title">
            <Box
                sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 5fr) minmax(0, 6fr)' },
                    gap: { xs: 5, md: 10 },
                    alignItems: 'center',
                }}
            >
                <Box
                    data-reveal=""
                    sx={{
                        order: { xs: 2, md: 1 },
                        position: 'relative',
                        overflow: 'hidden',
                        display: 'grid',
                        placeItems: 'center',
                        py: { xs: 5, md: 7 },
                        bgcolor: color.surface,
                        border: hairline,
                        borderRadius: `${radius.lg}px`,
                    }}
                >
                    <HoneycombBackdrop focus="50% 55%" />
                    <PhoneImage
                        screen="booking-details"
                        sx={{ width: { xs: 210, sm: 240, md: 260 } }}
                    />
                </Box>
                <Box sx={{ order: { xs: 1, md: 2 } }}>
                    <SectionHead
                        id="teams-title"
                        title="For operations teams"
                        description="Fill short-notice hospitality shifts without chasing calls and spreadsheets. Every booking keeps its people, status and payment in one record."
                        sx={{ mb: { xs: 3.5, md: 4.5 } }}
                    />
                    <Points
                        tone="canvas"
                        points={[
                            {
                                title: 'Book by role and shift',
                                text: 'Set the date, start time, hours and your hourly rate.',
                            },
                            {
                                title: 'Know who is coming',
                                text: 'See which provider accepted and where each booking stands.',
                            },
                            {
                                title: 'Approve the start',
                                text: 'The provider asks to start the job; you approve it from the booking.',
                            },
                        ]}
                    />
                    <Actions>
                        <Button
                            component={RouterLink}
                            to="/signup"
                            variant="contained"
                            size="large"
                            endIcon={<ForwardIcon />}
                        >
                            Book a service
                        </Button>
                        <Link
                            component={RouterLink}
                            to={demoLoginPath('user')}
                            sx={demoLink(false)}
                        >
                            Try the demo customer
                        </Link>
                    </Actions>
                </Box>
            </Box>
        </Section>
    );
}

/** For providers: the deep ink section, copy on the left, provider-home phone lit on the right. */
export function ForProviders() {
    return (
        <Section
            id="providers"
            tone="ink"
            aria-labelledby="providers-title"
            decoration={<InkBackdrop focus="78% 45%" />}
        >
            <Box
                sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 6fr) minmax(0, 5fr)' },
                    gap: { xs: 6, md: 10 },
                    alignItems: 'center',
                }}
            >
                <Box>
                    <SectionHead
                        id="providers-title"
                        tone="ink"
                        title="For providers: pick up work that fits your day"
                        description="Room attendants, public area attendants and linen porters keep upcoming work, completed jobs and earnings in one place."
                        maxWidth="18ch"
                        sx={{ mb: { xs: 3.5, md: 4.5 } }}
                    />
                    <Points
                        tone="ink"
                        points={[
                            {
                                title: 'Apply once',
                                text: 'Add a profile photo, ID document, DBS certificate and CV. Our team reviews applications, which can take up to 3 business days.',
                            },
                            {
                                title: 'Choose your roles',
                                text: 'Offer the work you are qualified to do, then accept open orders.',
                            },
                            {
                                title: 'Get paid through Stripe',
                                text: 'Earnings are released when a job is completed. Withdraw them to the bank account you connect.',
                            },
                        ]}
                    />
                    <Actions>
                        <Button
                            component={RouterLink}
                            to="/provider-signup"
                            variant="contained"
                            size="large"
                            endIcon={<ForwardIcon />}
                        >
                            Become a provider
                        </Button>
                        <Link
                            component={RouterLink}
                            to={demoLoginPath('provider')}
                            sx={demoLink(true)}
                        >
                            Try the demo provider
                        </Link>
                    </Actions>
                </Box>
                <Box data-reveal="" sx={{ display: 'grid', placeItems: 'center' }}>
                    <PhoneImage
                        screen="provider-home"
                        sx={{
                            width: { xs: 220, sm: 250, md: 290 },
                            '&::after': { opacity: 0.9 },
                        }}
                    />
                </Box>
            </Box>
        </Section>
    );
}
