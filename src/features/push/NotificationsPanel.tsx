// The "Notifications" setting on the profile page: the real state of push in this browser, and the one button that
// asks for permission and turns it on (or turns it off for this browser).
import { Box, Button, CircularProgress, Typography } from '@mui/material';
import { Panel, StatusPill, type Tone } from '@/components/ui';
import { usePushActions } from './usePushActions';
import { usePushSnapshot, statusOf, type PushStatus } from './pushState';

const COPY: Record<PushStatus, { pill: string; tone: Tone; text: string }> = {
    on: {
        pill: 'On for this browser',
        tone: 'green',
        text: "You'll get alerts for bookings, payments and new messages, even when HelpHive isn't open.",
    },
    off: {
        pill: 'Off',
        tone: 'grey',
        text: "Turn on to hear about bookings, payments and new messages, even when HelpHive isn't open.",
    },
    blocked: {
        pill: 'Blocked in this browser',
        tone: 'red',
        text: 'To turn on, allow notifications for this site: click the icon beside the web address, choose Notifications, then reload this page.',
    },
    'ios-home-screen': {
        pill: 'Not available here',
        tone: 'grey',
        text: 'On iPhone and iPad this works after you add HelpHive to your Home Screen: tap Share, then Add to Home Screen, and open HelpHive from there.',
    },
    unsupported: {
        pill: 'Not supported here',
        tone: 'grey',
        text: "This browser can't show notifications from websites. Try a recent version of Chrome, Edge, Firefox or Safari.",
    },
    checking: { pill: 'Checking', tone: 'grey', text: 'Checking this browser…' },
};

export default function NotificationsPanel() {
    const snapshot = usePushSnapshot();
    const status = statusOf(snapshot);
    const { turnOn, turnOff } = usePushActions();
    const copy = COPY[status];
    const canAct = status === 'on' || status === 'off';

    return (
        <Panel
            title="Notifications"
            subtitle="Alerts on this browser. Your phone and other browsers are set up separately."
        >
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: { xs: 'column', sm: 'row' },
                    alignItems: { xs: 'stretch', sm: 'center' },
                    justifyContent: 'space-between',
                    gap: 2,
                }}
            >
                <Box sx={{ minWidth: 0 }} role="status" aria-live="polite">
                    <StatusPill tone={copy.tone} size="md">
                        {copy.pill}
                    </StatusPill>
                    <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mt: 1, maxWidth: 560 }}
                    >
                        {copy.text}
                    </Typography>
                </Box>
                {canAct && (
                    <Button
                        variant={status === 'on' ? 'outlined' : 'contained'}
                        onClick={status === 'on' ? turnOff : turnOn}
                        disabled={snapshot.busy}
                        startIcon={
                            snapshot.busy ? (
                                <CircularProgress size={16} color="inherit" />
                            ) : undefined
                        }
                        sx={{ flexShrink: 0 }}
                    >
                        {status === 'on' ? 'Turn off' : 'Turn on'}
                    </Button>
                )}
            </Box>
        </Panel>
    );
}
