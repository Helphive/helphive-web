import { memo, type ReactNode } from 'react';
import { Box, type SxProps, type Theme } from '@mui/material';
import type { DisplayStatus } from '@/types';
import { BOOKING_STATUS, TONE_STYLES, type Tone } from './status';

interface StatusPillProps {
    tone?: Tone;
    children: ReactNode;
    size?: 'sm' | 'md';
    sx?: SxProps<Theme>;
}

/** Dot pill for status. The only fully rounded element besides counts. */
export const StatusPill = memo(function StatusPill({
    tone = 'grey',
    size = 'sm',
    children,
    sx,
}: StatusPillProps) {
    const t = TONE_STYLES[tone];
    return (
        <Box
            component="span"
            sx={[
                {
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    height: size === 'sm' ? 22 : 26,
                    px: size === 'sm' ? 1 : 1.25,
                    borderRadius: 999,
                    fontSize: size === 'sm' ? 12 : 13,
                    fontWeight: 700,
                    lineHeight: 1,
                    whiteSpace: 'nowrap',
                    flexShrink: 0,
                    color: t.fg,
                    bgcolor: t.bg,
                    border: `1px solid ${t.border}`,
                    '&::before': {
                        content: '""',
                        width: 6,
                        height: 6,
                        borderRadius: '50%',
                        bgcolor: 'currentColor',
                    },
                },
                ...(Array.isArray(sx) ? sx : [sx]),
            ]}
        >
            {children}
        </Box>
    );
});

/** StatusPill for a booking's display status, with the shared label and tone. */
export function BookingStatusPill({ status, size }: { status: DisplayStatus; size?: 'sm' | 'md' }) {
    const meta = BOOKING_STATUS[status] ?? BOOKING_STATUS.scheduled;
    return (
        <StatusPill tone={meta.tone} size={size}>
            {meta.label}
        </StatusPill>
    );
}

/** Small neutral count pill for tabs and navigation ("Active 1"). */
export function Count({ value, label }: { value: number; label?: string }) {
    return (
        <Box
            component="span"
            aria-label={label}
            sx={{
                display: 'inline-grid',
                placeItems: 'center',
                minWidth: 20,
                height: 18,
                px: '6px',
                borderRadius: 999,
                fontSize: 11,
                fontWeight: 700,
                lineHeight: 1,
                color: 'grey.700',
                bgcolor: 'grey.100',
                border: '1px solid',
                borderColor: 'divider',
            }}
        >
            {value}
        </Box>
    );
}

export default StatusPill;
