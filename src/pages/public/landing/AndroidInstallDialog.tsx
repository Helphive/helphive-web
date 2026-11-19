import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Typography,
} from '@mui/material';
import {
    CheckCircleOutline,
    Download,
    FolderOpen,
    Replay,
    SettingsOutlined,
} from '@mui/icons-material';

const STEPS = [
    {
        icon: <Download />,
        primary: 'Download helphive-universal.apk',
        secondary: 'Use the official GitHub release asset.',
    },
    {
        icon: <SettingsOutlined />,
        primary: 'Allow the install when Android asks',
        secondary: 'Your browser or file manager may need permission.',
    },
    {
        icon: <FolderOpen />,
        primary: 'Open the downloaded file',
        secondary: 'Tap the APK and follow the Android installer.',
    },
    {
        icon: <CheckCircleOutline />,
        primary: 'Launch HelpHive',
        secondary: 'Sign in and continue from your phone.',
    },
];

export default function AndroidInstallDialog({
    open,
    onClose,
    onRetry,
}: {
    open: boolean;
    onClose: () => void;
    onRetry: () => void;
}) {
    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="sm"
            fullWidth
            aria-labelledby="install-title"
        >
            <DialogTitle id="install-title">Install HelpHive for Android</DialogTitle>
            <DialogContent>
                <Typography color="text.secondary">
                    Download the release APK from GitHub, then install it on your Android device.
                </Typography>
                <List sx={{ mt: 1 }}>
                    {STEPS.map((step) => (
                        <ListItem key={step.primary} disableGutters>
                            <ListItemIcon sx={{ minWidth: 40 }}>{step.icon}</ListItemIcon>
                            <ListItemText primary={step.primary} secondary={step.secondary} />
                        </ListItem>
                    ))}
                </List>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2.5 }}>
                <Button onClick={onClose}>Close</Button>
                <Button variant="contained" startIcon={<Replay />} onClick={onRetry}>
                    Retry download
                </Button>
            </DialogActions>
        </Dialog>
    );
}
