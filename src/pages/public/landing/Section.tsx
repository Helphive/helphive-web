import type { ReactNode } from 'react';
import { Box, Typography, type SxProps, type Theme } from '@mui/material';
import { color, font, hairline, inDark, layout } from '@/theme/tokens';
import { HEADER_HEIGHT, sectionGutter } from './constants';
import { TONES, toneMutedSx, type SectionTone } from './tones';

/** Full-width band with a centred 1200px column. */
export function Section({
    id,
    tone = 'surface',
    bordered = true,
    decoration,
    children,
    sx,
    'aria-labelledby': labelledBy,
}: {
    id?: string;
    tone?: SectionTone;
    bordered?: boolean;
    /** Absolutely positioned background layers (patterns, washes), behind the content. */
    decoration?: ReactNode;
    children: ReactNode;
    sx?: SxProps<Theme>;
    'aria-labelledby'?: string;
}) {
    const t = TONES[tone];
    const deep = tone === 'ink';
    return (
        <Box
            component="section"
            id={id}
            aria-labelledby={labelledBy}
            // Focus target for the header's in-page links.
            tabIndex={id ? -1 : undefined}
            sx={{
                bgcolor: t.bg,
                color: t.fg,
                borderTop: bordered && !deep ? hairline : 0,
                ...(deep &&
                    inDark({
                        bgcolor: color.canvas,
                        color: color.ink900,
                        borderTop: hairline,
                        borderBottom: hairline,
                    })),
                // The coral band on dark: a warm glow on the surface rather than a large brown area.
                ...(tone === 'coral' &&
                    inDark({
                        bgcolor: color.surface,
                        backgroundImage: `radial-gradient(ellipse 75% 100% at 75% 50%, ${color.coral50} 0%, transparent 80%)`,
                    })),
                scrollMarginTop: `${HEADER_HEIGHT}px`,
                position: 'relative',
                overflow: 'hidden',
                '&:focus': { outline: 'none' },
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
                        py: { xs: 7, md: 12 },
                    },
                    ...(Array.isArray(sx) ? sx : [sx]),
                ]}
            >
                {children}
            </Box>
        </Box>
    );
}

/** Section heading: a large title with an optional lead paragraph below it. */
export function SectionHead({
    id,
    title,
    description,
    tone = 'surface',
    align = 'left',
    maxWidth = '22ch',
    sx,
}: {
    id: string;
    title: string;
    description?: ReactNode;
    tone?: SectionTone;
    align?: 'left' | 'center';
    maxWidth?: string;
    sx?: SxProps<Theme>;
}) {
    return (
        <Box
            data-reveal=""
            sx={[
                {
                    mb: { xs: 4, md: 6 },
                    textAlign: align,
                    mx: align === 'center' ? 'auto' : 0,
                },
                ...(Array.isArray(sx) ? sx : [sx]),
            ]}
        >
            <Typography
                id={id}
                variant="h2"
                sx={{
                    color: 'inherit',
                    fontSize: font.size['4xl'],
                    letterSpacing: font.tracking.display,
                    lineHeight: 1.1,
                    maxWidth,
                    mx: align === 'center' ? 'auto' : 0,
                    textWrap: 'balance',
                }}
            >
                {title}
            </Typography>
            {description && (
                <Typography
                    sx={{
                        mt: 2,
                        maxWidth: '54ch',
                        mx: align === 'center' ? 'auto' : 0,
                        ...toneMutedSx(tone),
                        fontSize: { xs: font.size.lg, md: font.size.xl },
                        lineHeight: 1.55,
                    }}
                >
                    {description}
                </Typography>
            )}
        </Box>
    );
}
