import type { ReactNode } from 'react';
import { Box, type SxProps, type Theme } from '@mui/material';
import { color, font, hairline, radius } from '@/theme/tokens';

interface StatTileProps {
    label: ReactNode;
    value: ReactNode;
    /** Muted line under the value ("Released after completion"). */
    hint?: ReactNode;
    /** Small action aligned with the value (e.g. a size="small" Button). */
    action?: ReactNode;
    /** Span the whole first row on phones (use for the headline figure). */
    featured?: boolean;
}

/** One figure with its label. Place inside StatGroup so tiles share hairline dividers. */
export function StatTile({ label, value, hint, action, featured }: StatTileProps) {
    return (
        <Box
            sx={{
                display: 'grid',
                gap: 0.5,
                alignContent: 'start',
                p: { xs: 2, sm: 2.5 },
                borderRight: hairline,
                borderBottom: hairline,
                minWidth: 0,
                gridColumn: featured ? { xs: '1 / -1', md: 'auto' } : undefined,
            }}
        >
            <Box sx={{ fontSize: font.size.xs, fontWeight: 600, color: color.ink500 }}>{label}</Box>
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-end',
                    gap: 1.5,
                    flexWrap: 'wrap',
                }}
            >
                <Box
                    sx={{
                        fontSize: { xs: font.size['2xl'], sm: font.size['3xl'] },
                        fontWeight: 800,
                        letterSpacing: font.tracking.head,
                        lineHeight: 1.15,
                        fontVariantNumeric: 'tabular-nums',
                        color: color.ink900,
                    }}
                >
                    {value}
                </Box>
                {action}
            </Box>
            {hint && (
                <Box sx={{ fontSize: font.size.xs, fontWeight: 600, color: color.ink500 }}>
                    {hint}
                </Box>
            )}
        </Box>
    );
}

interface StatGroupProps {
    /** Columns from md up; phones get 2 (featured tiles span both). */
    columns?: number;
    'aria-label'?: string;
    sx?: SxProps<Theme>;
    children: ReactNode;
}

/** Hairline panel that lays out StatTiles in a row with dividers instead of separate cards. */
export function StatGroup({ columns = 3, sx, children, ...rest }: StatGroupProps) {
    return (
        <Box
            {...rest}
            sx={[
                {
                    bgcolor: color.surface,
                    border: hairline,
                    borderRadius: `${radius.md}px`,
                    overflow: 'hidden',
                },
                ...(Array.isArray(sx) ? sx : [sx]),
            ]}
        >
            <Box
                sx={{
                    display: 'grid',
                    gridTemplateColumns: {
                        xs: 'repeat(2, minmax(0, 1fr))',
                        md: `repeat(${columns}, minmax(0, 1fr))`,
                    },
                    // Pull the outer right/bottom hairlines under the frame border.
                    mr: '-1px',
                    mb: '-1px',
                }}
            >
                {children}
            </Box>
        </Box>
    );
}

export default StatTile;
