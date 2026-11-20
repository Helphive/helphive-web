// One soft, dismissible card under the notifications bell for signed-in people who have not decided yet (browser
// permission is still "default"). Not a modal, never shown on page load without a pause, and "Not now" hides it for
// 30 days. It does not ask the browser anything until "Turn on" is pressed.
import { useEffect, useState } from 'react';
import { Box, Button, Popper, Stack, Typography } from '@mui/material';
import { color, hairline, radius, shadow } from '@/theme/tokens';
import { usePushActions } from './usePushActions';
import { usePushSnapshot } from './pushState';

const DISMISSED_KEY = 'hh-push-prompt-dismissed';
const HIDE_MS = 30 * 24 * 60 * 60 * 1000;
const SHOW_AFTER_MS = 2500;

const dismissedRecently = (now = Date.now()) => {
    try {
        const at = Number(localStorage.getItem(DISMISSED_KEY));
        return Number.isFinite(at) && at > 0 && now - at < HIDE_MS;
    } catch {
        return false;
    }
};

export default function PushPrompt({ anchorEl }: { anchorEl: HTMLElement | null }) {
    const snapshot = usePushSnapshot();
    const { turnOn } = usePushActions();
    const [hidden, setHidden] = useState(dismissedRecently);
    const [waited, setWaited] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setWaited(true), SHOW_AFTER_MS);
        return () => clearTimeout(timer);
    }, []);

    const undecided = snapshot.support === 'ok' && snapshot.permission === 'default';
    // The app renders a bell for each screen size; only the one on screen carries the card.
    const onScreen = !!anchorEl && anchorEl.offsetParent !== null;
    if (!waited || hidden || !undecided || !onScreen) return null;

    const notNow = () => {
        try {
            localStorage.setItem(DISMISSED_KEY, String(Date.now()));
        } catch {
            // Without storage it simply comes back next visit.
        }
        setHidden(true);
    };

    return (
        <Popper
            open
            anchorEl={anchorEl}
            placement="bottom-end"
            // In a portal on purpose: inside the sidebar or top bar it is trapped in their layer and the page paints
            // over it. Above the bars, below menus and dialogs. Kept inside the window with a 12px margin.
            modifiers={[
                { name: 'offset', options: { offset: [0, 10] } },
                { name: 'preventOverflow', options: { padding: 12, altAxis: true } },
            ]}
            sx={(theme) => ({ zIndex: theme.zIndex.modal - 1 })}
        >
            <Box
                role="region"
                aria-label="Turn on notifications"
                onKeyDown={(e) => {
                    if (e.key === 'Escape') notNow();
                }}
                sx={{
                    width: 'min(320px, calc(100vw - 24px))',
                    p: 2,
                    bgcolor: color.raised,
                    border: hairline,
                    borderRadius: `${radius.md}px`,
                    boxShadow: shadow.float,
                }}
            >
                <Typography variant="subtitle2" component="h2">
                    Get alerts from HelpHive
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    Hear about bookings, payments and new messages, even when this tab is closed.
                </Typography>
                <Stack direction="row" spacing={1} sx={{ mt: 1.5, justifyContent: 'flex-end' }}>
                    <Button size="small" onClick={notNow} disabled={snapshot.busy}>
                        Not now
                    </Button>
                    <Button
                        size="small"
                        variant="contained"
                        onClick={() => void turnOn()}
                        disabled={snapshot.busy}
                    >
                        Turn on
                    </Button>
                </Stack>
            </Box>
        </Popper>
    );
}
