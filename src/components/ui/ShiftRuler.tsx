import { memo, useMemo } from 'react';
import { Box, useMediaQuery, useTheme, type SxProps, type Theme } from '@mui/material';
import { color, font, hairline, radius } from '@/theme/tokens';
import { formatHour, pickTickStep, toHour, type TimeInput } from './rulerTime';

export interface ShiftBlock {
    start: TimeInput;
    /** End time; or give `hours` instead. */
    end?: TimeInput;
    hours?: number;
    /** Text inside the block. Defaults to "08:00 to 14:00". */
    label?: string;
    /** coral: the booking in focus. ink: other bookings. soft: tentative or past. */
    tone?: 'coral' | 'ink' | 'soft';
    key?: string | number;
}

export interface ShiftRulerProps {
    blocks: ShiftBlock[];
    /** First visible hour (default 6). The range grows to fit blocks unless `fixed`. */
    from?: number;
    /** Last visible hour (default 22). Can exceed 24 for overnight shifts. */
    to?: number;
    fixed?: boolean;
    /** Draws the "now" marker. */
    now?: TimeInput;
    /** Hours between scale labels; picked automatically when omitted. */
    tickEvery?: number;
    hideScale?: boolean;
    /** Accessible summary; generated from the blocks when omitted. */
    'aria-label'?: string;
    sx?: SxProps<Theme>;
}

const TONES = {
    coral: { bg: color.coral500, fg: '#FFFFFF', ring: 'none' },
    ink: { bg: color.ink900, fg: '#FFFFFF', ring: 'none' },
    soft: { bg: color.coral50, fg: color.coral700, ring: `inset 0 0 0 1px ${color.coral100}` },
} as const;

/**
 * The signature component: an hours bar with each booking drawn as a block.
 * Times render as 24-hour "HH:mm" with tabular figures.
 */
export const ShiftRuler = memo(function ShiftRuler({
    blocks,
    from = 6,
    to = 22,
    fixed = false,
    now,
    tickEvery,
    hideScale = false,
    sx,
    ...rest
}: ShiftRulerProps) {
    const theme = useTheme();
    const isPhone = useMediaQuery(theme.breakpoints.down('sm'));

    const spans = useMemo(
        () =>
            blocks.map((b, i) => {
                const start = toHour(b.start);
                let end = b.end !== undefined ? toHour(b.end) : start + (b.hours ?? 1);
                if (end <= start) end += 24; // overnight
                return { ...b, start, end, key: b.key ?? i };
            }),
        [blocks]
    );

    let lo = from;
    let hi = to;
    if (!fixed) {
        for (const s of spans) {
            lo = Math.min(lo, Math.floor(s.start / 2) * 2);
            hi = Math.max(hi, Math.ceil(s.end / 2) * 2);
        }
    }
    const range = Math.max(1, hi - lo);
    const pct = (h: number) => `${((Math.min(Math.max(h, lo), hi) - lo) / range) * 100}%`;

    const step = tickEvery ?? pickTickStep(range, isPhone ? 5 : 7);
    const ticks: number[] = [];
    for (let h = lo; h <= hi + 1e-9; h += step) ticks.push(h);

    const nowHour = now !== undefined ? toHour(now) : undefined;
    const summary =
        rest['aria-label'] ??
        `Shift ruler, ${formatHour(lo)} to ${formatHour(hi)}: ` +
            (spans.length
                ? spans
                      .map(
                          (s) =>
                              `${s.label ? `${s.label}, ` : ''}${formatHour(s.start)} to ${formatHour(s.end)}`
                      )
                      .join('; ')
                : 'no bookings');

    return (
        <Box
            role="img"
            aria-label={summary}
            sx={[{ position: 'relative', minWidth: 0 }, ...(Array.isArray(sx) ? sx : [sx])]}
        >
            <Box
                sx={{
                    position: 'relative',
                    height: 28,
                    border: hairline,
                    borderRadius: `${radius.sm}px`,
                    background: `linear-gradient(to right, ${color.line} 1px, transparent 1px) 0 0 / calc(100% / ${range}) 100%, ${color.subtle}`,
                }}
            >
                {spans.map((s) => {
                    const t = TONES[s.tone ?? 'coral'];
                    const widthPct = ((Math.min(s.end, hi) - Math.max(s.start, lo)) / range) * 100;
                    const text = s.label ?? `${formatHour(s.start)} to ${formatHour(s.end)}`;
                    const showText = widthPct >= (isPhone ? 30 : 18);
                    return (
                        <Box
                            key={s.key}
                            title={`${s.label ? `${s.label}, ` : ''}${formatHour(s.start)} to ${formatHour(s.end)}`}
                            sx={{
                                position: 'absolute',
                                top: 3,
                                bottom: 3,
                                left: pct(s.start),
                                width: `${Math.max(widthPct, 0.5)}%`,
                                borderRadius: '4px',
                                bgcolor: t.bg,
                                color: t.fg,
                                boxShadow: t.ring,
                                display: 'flex',
                                alignItems: 'center',
                                px: 1,
                                fontSize: font.size.xs,
                                fontWeight: 700,
                                overflow: 'hidden',
                                whiteSpace: 'nowrap',
                                textOverflow: 'ellipsis',
                            }}
                        >
                            {showText && (
                                <Box
                                    component="span"
                                    sx={{ overflow: 'hidden', textOverflow: 'ellipsis' }}
                                >
                                    {text}
                                </Box>
                            )}
                        </Box>
                    );
                })}
                {nowHour !== undefined && nowHour >= lo && nowHour <= hi && (
                    <Box
                        sx={{
                            position: 'absolute',
                            top: -4,
                            bottom: -4,
                            left: pct(nowHour),
                            width: 2,
                            ml: '-1px',
                            borderRadius: 2,
                            bgcolor: color.ink900,
                            '&::after': {
                                content: '""',
                                position: 'absolute',
                                top: -3,
                                left: -3,
                                width: 8,
                                height: 8,
                                borderRadius: '50%',
                                bgcolor: color.ink900,
                            },
                        }}
                    />
                )}
            </Box>
            {!hideScale && (
                <Box sx={{ position: 'relative', height: 16, mt: '6px' }}>
                    {ticks.map((h) => (
                        <Box
                            key={h}
                            component="span"
                            sx={{
                                position: 'absolute',
                                left: pct(h),
                                // Anchor slides from left-aligned at the start to right-aligned at the end.
                                transform: `translateX(-${((h - lo) / range) * 100}%)`,
                                fontSize: 11,
                                fontWeight: 600,
                                lineHeight: '16px',
                                color: color.ink500,
                                fontVariantNumeric: 'tabular-nums',
                                whiteSpace: 'nowrap',
                            }}
                        >
                            {formatHour(h)}
                        </Box>
                    ))}
                </Box>
            )}
        </Box>
    );
});

export default ShiftRuler;
