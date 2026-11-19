import { Box, Typography } from '@mui/material';
import { DataList, DataRow, Money, ShiftRuler, StatusPill } from '@/components/ui';
import { color, font, hairline, hairlineStrong, radius, shadow } from '@/theme/tokens';

const PROGRESS = [
    { label: 'Scheduled', state: 'done' },
    { label: 'Accepted', state: 'now' },
    { label: 'In progress', state: 'todo' },
    { label: 'Completed', state: 'todo' },
] as const;

const BAR_COLOR = { done: color.ink900, now: color.coral500, todo: color.line } as const;

/** Illustrative booking: the same ticket a customer sees, with the shift ruler. */
export default function BookingTicket() {
    return (
        <Box
            component="article"
            aria-label="Example booking"
            sx={{
                bgcolor: color.surface,
                border: hairlineStrong,
                borderRadius: `${radius.md}px`,
                boxShadow: shadow.float,
                minWidth: 0,
            }}
        >
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: 2,
                    px: { xs: 2, sm: 2.5 },
                    py: 2,
                    borderBottom: hairline,
                }}
            >
                <Typography variant="h6" component="h3">
                    Room Attendant
                </Typography>
                <StatusPill tone="blue">Accepted</StatusPill>
            </Box>
            <DataList variant="grid" columns={{ xs: 2, sm: 4 }} sx={{ borderBottom: hairline }}>
                <DataRow label="Date" value="Sat 21 Nov" />
                <DataRow label="Start" value="08:00" />
                <DataRow label="Hours" value="6" />
                <DataRow label="Rate" value="$30/hr" />
            </DataList>
            <Box sx={{ p: { xs: 2, sm: 2.5 } }}>
                <ShiftRuler blocks={[{ start: 8, end: 14 }]} from={6} to={18} fixed />
                <Box
                    component="ol"
                    aria-label="Booking progress"
                    sx={{
                        listStyle: 'none',
                        p: 0,
                        m: 0,
                        mt: 2.5,
                        display: 'grid',
                        gridTemplateColumns: 'repeat(4, 1fr)',
                        gap: 0.5,
                    }}
                >
                    {PROGRESS.map((step) => (
                        <Box
                            component="li"
                            key={step.label}
                            aria-current={step.state === 'now' ? 'step' : undefined}
                            sx={{
                                borderTop: `3px solid ${BAR_COLOR[step.state]}`,
                                pt: 1,
                                fontSize: font.size.xs,
                                fontWeight: 600,
                                color: step.state === 'todo' ? color.ink500 : color.ink900,
                            }}
                        >
                            {step.label}
                        </Box>
                    ))}
                </Box>
            </Box>
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: 2,
                    px: { xs: 2, sm: 2.5 },
                    py: 2,
                    borderTop: hairline,
                    bgcolor: color.subtle,
                    borderRadius: `0 0 ${radius.md}px ${radius.md}px`,
                }}
            >
                <Box>
                    <Typography variant="caption" component="p">
                        Example booking
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        6 hours at $30/hr
                    </Typography>
                </Box>
                <Box sx={{ textAlign: 'right' }}>
                    <Typography variant="caption" component="p">
                        Total
                    </Typography>
                    <Money amount={180} size="xl" />
                </Box>
            </Box>
        </Box>
    );
}
