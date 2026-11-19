import type { ReactNode } from 'react';
import { Box, Typography, type SxProps, type Theme } from '@mui/material';
import { color, hairline, layout } from '@/theme/tokens';
import { sectionGutter } from './constants';

/** Full-width band with a centred 1200px column. */
export function Section({
    id,
    bordered = true,
    bg = color.surface,
    decoration,
    children,
    sx,
    'aria-labelledby': labelledBy,
}: {
    id?: string;
    bordered?: boolean;
    bg?: string;
    /** Absolutely positioned background layers (patterns, washes), behind the content. */
    decoration?: ReactNode;
    children: ReactNode;
    sx?: SxProps<Theme>;
    'aria-labelledby'?: string;
}) {
    return (
        <Box
            component="section"
            id={id}
            aria-labelledby={labelledBy}
            sx={{
                bgcolor: bg,
                borderTop: bordered ? hairline : 0,
                // Keep anchored headings clear of the sticky header (68px).
                scrollMarginTop: '68px',
                position: 'relative',
                overflow: 'hidden',
            }}
        >
            {decoration}
            <Box
                sx={[
                    {
                        position: 'relative',
                        maxWidth: layout.contentMaxWidth,
                        mx: 'auto',
                        px: sectionGutter,
                        py: { xs: 5, md: 6 },
                    },
                    ...(Array.isArray(sx) ? sx : [sx]),
                ]}
            >
                {children}
            </Box>
        </Box>
    );
}

export function SectionHead({
    id,
    title,
    description,
}: {
    id: string;
    title: string;
    description?: string;
}) {
    return (
        <Box
            sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-end',
                gap: { xs: 1, md: 3 },
                mb: { xs: 3, md: 4 },
                flexWrap: 'wrap',
            }}
        >
            <Typography
                id={id}
                variant="h3"
                component="h2"
                sx={{ fontSize: { xs: '1.25rem', sm: '1.75rem' } }}
            >
                {title}
            </Typography>
            {description && (
                <Typography color="text.secondary" sx={{ maxWidth: '52ch' }}>
                    {description}
                </Typography>
            )}
        </Box>
    );
}
