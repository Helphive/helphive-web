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
    Alert,
    Snackbar,
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import {
    Android as AndroidIcon,
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
    Replay as ReplayIcon,
    Groups as TeamsIcon,
    SupportAgent as SupportIcon,
    Payments as PaymentsIcon,
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

const outcomes = [
    {
        title: 'For operations teams',
        description:
            'Fill short-notice hospitality shifts with a focused marketplace built around real job categories.',
        icon: <TeamsIcon />,
    },
    {
        title: 'For providers',
        description:
            'Keep upcoming work, completed jobs, and earnings in one place without chasing message threads.',
        icon: <PaymentsIcon />,
    },
    {
        title: 'For support',
        description:
            'Clear booking statuses and structured records make it easier to resolve issues quickly.',
        icon: <SupportIcon />,
    },
];

type ToastState = {
    open: boolean;
    message: string;
    severity: 'success' | 'info' | 'warning';
};

export default function LandingPage() {
    const navigate = useNavigate();
    const [androidDialogOpen, setAndroidDialogOpen] = useState(false);
    const [toast, setToast] = useState<ToastState>({
        open: false,
        message: '',
        severity: 'info',
    });

    const showToast = (message: string, severity: ToastState['severity'] = 'info') => {
        setToast({ open: true, message, severity });
    };

    const triggerAndroidDownload = () => {
        const link = document.createElement('a');
        link.href = ANDROID_APK_URL;
        link.download = 'helphive-universal.apk';
        link.rel = 'noopener noreferrer';
        document.body.appendChild(link);
        link.click();
        link.remove();
    };

    const handleAndroidDownload = () => {
        triggerAndroidDownload();
        setAndroidDialogOpen(true);
        showToast('Android download started. Check your downloads when it finishes.', 'success');
    };

    const handleIosUnavailable = () => {
        showToast('iOS is unavailable for now. Android and web access are ready.', 'warning');
    };

    const storeBadgeButtonSx = {
        width: 'auto',
        height: { xs: 48, sm: 52 },
        p: 0,
        borderRadius: 1,
        bgcolor: 'transparent',
        border: 0,
        minHeight: 0,
        boxShadow: 'none',
        overflow: 'visible',
        flexShrink: 0,
        '&:hover': {
            bgcolor: 'transparent',
            transform: 'translateY(-2px)',
            filter: 'drop-shadow(0 16px 26px rgba(16, 24, 40, 0.18))',
        },
        '& img': {
            display: 'block',
            width: 'auto',
            height: '100%',
        },
        transition: 'transform 160ms ease, box-shadow 160ms ease',
    } as const;

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
                            <Stack
                                direction={{ xs: 'column', sm: 'row' }}
                                spacing={1.5}
                                sx={{ mt: 3 }}
                            >
                                <Button
                                    aria-label="Get HelpHive on Android"
                                    onClick={handleAndroidDownload}
                                    sx={storeBadgeButtonSx}
                                >
                                    <Box
                                        component="img"
                                        src="/images/badge-android.svg"
                                        alt="Get it on Android"
                                    />
                                </Button>
                                <Button
                                    aria-label="Download HelpHive on the App Store"
                                    onClick={handleIosUnavailable}
                                    sx={storeBadgeButtonSx}
                                >
                                    <Box
                                        component="img"
                                        src="/images/badge-app-store.svg"
                                        alt="Download on the App Store"
                                        sx={{ height: { xs: 50, sm: 54 } }}
                                    />
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
                sx={{
                    position: 'relative',
                    bgcolor: '#FFF7F5',
                    py: { xs: 7, md: 10 },
                    overflow: 'hidden',
                    borderTop: '1px solid',
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                    '&::before': {
                        content: '""',
                        position: 'absolute',
                        inset: 0,
                        background:
                            'linear-gradient(135deg, rgba(255, 87, 64, 0.12), rgba(255, 255, 255, 0) 48%), radial-gradient(circle at 88% 14%, rgba(254, 200, 75, 0.22), transparent 30%)',
                    },
                }}
            >
                <Container maxWidth="xl" sx={{ position: 'relative' }}>
                    <Grid container spacing={5} alignItems="center">
                        <Grid size={{ xs: 12, md: 6 }}>
                            <Chip
                                icon={<PhoneIcon />}
                                label="Mobile access"
                                sx={{
                                    bgcolor: '#FFFFFF',
                                    border: '1px solid',
                                    borderColor: 'divider',
                                    mb: 2.5,
                                }}
                            />
                            <Typography variant="h3" color="text.primary">
                                Take HelpHive with you.
                            </Typography>
                            <Typography
                                color="text.secondary"
                                sx={{ mt: 1.5, maxWidth: 620, fontSize: '1.05rem' }}
                            >
                                The Android APK is available directly from the official HelpHive
                                GitHub release. Install it on your device to book, track, and manage
                                work on the go.
                            </Typography>
                            <Stack
                                direction={{ xs: 'column', sm: 'row' }}
                                spacing={1.5}
                                sx={{ mt: 3 }}
                            >
                                <Button
                                    variant="contained"
                                    size="large"
                                    startIcon={<DownloadIcon />}
                                    onClick={handleAndroidDownload}
                                >
                                    Download Android APK
                                </Button>
                                <Button
                                    variant="outlined"
                                    size="large"
                                    onClick={() => navigate('/login')}
                                >
                                    Open web app
                                </Button>
                            </Stack>
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <Card
                                sx={{
                                    bgcolor: '#FFFFFF',
                                    boxShadow: '0 28px 70px rgba(16, 24, 40, 0.12)',
                                    overflow: 'hidden',
                                }}
                            >
                                <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
                                    <Grid container spacing={3} alignItems="center">
                                        <Grid size={{ xs: 12, sm: 5 }}>
                                            <Box
                                                sx={{
                                                    position: 'relative',
                                                    minHeight: 230,
                                                    display: 'grid',
                                                    placeItems: 'center',
                                                    bgcolor: '#F9FAFB',
                                                    borderRadius: 2,
                                                    border: '1px solid',
                                                    borderColor: 'divider',
                                                }}
                                            >
                                                <Box
                                                    component="img"
                                                    src="/images/download-mobile-app.png"
                                                    alt="HelpHive Android app preview"
                                                    sx={{
                                                        height: 230,
                                                        maxWidth: '86%',
                                                        objectFit: 'contain',
                                                        filter: 'drop-shadow(0 18px 22px rgba(16, 24, 40, 0.18))',
                                                    }}
                                                />
                                            </Box>
                                        </Grid>
                                        <Grid size={{ xs: 12, sm: 7 }}>
                                            <Stack spacing={1.5}>
                                                <Stack direction="row" spacing={1.25}>
                                                    <CheckIcon color="success" />
                                                    <Typography fontWeight={750}>
                                                        Install from the official GitHub release.
                                                    </Typography>
                                                </Stack>
                                                <Stack direction="row" spacing={1.25}>
                                                    <CheckIcon color="success" />
                                                    <Typography fontWeight={750}>
                                                        Retry the APK download from the instruction
                                                        dialog.
                                                    </Typography>
                                                </Stack>
                                                <Stack direction="row" spacing={1.25}>
                                                    <CheckIcon color="success" />
                                                    <Typography fontWeight={750}>
                                                        Continue bookings and provider work on web.
                                                    </Typography>
                                                </Stack>
                                            </Stack>
                                        </Grid>
                                    </Grid>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>
                </Container>
            </Box>

            <Box component="section" sx={{ bgcolor: '#FFFFFF', py: { xs: 7, md: 10 } }}>
                <Container maxWidth="xl">
                    <Grid container spacing={4} alignItems="flex-start">
                        <Grid size={{ xs: 12, md: 5 }}>
                            <Typography variant="h3">More than a booking form.</Typography>
                            <Typography color="text.secondary" sx={{ mt: 1.5, maxWidth: 560 }}>
                                HelpHive keeps the important parts of hospitality work connected:
                                requests, people, status, payments, and support.
                            </Typography>
                        </Grid>
                        <Grid size={{ xs: 12, md: 7 }}>
                            <Grid container spacing={2}>
                                {outcomes.map((item) => (
                                    <Grid size={{ xs: 12, sm: 4 }} key={item.title}>
                                        <Card sx={{ height: '100%' }}>
                                            <CardContent sx={{ p: 3 }}>
                                                <Box
                                                    sx={{
                                                        width: 44,
                                                        height: 44,
                                                        borderRadius: 2,
                                                        bgcolor: 'primary.main',
                                                        color: '#FFFFFF',
                                                        display: 'grid',
                                                        placeItems: 'center',
                                                        mb: 2,
                                                    }}
                                                >
                                                    {item.icon}
                                                </Box>
                                                <Typography variant="h6" sx={{ mb: 1 }}>
                                                    {item.title}
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    {item.description}
                                                </Typography>
                                            </CardContent>
                                        </Card>
                                    </Grid>
                                ))}
                            </Grid>
                        </Grid>
                    </Grid>
                </Container>
            </Box>

            <Box
                component="footer"
                sx={{
                    bgcolor: '#101828',
                    color: '#FFFFFF',
                    borderTop: '1px solid',
                    borderColor: 'rgba(255,255,255,0.12)',
                    py: { xs: 5, md: 6 },
                }}
            >
                <Container maxWidth="xl">
                    <Grid container spacing={4} sx={{ mb: 4 }}>
                        <Grid size={{ xs: 12, md: 5 }}>
                            <Stack direction="row" spacing={1.25} alignItems="center">
                                <Box
                                    component="img"
                                    src="/logo.png"
                                    alt="HelpHive"
                                    sx={{ height: 40, bgcolor: '#FFFFFF', borderRadius: 1, p: 0.5 }}
                                />
                                <Typography fontWeight={850} fontSize={20}>
                                    HelpHive
                                </Typography>
                            </Stack>
                            <Typography sx={{ color: '#D0D5DD', mt: 2, maxWidth: 460 }}>
                                Hospitality staffing for room attendants, public area attendants,
                                and linen porters. Built for teams that need clarity from request
                                to completion.
                            </Typography>
                        </Grid>
                        <Grid size={{ xs: 6, sm: 4, md: 2 }}>
                            <Typography fontWeight={850} sx={{ mb: 1.5 }}>
                                Platform
                            </Typography>
                            <Stack spacing={1}>
                                <Typography sx={{ color: '#D0D5DD' }}>Book services</Typography>
                                <Typography sx={{ color: '#D0D5DD' }}>Provider work</Typography>
                                <Typography sx={{ color: '#D0D5DD' }}>Mobile app</Typography>
                            </Stack>
                        </Grid>
                        <Grid size={{ xs: 6, sm: 4, md: 2 }}>
                            <Typography fontWeight={850} sx={{ mb: 1.5 }}>
                                Services
                            </Typography>
                            <Stack spacing={1}>
                                <Typography sx={{ color: '#D0D5DD' }}>Room attendants</Typography>
                                <Typography sx={{ color: '#D0D5DD' }}>Public areas</Typography>
                                <Typography sx={{ color: '#D0D5DD' }}>Linen porters</Typography>
                            </Stack>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 4, md: 3 }}>
                            <Typography fontWeight={850} sx={{ mb: 1.5 }}>
                                Get the app
                            </Typography>
                            <Stack spacing={1.25} alignItems="flex-start">
                                <Button
                                    size="small"
                                    startIcon={<AndroidIcon />}
                                    onClick={handleAndroidDownload}
                                    sx={{
                                        color: '#FFFFFF',
                                        borderColor: 'rgba(255,255,255,0.2)',
                                        bgcolor: 'rgba(255,255,255,0.08)',
                                        '&:hover': { bgcolor: 'rgba(255,255,255,0.14)' },
                                    }}
                                    variant="outlined"
                                >
                                    Android APK
                                </Button>
                                <Typography variant="body2" sx={{ color: '#98A2B3' }}>
                                    iOS is unavailable for now.
                                </Typography>
                            </Stack>
                        </Grid>
                    </Grid>
                    <Divider sx={{ borderColor: 'rgba(255,255,255,0.12)', mb: 3 }} />
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
                        <Stack direction="row" spacing={1.25} alignItems="center" sx={{ flex: 1 }}>
                            <Box
                                component="img"
                                src="/logo.png"
                                alt="HelpHive"
                                sx={{ height: 36 }}
                            />
                            <Typography fontWeight={800} color="inherit">
                                HelpHive
                            </Typography>
                        </Stack>
                        <Typography sx={{ color: '#98A2B3' }}>
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
                        startIcon={<ReplayIcon />}
                        onClick={() => {
                            triggerAndroidDownload();
                            showToast('Retrying the Android download.', 'info');
                        }}
                    >
                        Retry download
                    </Button>
                </DialogActions>
            </Dialog>

            <Snackbar
                open={toast.open}
                autoHideDuration={4200}
                onClose={() => setToast((current) => ({ ...current, open: false }))}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert
                    variant="filled"
                    severity={toast.severity}
                    onClose={() => setToast((current) => ({ ...current, open: false }))}
                    sx={{
                        width: '100%',
                        borderRadius: 2,
                        alignItems: 'center',
                        boxShadow: '0 18px 48px rgba(16, 24, 40, 0.22)',
                        '& .MuiAlert-message': { fontWeight: 750 },
                    }}
                >
                    {toast.message}
                </Alert>
            </Snackbar>
        </Box>
    );
}
