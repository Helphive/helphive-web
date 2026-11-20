import { Box, Stack, Typography } from '@mui/material';
import type { Booking } from '@/types';
import { formatDateTime, getDisplayStatus } from '@/utils/format';
import { BOOKING_STATUS } from '@/components/ui/status';
import { color } from '@/theme/tokens';
import { CheckMarkIcon, CloseIcon } from '@/components/ui/icons';

type StepState = 'done' | 'current' | 'pending' | 'error';

interface Step {
    label: string;
    date?: string | null;
    state: StepState;
}

function buildTimeline(booking: Booking): Step[] {
    const status = getDisplayStatus(booking);
    const hasProvider = !!booking.providerId;
    const steps: Step[] = [{ label: 'Booked', date: booking.createdAt, state: 'done' }];

    if (status === 'cancelled' || status === 'expired') {
        if (hasProvider) steps.push({ label: 'Accepted', state: 'done' });
        if (booking.startedAt)
            steps.push({ label: 'Started', date: booking.startedAt, state: 'done' });
        steps.push({
            label: BOOKING_STATUS[status].label,
            date: booking.cancelledAt || booking.updatedAt,
            state: 'error',
        });
        return steps;
    }

    const started = status === 'in_progress' || status === 'completed';
    const flags: { label: string; date?: string | null; done: boolean }[] = [
        { label: 'Accepted', done: hasProvider },
        ...(status === 'awaiting_start_approval' ? [{ label: 'Start requested', done: true }] : []),
        { label: 'Started', date: booking.startedAt, done: started },
        { label: 'Completed', date: booking.completedAt, done: status === 'completed' },
    ];
    let currentAssigned = false;
    for (const flag of flags) {
        let state: StepState = 'pending';
        if (flag.done) state = 'done';
        else if (!currentAssigned) {
            state = 'current';
            currentAssigned = true;
        }
        steps.push({ label: flag.label, date: flag.date, state });
    }
    return steps;
}

const stateColor: Record<StepState, string> = {
    done: color.inkFill,
    current: color.brandFill,
    pending: color.lineStrong,
    error: color.redFill,
};

export default function StatusTimeline({ booking }: { booking: Booking }) {
    const steps = buildTimeline(booking);
    return (
        <Stack component="ol" sx={{ listStyle: 'none', m: 0, p: 0 }}>
            {steps.map((step, i) => {
                const last = i === steps.length - 1;
                return (
                    <Box component="li" key={step.label} sx={{ display: 'flex', gap: 2 }}>
                        <Box
                            sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
                        >
                            <Box
                                sx={{
                                    width: 20,
                                    height: 20,
                                    borderRadius: '50%',
                                    bgcolor: stateColor[step.state],
                                    color: step.state === 'done' ? color.onInk : color.onBrand,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexShrink: 0,
                                    boxShadow:
                                        step.state === 'current'
                                            ? `0 0 0 4px ${color.coral50}`
                                            : 'none',
                                    '& svg': { fontSize: 14 },
                                }}
                            >
                                {step.state === 'done' && <CheckMarkIcon weight="bold" />}
                                {step.state === 'error' && <CloseIcon weight="bold" />}
                            </Box>
                            {!last && (
                                <Box
                                    sx={{
                                        width: 2,
                                        flex: 1,
                                        minHeight: 20,
                                        bgcolor: step.state === 'done' ? color.ink900 : color.line,
                                    }}
                                />
                            )}
                        </Box>
                        <Box sx={{ pb: last ? 0 : 2, minWidth: 0, mt: '-1px' }}>
                            <Typography
                                variant="body2"
                                fontWeight={step.state === 'pending' ? 500 : 700}
                                color={step.state === 'pending' ? 'text.secondary' : 'text.primary'}
                            >
                                {step.label}
                            </Typography>
                            {step.date && (
                                <Typography variant="caption" color="text.secondary">
                                    {formatDateTime(step.date)}
                                </Typography>
                            )}
                        </Box>
                    </Box>
                );
            })}
        </Stack>
    );
}
