import { Link as RouterLink } from 'react-router-dom';
import { Box, Link, Typography } from '@mui/material';
import { Logo } from '@/components/ui';
import { demoLoginPath } from '@/pages/auth/demoAccounts';
import { color, font, hairline, layout } from '@/theme/tokens';
import { sectionGutter } from './constants';

interface FooterLink {
    label: string;
    to?: string;
    href?: string;
    onClick?: () => void;
}

function FooterColumn({ title, links }: { title: string; links: FooterLink[] }) {
    return (
        <Box component="nav" aria-label={title}>
            <Typography variant="subtitle2" component="h2" sx={{ mb: 1.5 }}>
                {title}
            </Typography>
            <Box component="ul" sx={{ listStyle: 'none', p: 0, m: 0, display: 'grid', gap: 1 }}>
                {links.map((link) => (
                    <li key={link.label}>
                        {link.to ? (
                            <Link component={RouterLink} to={link.to} color={color.ink600}>
                                {link.label}
                            </Link>
                        ) : link.href ? (
                            <Link href={link.href} color={color.ink600}>
                                {link.label}
                            </Link>
                        ) : (
                            <Link
                                component="button"
                                type="button"
                                onClick={link.onClick}
                                color={color.ink600}
                                sx={{ font: 'inherit', fontWeight: 600, textAlign: 'left' }}
                            >
                                {link.label}
                            </Link>
                        )}
                    </li>
                ))}
            </Box>
        </Box>
    );
}

export default function LandingFooter({
    onAndroid,
    onIos,
}: {
    onAndroid: () => void;
    onIos: () => void;
}) {
    return (
        <Box component="footer" sx={{ bgcolor: color.subtle, borderTop: hairline }}>
            <Box
                sx={{
                    maxWidth: layout.contentMaxWidth,
                    mx: 'auto',
                    px: sectionGutter,
                    pt: { xs: 5, md: 6 },
                    pb: 3,
                }}
            >
                <Box
                    sx={{
                        display: 'grid',
                        gridTemplateColumns: {
                            xs: 'repeat(2, minmax(0, 1fr))',
                            md: 'minmax(0, 2fr) repeat(4, minmax(0, 1fr))',
                        },
                        gap: { xs: 4, md: 5 },
                    }}
                >
                    <Box sx={{ gridColumn: { xs: '1 / -1', md: 'auto' } }}>
                        <Logo to="/" size={34} />
                        <Typography color="text.secondary" sx={{ mt: 2, maxWidth: '40ch' }}>
                            Hospitality staffing for room attendants, public area attendants, and
                            linen porters. Built for teams that need clarity from request to
                            completion.
                        </Typography>
                    </Box>
                    <FooterColumn
                        title="Services"
                        links={[
                            { label: 'Room attendants', href: '#services' },
                            { label: 'Public areas', href: '#services' },
                            { label: 'Linen porters', href: '#services' },
                        ]}
                    />
                    <FooterColumn
                        title="Platform"
                        links={[
                            { label: 'Book a service', to: '/signup' },
                            { label: 'Become a provider', to: '/provider-signup' },
                            { label: 'How it works', href: '#how-it-works' },
                        ]}
                    />
                    <FooterColumn
                        title="Account"
                        links={[
                            { label: 'Log in', to: '/login' },
                            { label: 'Create an account', to: '/signup' },
                            { label: 'Demo customer', to: demoLoginPath('user') },
                            { label: 'Demo provider', to: demoLoginPath('provider') },
                        ]}
                    />
                    <FooterColumn
                        title="Get the app"
                        links={[
                            { label: 'Android APK', onClick: onAndroid },
                            { label: 'iOS (unavailable for now)', onClick: onIos },
                        ]}
                    />
                </Box>
                <Box
                    sx={{
                        mt: 5,
                        pt: 2.5,
                        borderTop: hairline,
                        fontSize: font.size.sm,
                        color: color.ink500,
                    }}
                >
                    © {new Date().getFullYear()} HelpHive. All rights reserved.
                </Box>
            </Box>
        </Box>
    );
}
