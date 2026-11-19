import { Link as RouterLink } from 'react-router-dom';
import { Box, Button, Link, Typography } from '@mui/material';
import { ArrowForward } from '@mui/icons-material';
import { ServiceIcon } from '@/components/ui';
import { SERVICES } from '@/types';
import { color, font, hairline, radius } from '@/theme/tokens';
import { DotsBackdrop } from './Backdrops';
import { revealChild } from './motion';
import { Section, SectionHead } from './Section';

// Room Attendant first, as in the booking flow.
const ORDER = [2, 1, 3];
const services = ORDER.map((id) => SERVICES.find((s) => s.id === id)).filter(
    (s): s is (typeof SERVICES)[number] => Boolean(s)
);

export default function Services() {
    return (
        <Section
            id="services"
            tone="canvas"
            aria-labelledby="services-title"
            decoration={<DotsBackdrop focus="0% 100%" />}
        >
            <Box
                sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 5fr) minmax(0, 7fr)' },
                    gap: { xs: 1, md: 8 },
                    alignItems: 'start',
                }}
            >
                <Box sx={{ position: { md: 'sticky' }, top: { md: 120 } }}>
                    <SectionHead
                        id="services-title"
                        title="Three roles, booked by the hour"
                        description="Pick the role, then set the date, start time, hours and the hourly rate you want to pay. Providers choose the roles they are qualified for when they apply."
                        sx={{ mb: { xs: 3, md: 4 } }}
                    />
                    <Button
                        component={RouterLink}
                        to="/signup"
                        variant="contained"
                        size="large"
                        endIcon={<ArrowForward />}
                        data-reveal=""
                        sx={{ display: { xs: 'none', md: 'inline-flex' } }}
                    >
                        Book a service
                    </Button>
                </Box>

                <Box
                    component="ul"
                    data-reveal=""
                    aria-label="Services"
                    sx={{
                        listStyle: 'none',
                        p: 0,
                        m: 0,
                        bgcolor: color.surface,
                        border: hairline,
                        borderRadius: `${radius.lg}px`,
                    }}
                >
                    {services.map((service, index) => (
                        <Box
                            component="li"
                            key={service.id}
                            {...revealChild(index)}
                            sx={{
                                display: 'grid',
                                gridTemplateColumns: {
                                    xs: '48px minmax(0, 1fr)',
                                    sm: '64px minmax(0, 1fr) auto',
                                },
                                columnGap: { xs: 2, sm: 3 },
                                rowGap: 1.5,
                                alignItems: 'center',
                                px: { xs: 2.5, sm: 4 },
                                py: { xs: 3, sm: 4 },
                                '& + &': { borderTop: hairline },
                            }}
                        >
                            <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
                                <ServiceIcon serviceId={service.id} variant="tile" size={64} />
                            </Box>
                            <Box sx={{ display: { xs: 'block', sm: 'none' } }}>
                                <ServiceIcon serviceId={service.id} variant="tile" size={48} />
                            </Box>
                            <Box sx={{ minWidth: 0 }}>
                                <Typography
                                    variant="h4"
                                    component="h3"
                                    sx={{ fontSize: { xs: font.size.xl, sm: font.size['2xl'] } }}
                                >
                                    {service.name}
                                </Typography>
                                <Typography color="text.secondary" sx={{ mt: 0.5 }}>
                                    {service.description}
                                </Typography>
                            </Box>
                            <Link
                                component={RouterLink}
                                to="/signup"
                                sx={{
                                    gridColumn: { xs: '2', sm: 'auto' },
                                    justifySelf: 'start',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: 0.5,
                                    fontSize: font.size.md,
                                    fontWeight: 700,
                                    color: color.coral700,
                                    whiteSpace: 'nowrap',
                                }}
                            >
                                Book a {service.name.toLowerCase()}
                                <ArrowForward sx={{ fontSize: 16 }} aria-hidden="true" />
                            </Link>
                        </Box>
                    ))}
                </Box>
            </Box>
        </Section>
    );
}
