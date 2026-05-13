import { useState } from 'react';
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
    Stack,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Chip,
    Divider,
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
    Download as DownloadIcon,
    PhoneAndroid as PhoneIcon,
    Settings as SettingsIcon,
    FolderOpen as FolderIcon,
    CheckCircle as CheckIcon,
    ArrowForward as ArrowForwardIcon,
    StarRounded as StarIcon,
} from '@mui/icons-material';
import { SERVICES } from '@/types';

const ANDROID_APK_URL =
    'https://github.com/Helphive/helphive-app/releases/download/production-07/helphive-universal.apk';

const serviceIcons: Record<number, React.ReactNode> = {
    1: <CleaningIcon sx={{ fontSize: 34 }} />,
    2: <HotelIcon sx={{ fontSize: 34 }} />,
    3: <LinenIcon sx={{ fontSize: 34 }} />,
};

const features = [
    {
        title: 'Verified providers',
        description: 'Hospitality workers are reviewed before they join the marketplace.',
        icon: <VerifiedIcon />,
    },
    {
        title: 'Fast scheduling',
        description: 'Book the role, date, hours, and location in a focused booking flow.',
        icon: <ScheduleIcon />,
    },
    {
        title: 'Protected payments',
        description: 'Stripe-powered payments keep bookings and provider payouts organized.',
        icon: <SecurityIcon />,
    },
    {
        title: 'Live job status',
        description: 'Customers and providers can follow booking progress from request to close.',
        icon: <TrackingIcon />,
    },
];

export default function LandingPage() {
    const navigate = useNavigate();
    const [androidDialogOpen, setAndroidDialogOpen] = useState(false);

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', overflow: 'hidden' }}>
            <AppBar
                position="sticky"
                elevation={0}
                sx={{
                    bgcolor: 'rgba(255,255,255,0.86)',
                    backdropFilter: 'blur(18px)',
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                }}
            >
                <Container maxWidth="xl">
                    <Toolbar disableGutters sx={{ minHeight: 74 }}>
                        <Box
                            component="img"
                            src="/logo.png"
                            alt="HelpHive"
                            sx={{ height: 42, mr: 1.5 }}
                        />
                        <Typography
                            variant="h5"
                            fontWeight={800}
                            color="text.primary"
                            sx={{ flex: 1 }}
                        >
                            HelpHive
                        </Typography>
                        <Stack
                            direction="row"
                            spacing={1}
                            sx={{ display: { xs: 'none', sm: 'flex' } }}
                        >
                            <Button variant="outlined" onClick={() => navigate('/login')}>
                                Log in
                            </Button>
                            <Button variant="contained" onClick={() => navigate('/signup')}>
                                Book now
                            </Button>
                        </Stack>
                    </Toolbar>
                </Container>
            </AppBar>

            <Box
                component="section"
                sx={{
                    position: 'relative',
                    bgcolor: '#FFF7F5',
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                    '&::before': {
                        content: '""',
                        position: 'absolute',
                        inset: 0,
                        background:
                            'radial-gradient(circle at 78% 18%, rgba(255, 87, 64, 0.22), transparent 28%), radial-gradient(circle at 18% 92%, rgba(254, 200, 75, 0.28), transparent 26%)',
                    },
                }}
            >
                <Container maxWidth="xl" sx={{ position: 'relative', py: { xs: 7, md: 10 } }}>
                    <Grid container spacing={{ xs: 5, md: 8 }} alignItems="center">
                        <Grid size={{ xs: 12, md: 6 }}>
                            <Chip
                                icon={<StarIcon />}
                                label="Hospitality staffing without the spreadsheet chaos"
                                sx={{
                                    bgcolor: '#FFFFFF',
                                    border: '1px solid',
                                    borderColor: 'divider',
                                    mb: 3,
                                    color: 'text.primary',
                                }}
                            />
                            <Typography variant="h1" sx={{ maxWidth: 690, mb: 3 }}>
                                Book reliable hospitality help in minutes.
                            </Typography>
                            <Typography
                                variant="h6"
                                color="text.secondary"
                                sx={{ maxWidth: 620, mb: 4, fontWeight: 600, lineHeight: 1.6 }}
                            >
                                HelpHive connects hotels, venues, and operations teams with vetted
                                room attendants, public area attendants, and linen porters.
                            </Typography>
                            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                                <Button
                                    variant="contained"
                                    size="large"
                                    endIcon={<ArrowForwardIcon />}
                                    onClick={() => navigate('/signup')}
                                >
                                    Book a service
                                </Button>
                                <Button
                                    variant="outlined"
                                    size="large"
                                    onClick={() => navigate('/provider-signup')}
                                >
                                    Become a provider
                                </Button>
                            </Stack>
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <Box
                                sx={{
                                    position: 'relative',
                                    minHeight: { xs: 360, md: 520 },
                                    display: 'grid',
                                    placeItems: 'center',
                                }}
                            >
                                <Box
                                    sx={{
                                        position: 'absolute',
                                        width: { xs: 310, sm: 440, md: 520 },
                                        height: { xs: 310, sm: 440, md: 520 },
                                        borderRadius: '50%',
                                        bgcolor: '#FFFFFF',
                                        boxShadow: '0 28px 90px rgba(255, 87, 64, 0.18)',
                                    }}
                                />
                                <Box
                                    component="img"
                                    src="/images/download-mobile-app.png"
                                    alt="HelpHive mobile booking app"
                                    sx={{
                                        position: 'relative',
                                        zIndex: 1,
                                        width: { xs: '82%', sm: 360, md: 430 },
                                        maxHeight: 500,
                                        objectFit: 'contain',
                                        filter: 'drop-shadow(0 28px 38px rgba(16, 24, 40, 0.22))',
                                    }}
                                />
                                <Card
                                    sx={{
                                        position: 'absolute',
                                        zIndex: 2,
                                        right: { xs: 4, sm: 34, md: 0 },
                                        bottom: { xs: 6, md: 64 },
                                        width: 230,
                                    }}
                                >
                                    <CardContent sx={{ p: 2 }}>
                                        <Typography variant="body2" color="text.secondary">
                                            Provider earnings
                                        </Typography>
                                        <Typography variant="h4" sx={{ mt: 0.5 }}>
                                            £152.00
                                        </Typography>
                                        <Typography
                                            variant="body2"
                                            color="success.main"
                                            fontWeight={800}
                                        >
                                            Available after completion
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Box>
                        </Grid>
                    </Grid>
                </Container>
            </Box>

            <Box component="section" sx={{ bgcolor: '#FFFFFF', py: { xs: 7, md: 10 } }}>
                <Container maxWidth="xl">
                    <Stack sx={{ maxWidth: 720, mb: 5 }}>
                        <Typography variant="h3">Built for hospitality operations</Typography>
                        <Typography color="text.secondary" sx={{ mt: 1.5, fontSize: '1.1rem' }}>
                            Every service card is tuned for the jobs HelpHive actually supports.
                        </Typography>
                    </Stack>
                    <Grid container spacing={2.5}>
                        {SERVICES.map((service) => (
                            <Grid size={{ xs: 12, md: 4 }} key={service.id}>
                                <Card
                                    sx={{
                                        height: '100%',
                                        transition: 'transform 180ms ease, box-shadow 180ms ease',
                                        '&:hover': {
                                            transform: 'translateY(-6px)',
                                            boxShadow: '0 20px 46px rgba(16, 24, 40, 0.10)',
                                        },
                                    }}
                                >
                                    <CardContent sx={{ p: 3.5 }}>
                                        <Box
                                            sx={{
                                                width: 64,
                                                height: 64,
                                                borderRadius: 2,
                                                bgcolor: 'primary.main',
                                                color: 'white',
                                                display: 'grid',
                                                placeItems: 'center',
                                                mb: 3,
                                            }}
                                        >
                                            {serviceIcons[service.id]}
                                        </Box>
                                        <Typography variant="h5" sx={{ mb: 1 }}>
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

            <Box component="section" sx={{ py: { xs: 7, md: 10 } }}>
                <Container maxWidth="xl">
                    <Grid container spacing={2.5}>
                        {features.map((feature) => (
                            <Grid size={{ xs: 12, sm: 6, md: 3 }} key={feature.title}>
                                <Card sx={{ height: '100%', bgcolor: '#FFFFFF' }}>
                                    <CardContent sx={{ p: 3 }}>
                                        <Box
                                            sx={{
                                                width: 44,
                                                height: 44,
                                                borderRadius: 2,
                                                bgcolor: 'primary.main',
                                                color: 'white',
                                                display: 'grid',
                                                placeItems: 'center',
                                                mb: 2,
                                            }}
                                        >
                                            {feature.icon}
                                        </Box>
                                        <Typography variant="h6" sx={{ mb: 1 }}>
                                            {feature.title}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            {feature.description}
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                </Container>
            </Box>

            <Box
                component="section"
                sx={{ bgcolor: '#101828', color: '#FFFFFF', py: { xs: 7, md: 10 } }}
            >
                <Container maxWidth="lg">
                    <Grid container spacing={5} alignItems="center">
                        <Grid size={{ xs: 12, md: 7 }}>
                            <Typography variant="h3" color="inherit">
                                Take HelpHive with you.
                            </Typography>
                            <Typography sx={{ color: '#D0D5DD', mt: 1.5, maxWidth: 620 }}>
                                The Android APK is available directly from the official HelpHive
                                GitHub release. Install it on your device to book, track, and manage
                                work on the go.
                            </Typography>
                        </Grid>
                        <Grid size={{ xs: 12, md: 5 }}>
                            <Stack
                                direction={{ xs: 'column', sm: 'row', md: 'column' }}
                                spacing={1.5}
                            >
                                <Button
                                    variant="contained"
                                    size="large"
                                    startIcon={<DownloadIcon />}
                                    onClick={() => setAndroidDialogOpen(true)}
                                >
                                    Download Android APK
                                </Button>
                                <Button
                                    variant="outlined"
                                    size="large"
                                    sx={{
                                        color: '#FFFFFF',
                                        borderColor: 'rgba(255,255,255,0.24)',
                                        bgcolor: 'transparent',
                                    }}
                                    onClick={() => navigate('/login')}
                                >
                                    Open web app
                                </Button>
                            </Stack>
                        </Grid>
                    </Grid>
                </Container>
            </Box>

            <Box
                component="footer"
                sx={{ bgcolor: '#FFFFFF', borderTop: '1px solid', borderColor: 'divider', py: 4 }}
            >
                <Container maxWidth="xl">
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
                        <Stack direction="row" spacing={1.25} alignItems="center" sx={{ flex: 1 }}>
                            <Box
                                component="img"
                                src="/logo.png"
                                alt="HelpHive"
                                sx={{ height: 36 }}
                            />
                            <Typography fontWeight={800}>HelpHive</Typography>
                        </Stack>
                        <Typography color="text.secondary">
                            © {new Date().getFullYear()} HelpHive. All rights reserved.
                        </Typography>
                    </Stack>
                </Container>
            </Box>

            <Dialog
                open={androidDialogOpen}
                onClose={() => setAndroidDialogOpen(false)}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>
                    <Stack direction="row" spacing={1.25} alignItems="center">
                        <PhoneIcon color="primary" />
                        <Typography variant="h6">Install HelpHive for Android</Typography>
                    </Stack>
                </DialogTitle>
                <DialogContent>
                    <Typography color="text.secondary" sx={{ mb: 2 }}>
                        Download the release APK from GitHub, then install it on your Android
                        device.
                    </Typography>
                    <Divider sx={{ mb: 1 }} />
                    <List>
                        <ListItem>
                            <ListItemIcon>
                                <DownloadIcon color="primary" />
                            </ListItemIcon>
                            <ListItemText
                                primary="Download helphive-universal.apk"
                                secondary="Use the official GitHub release asset."
                            />
                        </ListItem>
                        <ListItem>
                            <ListItemIcon>
                                <SettingsIcon color="primary" />
                            </ListItemIcon>
                            <ListItemText
                                primary="Allow the install when Android asks"
                                secondary="Your browser or file manager may need permission."
                            />
                        </ListItem>
                        <ListItem>
                            <ListItemIcon>
                                <FolderIcon color="primary" />
                            </ListItemIcon>
                            <ListItemText
                                primary="Open the downloaded file"
                                secondary="Tap the APK and follow the Android installer."
                            />
                        </ListItem>
                        <ListItem>
                            <ListItemIcon>
                                <CheckIcon color="success" />
                            </ListItemIcon>
                            <ListItemText
                                primary="Launch HelpHive"
                                secondary="Sign in and continue from your phone."
                            />
                        </ListItem>
                    </List>
                </DialogContent>
                <DialogActions sx={{ p: 3, pt: 0 }}>
                    <Button onClick={() => setAndroidDialogOpen(false)}>Cancel</Button>
                    <Button
                        variant="contained"
                        startIcon={<DownloadIcon />}
                        onClick={() => window.open(ANDROID_APK_URL, '_blank')}
                    >
                        Download APK
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
