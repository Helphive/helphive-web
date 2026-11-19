import { Box, type SxProps, type Theme } from '@mui/material';
import { color, font } from '@/theme/tokens';
import { srOnly } from './status';

export interface StepItem {
    label: string;
    /** Short label for phones ("Date" for "Date and time"). */
    short?: string;
}

interface StepProgressProps {
    steps: (string | StepItem)[];
    /** Zero-based index of the current step. Steps before it are done. Use steps.length when all are done. */
    current: number;
    /** Accessible name for the list, e.g. "Booking steps". */
    'aria-label'?: string;
    sx?: SxProps<Theme>;
}

/**
 * Segmented step header: a 3px bar per step with its label below.
 * Done = ink, current = coral, upcoming = strong hairline. Also works as a status track.
 */
export default function StepProgress({ steps, current, sx, ...rest }: StepProgressProps) {
    const items = steps.map((s) => (typeof s === 'string' ? { label: s } : s));
    return (
        <Box
            component="ol"
            aria-label={rest['aria-label'] ?? 'Progress'}
            sx={[
                {
                    listStyle: 'none',
                    m: 0,
                    p: 0,
                    display: 'grid',
                    gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))`,
                    gap: 1,
                },
                ...(Array.isArray(sx) ? sx : [sx]),
            ]}
        >
            {items.map((step, i) => {
                const state = i < current ? 'done' : i === current ? 'current' : 'next';
                return (
                    <Box
                        component="li"
                        key={step.label}
                        aria-current={state === 'current' ? 'step' : undefined}
                        sx={{
                            position: 'relative',
                            borderTop: { xs: '4px solid', sm: '3px solid' },
                            borderColor:
                                state === 'done'
                                    ? color.ink900
                                    : state === 'current'
                                      ? color.coral500
                                      : color.lineStrong,
                            pt: 1,
                            fontSize: { xs: 11, sm: font.size.xs },
                            fontWeight: 700,
                            lineHeight: 1.3,
                            color: state === 'next' ? color.ink500 : color.ink900,
                            minWidth: 0,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                        }}
                    >
                        <Box
                            component="span"
                            sx={(theme) => ({ [theme.breakpoints.down('sm')]: srOnly })}
                        >
                            {step.label}
                        </Box>
                        <Box
                            component="span"
                            aria-hidden="true"
                            sx={{ display: { xs: 'inline', sm: 'none' } }}
                        >
                            {step.short ?? step.label}
                        </Box>
                        <Box component="span" sx={srOnly}>
                            {state === 'done' ? ', done' : state === 'current' ? ', current' : ''}
                        </Box>
                    </Box>
                );
            })}
        </Box>
    );
}
