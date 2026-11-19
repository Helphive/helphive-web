import { useContext, type ReactNode } from 'react';
import { Box, type SxProps, type Theme } from '@mui/material';
import { color, font, hairline } from '@/theme/tokens';
import { DataListContext, type DataListVariant } from './dataListContext';

type Columns = number | { xs?: number; sm?: number; md?: number; lg?: number };

interface DataListProps {
    /**
     * inline: label left, value right (summaries, price breakdowns).
     * stacked: label above value, one per row (detail pages, profile).
     * grid: label above value in hairline-separated columns (the booking "ticket" strip).
     */
    variant?: DataListVariant;
    /**
     * Columns for grid (default 4, 2 on phones) and stacked (default 1).
     * A number means 2 on phones and n from sm up; pass { xs, sm, md } to control each step.
     */
    columns?: Columns;
    sx?: SxProps<Theme>;
    children: ReactNode;
}

const toTemplate = (n: number) => `repeat(${n}, minmax(0, 1fr))`;

/** Semantic <dl> of label/value pairs. Children are DataRow elements. */
export function DataList({ variant = 'inline', columns, sx, children }: DataListProps) {
    const n = columns ?? (variant === 'grid' ? 4 : 1);
    const cols =
        typeof n === 'number'
            ? { xs: toTemplate(Math.min(n, 2)), sm: toTemplate(n) }
            : Object.fromEntries(Object.entries(n).map(([k, v]) => [k, toTemplate(v)]));
    const base =
        variant === 'grid'
            ? {
                  display: 'grid',
                  gridTemplateColumns: cols,
                  // Each cell draws right and bottom hairlines; the outer edge ones are clipped.
                  clipPath: 'inset(0 1px 1px 0)',
              }
            : variant === 'stacked'
              ? { display: 'grid', gap: 2, gridTemplateColumns: cols }
              : { display: 'grid' };
    return (
        <DataListContext.Provider value={variant}>
            <Box component="dl" sx={[{ m: 0, ...base }, ...(Array.isArray(sx) ? sx : [sx])]}>
                {children}
            </Box>
        </DataListContext.Provider>
    );
}

interface DataRowProps {
    label: ReactNode;
    /** Value; children are used when omitted. */
    value?: ReactNode;
    children?: ReactNode;
    /** Bolder, larger value (totals). */
    emphasis?: boolean;
    /** Span all columns (grid and stacked). */
    wide?: boolean;
}

export function DataRow({ label, value, children, emphasis, wide }: DataRowProps) {
    const variant = useContext(DataListContext);
    const content = value ?? children;
    const labelSx = {
        fontSize: variant === 'inline' ? font.size.md : font.size.xs,
        fontWeight: variant === 'inline' ? 500 : 600,
        color: color.ink500,
    };
    const valueSx = {
        m: 0,
        minWidth: 0,
        fontWeight: emphasis ? 800 : variant === 'grid' ? 700 : 600,
        fontSize: emphasis ? font.size['2xl'] : variant === 'grid' ? font.size.lg : font.size.md,
        letterSpacing: emphasis ? font.tracking.head : 0,
        color: color.ink900,
        fontVariantNumeric: 'tabular-nums',
        overflowWrap: 'anywhere' as const,
    };

    if (variant === 'inline') {
        return (
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'baseline',
                    gap: 2,
                    py: 1,
                }}
            >
                <Box component="dt" sx={{ ...labelSx, flexShrink: 0 }}>
                    {label}
                </Box>
                <Box component="dd" sx={{ ...valueSx, textAlign: 'right' }}>
                    {content}
                </Box>
            </Box>
        );
    }

    return (
        <Box
            sx={{
                minWidth: 0,
                gridColumn: wide ? '1 / -1' : undefined,
                ...(variant === 'grid'
                    ? {
                          borderRight: hairline,
                          borderBottom: hairline,
                          px: { xs: 2, sm: 2.5 },
                          py: 1.5,
                      }
                    : null),
            }}
        >
            <Box component="dt" sx={labelSx}>
                {label}
            </Box>
            <Box component="dd" sx={{ ...valueSx, mt: 0.25 }}>
                {content}
            </Box>
        </Box>
    );
}

export default DataList;
