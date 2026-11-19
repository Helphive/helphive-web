import { Link as RouterLink } from 'react-router-dom';
import { Box, Button, Link, Stack, Typography } from '@mui/material';
import { demoLoginPath } from '@/features/auth/demoAccounts';
import { HoneycombBackdrop } from './Backdrops';
import { ArrowForward, Check } from '@mui/icons-material';
import { color, font, hairline } from '@/theme/tokens';
import BookingTicket from './BookingTicket';
import { HEADER_HEIGHT } from './constants';
import { Section } from './Section';

const FACTS = ['Verified providers', 'Stripe-powered payments', 'Live job status'];

export default function Hero() {
    return (
        // Pulled up under the transparent sticky header so the hive runs to the top of the page.
        <Box sx={{ mt: `-${HEADER_HEIGHT}px` }}>
            <Section
                bordered={false}
                aria-labelledby="hero-title"
                decoration={<HoneycombBackdrop />}
                sx={{
                    pt: { xs: `${HEADER_HEIGHT + 40}px`, md: `${HEADER_HEIGHT + 80}px` },
                    pb: { xs: 7, md: 12 },
                }}
            >
                <Box
                    sx={{
                        display: 'grid',
                        gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 1.05fr) minmax(0, 1fr)' },
                        gap: { xs: 5, md: 8 },
                        alignItems: 'center',
                    }}
                >
                    <Box sx={{ minWidth: 0 }}>
                        <Box
                            sx={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 1,
                                mb: 3,
                                fontSize: font.size.sm,
                                fontWeight: 600,
                                color: color.ink600,
                                '&::before': {
                                    content: '""',
                                    width: 8,
                                    height: 8,
                                    borderRadius: '2px',
                                    bgcolor: color.coral500,
                                    flex: 'none',
                                },
                            }}
                        >
                            Hospitality staffing without the spreadsheet chaos
                        </Box>
                        <Typography
                            id="hero-title"
                            variant="h1"
                            component="h1"
                            sx={{ maxWidth: '13ch' }}
                        >
                            Book reliable hospitality help in minutes.
                        </Typography>
                        <Typography
                            color="text.secondary"
                            sx={{
                                mt: 2.5,
                                maxWidth: '46ch',
                                fontSize: { xs: font.size.lg, sm: font.size.xl },
                                lineHeight: 1.5,
                            }}
                        >
                            HelpHive connects hotels, venues, and operations teams with vetted room
                            attendants, public area attendants, and linen porters.
                        </Typography>
                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ mt: 4 }}>
                            <Button
                                component={RouterLink}
                                to="/signup"
                                variant="contained"
                                size="large"
                                endIcon={<ArrowForward />}
                            >
                                Book a service
                            </Button>
                            <Button
                                component={RouterLink}
                                to="/provider-signup"
                                variant="outlined"
                                size="large"
                            >
                                Become a provider
                            </Button>
                        </Stack>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                            Just looking? Try the demo as a{' '}
                            <Link
                                component={RouterLink}
                                to={demoLoginPath('user')}
                                sx={{ color: color.coral700 }}
                            >
                                customer
                            </Link>{' '}
                            or a{' '}
                            <Link
                                component={RouterLink}
                                to={demoLoginPath('provider')}
                                sx={{ color: color.coral700 }}
                            >
                                provider
                            </Link>
                            .
                        </Typography>
                        <Box
                            component="ul"
                            aria-label="Why HelpHive"
                            sx={{
                                listStyle: 'none',
                                p: 0,
                                m: 0,
                                mt: 4,
                                pt: 2.5,
                                borderTop: hairline,
                                display: 'flex',
                                flexWrap: 'wrap',
                                columnGap: 3,
                                rowGap: 1,
                            }}
                        >
                            {FACTS.map((fact) => (
                                <Box
                                    component="li"
                                    key={fact}
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 0.75,
                                        fontSize: font.size.sm,
                                        fontWeight: 600,
                                        color: color.ink700,
                                    }}
                                >
                                    <Check sx={{ fontSize: 16, color: color.green700 }} />
                                    {fact}
                                </Box>
                            ))}
                        </Box>
                    </Box>
                    <BookingTicket />
                </Box>
            </Section>
        </Box>
    );
}
