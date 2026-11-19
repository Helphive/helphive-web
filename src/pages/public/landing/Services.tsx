import { Link as RouterLink } from 'react-router-dom';
import { Box, Link, Typography } from '@mui/material';
import { ServiceIcon } from '@/components/ui';
import { SERVICES } from '@/types';
import { color, font, hairline, radius } from '@/theme/tokens';
import { DotsBackdrop } from './Backdrops';
import { Section, SectionHead } from './Section';

// Room Attendant first, as in the booking flow mockup.
const ORDER = [2, 1, 3];
const services = ORDER.map((id) => SERVICES.find((s) => s.id === id)).filter(
    (s): s is (typeof SERVICES)[number] => Boolean(s)
);

export default function Services() {
    return (
        <Section
            id="services"
            aria-labelledby="services-title"
            bg={color.canvas}
            decoration={<DotsBackdrop focus="0% 100%" />}
        >
            <SectionHead
                id="services-title"
                title="Built for hospitality operations"
                description="Every service is tuned for the jobs HelpHive actually supports."
            />
            <Box
                component="ul"
                sx={{
                    listStyle: 'none',
                    p: 0,
                    m: 0,
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', md: 'repeat(3, minmax(0, 1fr))' },
                    border: hairline,
                    bgcolor: color.surface,
                    borderRadius: `${radius.md}px`,
                    overflow: 'hidden',
                }}
            >
                {services.map((service) => (
                    <Box
                        component="li"
                        key={service.id}
                        sx={{
                            p: { xs: 2.5, md: 3 },
                            display: 'grid',
                            gap: 1,
                            alignContent: 'start',
                            '&:not(:first-of-type)': {
                                borderTop: { xs: hairline, md: 0 },
                                borderLeft: { xs: 0, md: hairline },
                            },
                        }}
                    >
                        <Box sx={{ mb: 1 }}>
                            <ServiceIcon serviceId={service.id} variant="tile" />
                        </Box>
                        <Typography variant="h5" component="h3">
                            {service.name}
                        </Typography>
                        <Typography color="text.secondary">{service.description}</Typography>
                        <Link
                            component={RouterLink}
                            to="/signup"
                            sx={{
                                mt: 1,
                                justifySelf: 'start',
                                fontSize: font.size.sm,
                                fontWeight: 700,
                                color: color.coral700,
                            }}
                        >
                            Book a {service.name.toLowerCase()}
                        </Link>
                    </Box>
                ))}
            </Box>
        </Section>
    );
}
