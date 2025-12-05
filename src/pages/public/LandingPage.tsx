import { useNavigate } from 'react-router-dom';
import {
    Box,
    Container,
    Typography,
    Button,
    Card,
    CardContent,
    AppBar,
    Toolbar,
    IconButton,
    useTheme,
    Stack,
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import {
    CleaningServices as CleaningIcon,
    Hotel as HotelIcon,
    LocalLaundryService as LinenIcon,
    VerifiedUser as VerifiedIcon,
    Schedule as ScheduleIcon,
    Security as SecurityIcon,
    TrackChanges as TrackingIcon,
    DarkMode as DarkModeIcon,
    LightMode as LightModeIcon,
} from '@mui/icons-material';
import { useTheme as useAppTheme } from '@/theme/ThemeContext';
import { SERVICES } from '@/types';

const serviceIcons: Record<number, React.ReactNode> = {
    1: <CleaningIcon sx={{ fontSize: 48 }} />,
    2: <HotelIcon sx={{ fontSize: 48 }} />,
    3: <LinenIcon sx={{ fontSize: 48 }} />,
};

const features = [
    {
        title: 'Professional Service',
        description: 'Vetted and trained hospitality professionals',
        icon: <VerifiedIcon sx={{ fontSize: 40 }} />,
    },
    {
        title: 'Flexible Booking',
        description: 'Book services on your schedule',
        icon: <ScheduleIcon sx={{ fontSize: 40 }} />,
    },
    {
        title: 'Secure Payments',
        description: 'Safe and transparent payment processing',
        icon: <SecurityIcon sx={{ fontSize: 40 }} />,
    },
    {
        title: 'Real-time Tracking',
        description: 'Track your booking status in real-time',
        icon: <TrackingIcon sx={{ fontSize: 40 }} />,
    },
];

export default function LandingPage() {
    const navigate = useNavigate();
    const theme = useTheme();
    const { mode, toggleTheme } = useAppTheme();

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
            {/* Header */}
            <AppBar position="sticky" elevation={0} sx={{ bgcolor: 'background.paper' }}>
                <Container maxWidth="lg">
                    <Toolbar disableGutters>
                        <Box
                            component="img"
                            src="/logo.png"
                            alt="HelpHive"
                            sx={{ height: 40, mr: 1 }}
                        />
                        <Typography variant="h5" fontWeight={700} color="primary" sx={{ flex: 1 }}>
                            HelpHive
                        </Typography>
                        <IconButton onClick={toggleTheme} sx={{ mr: 2 }}>
                            {mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
                        </IconButton>
                        <Button variant="outlined" onClick={() => navigate('/login')} sx={{ mr: 1 }}>
                            Login
                        </Button>
                        <Button variant="contained" onClick={() => navigate('/signup')}>
                            Sign Up
                        </Button>
                    </Toolbar>
                </Container>
            </AppBar>

            {/* Hero Section */}
            <Box
                sx={{
                    py: { xs: 8, md: 12 },
                    background: `linear-gradient(135deg, ${theme.palette.primary.main}15 0%, ${theme.palette.background.default} 100%)`,
                }}
            >
                <Container maxWidth="lg">
                    <Grid container spacing={6} alignItems="center">
                        <Grid size={{ xs: 12, md: 6 }}>
                            <Typography
                                variant="h2"
                                fontWeight={700}
                                sx={{
                                    fontSize: { xs: '2.5rem', md: '3.5rem' },
                                    mb: 3,
                                    lineHeight: 1.2,
                                }}
                            >
                                Professional Hospitality Services{' '}
                                <Box component="span" sx={{ color: 'primary.main' }}>
                                    On Demand
                                </Box>
                            </Typography>
                            <Typography
                                variant="h6"
                                color="text.secondary"
                                sx={{ mb: 4, fontWeight: 400 }}
                            >
                                Connect with vetted hospitality professionals for hotels, venues,
                                and events. Book room attendants, public area cleaners, and linen
                                porters with just a few clicks.
                            </Typography>
                            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                                <Button
                                    variant="contained"
                                    size="large"
                                    onClick={() => navigate('/signup')}
                                    sx={{ px: 4, py: 1.5 }}
                                >
                                    Book a Service
                                </Button>
                                <Button
                                    variant="outlined"
                                    size="large"
                                    onClick={() => navigate('/provider-signup')}
                                    sx={{ px: 4, py: 1.5 }}
                                >
                                    Become a Provider
                                </Button>
                            </Stack>
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <Box
                                sx={{
                                    width: '100%',
                                    height: { xs: 300, md: 450 },
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                            >
                                <Box
                                    component="img"
                                    src="/images/hero-handshake.svg"
                                    alt="HelpHive Services"
                                    sx={{
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'contain',
                                    }}
                                />
                            </Box>
                        </Grid>
                    </Grid>
                </Container>
            </Box>

            {/* Services Section */}
            <Box sx={{ py: { xs: 8, md: 12 } }}>
                <Container maxWidth="lg">
                    <Typography
                        variant="h3"
                        fontWeight={700}
                        textAlign="center"
                        sx={{ mb: 2 }}
                    >
                        Our Services
                    </Typography>
                    <Typography
                        variant="h6"
                        color="text.secondary"
                        textAlign="center"
                        sx={{ mb: 6, maxWidth: 600, mx: 'auto' }}
                    >
                        Choose from our range of professional hospitality services
                    </Typography>
                    <Grid container spacing={4}>
                        {SERVICES.map((service) => (
                            <Grid size={{ xs: 12, md: 4 }} key={service.id}>
                                <Card
                                    sx={{
                                        height: '100%',
                                        transition: 'transform 0.2s, box-shadow 0.2s',
                                        '&:hover': {
                                            transform: 'translateY(-8px)',
                                            boxShadow: '0 12px 40px rgba(0,0,0,0.12)',
                                        },
                                    }}
                                >
                                    <CardContent sx={{ p: 4, textAlign: 'center' }}>
                                        <Box
                                            sx={{
                                                width: 80,
                                                height: 80,
                                                borderRadius: '50%',
                                                bgcolor: 'primary.main',
                                                color: 'white',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                mx: 'auto',
                                                mb: 3,
                                            }}
                                        >
                                            {serviceIcons[service.id]}
                                        </Box>
                                        <Typography variant="h5" fontWeight={600} sx={{ mb: 2 }}>
                                            {service.name}
                                        </Typography>
                                        <Typography color="text.secondary">
                                            {service.description}
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                </Container>
            </Box>

            {/* Features Section */}
            <Box sx={{ py: { xs: 8, md: 12 }, bgcolor: 'background.paper' }}>
                <Container maxWidth="lg">
                    <Typography
                        variant="h3"
                        fontWeight={700}
                        textAlign="center"
                        sx={{ mb: 2 }}
                    >
                        Why Choose HelpHive?
                    </Typography>
                    <Typography
                        variant="h6"
                        color="text.secondary"
                        textAlign="center"
                        sx={{ mb: 6, maxWidth: 600, mx: 'auto' }}
                    >
                        We make booking hospitality services simple and reliable
                    </Typography>
                    <Grid container spacing={4}>
                        {features.map((feature, index) => (
                            <Grid size={{ xs: 12, sm: 6, md: 3 }} key={index}>
                                <Box sx={{ textAlign: 'center' }}>
                                    <Box sx={{ color: 'primary.main', mb: 2 }}>{feature.icon}</Box>
                                    <Typography variant="h6" fontWeight={600} sx={{ mb: 1 }}>
                                        {feature.title}
                                    </Typography>
                                    <Typography color="text.secondary" variant="body2">
                                        {feature.description}
                                    </Typography>
                                </Box>
                            </Grid>
                        ))}
                    </Grid>
                </Container>
            </Box>

            {/* CTA Section */}
            <Box sx={{ py: { xs: 8, md: 12 } }}>
                <Container maxWidth="md">
                    <Box
                        sx={{
                            bgcolor: 'primary.main',
                            borderRadius: 4,
                            p: { xs: 4, md: 6 },
                            textAlign: 'center',
                        }}
                    >
                        <Typography variant="h4" fontWeight={700} color="white" sx={{ mb: 2 }}>
                            Ready to Get Started?
                        </Typography>
                        <Typography color="white" sx={{ mb: 4, opacity: 0.9 }}>
                            Join thousands of satisfied customers and providers on HelpHive
                        </Typography>
                        <Stack
                            direction={{ xs: 'column', sm: 'row' }}
                            spacing={2}
                            justifyContent="center"
                        >
                            <Button
                                variant="contained"
                                size="large"
                                onClick={() => navigate('/signup')}
                                sx={{
                                    bgcolor: 'white',
                                    color: 'primary.main',
                                    '&:hover': { bgcolor: 'grey.100' },
                                    px: 4,
                                }}
                            >
                                Book Now
                            </Button>
                            <Button
                                variant="outlined"
                                size="large"
                                onClick={() => navigate('/provider-signup')}
                                sx={{
                                    borderColor: 'white',
                                    color: 'white',
                                    '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.1)' },
                                    px: 4,
                                }}
                            >
                                Join as Provider
                            </Button>
                        </Stack>
                    </Box>
                </Container>
            </Box>

            {/* Footer */}
            <Box sx={{ py: 4, bgcolor: 'background.paper', borderTop: '1px solid', borderColor: 'divider' }}>
                <Container maxWidth="lg">
                    <Typography textAlign="center" color="text.secondary">
                        © {new Date().getFullYear()} HelpHive. All rights reserved.
                    </Typography>
                </Container>
            </Box>
        </Box>
    );
}
