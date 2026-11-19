import { Link as RouterLink } from 'react-router-dom';
import { Box, Button, Link, Typography } from '@mui/material';
import { LogoMark } from '@/components/ui';
import { demoLoginPath } from '@/features/auth/demoAccounts';
import { color, font } from '@/theme/tokens';
import { HoneycombBackdrop } from './Backdrops';
import { Section } from './Section';
import { ForwardIcon } from '@/components/ui/icons';

const demo = { color: color.coral700, fontWeight: 700 };

/** Closing call to action: centred, on the canvas with the hive behind it. */
export default function ClosingCta() {
    return (
        <Section
            tone="canvas"
            aria-labelledby="cta-title"
            decoration={<HoneycombBackdrop focus="50% 50%" />}
            sx={{ py: { xs: 8, md: 12 }, textAlign: 'center' }}
        >
            <Box data-reveal="">
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
                    <LogoMark size={56} />
                </Box>
                <Typography
                    id="cta-title"
                    variant="h2"
                    sx={{
                        mx: 'auto',
                        maxWidth: '16ch',
                        fontSize: font.size['4xl'],
                        letterSpacing: font.tracking.display,
                        lineHeight: 1.1,
                        textWrap: 'balance',
                    }}
                >
                    Your next shift, covered.
                </Typography>
                <Typography
                    color="text.secondary"
                    sx={{
                        mt: 2,
                        mx: 'auto',
                        maxWidth: '46ch',
                        fontSize: { xs: font.size.lg, md: font.size.xl },
                    }}
                >
                    Create an account to book hospitality help, or apply to take on work as a
                    provider.
                </Typography>
                <Box
                    sx={{
                        mt: 4,
                        display: 'flex',
                        flexDirection: { xs: 'column', sm: 'row' },
                        justifyContent: 'center',
                        gap: 1.5,
                    }}
                >
                    <Button
                        component={RouterLink}
                        to="/signup"
                        variant="contained"
                        size="large"
                        endIcon={<ForwardIcon />}
                    >
                        Book a service
                    </Button>
                    <Button
                        component={RouterLink}
                        to="/provider-signup"
                        variant="outlined"
                        size="large"
                        sx={{ bgcolor: color.surface }}
                    >
                        Become a provider
                    </Button>
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 2.5 }}>
                    Just looking? Try the demo as a{' '}
                    <Link component={RouterLink} to={demoLoginPath('user')} sx={demo}>
                        customer
                    </Link>{' '}
                    or a{' '}
                    <Link component={RouterLink} to={demoLoginPath('provider')} sx={demo}>
                        provider
                    </Link>
                    .
                </Typography>
            </Box>
        </Section>
    );
}
