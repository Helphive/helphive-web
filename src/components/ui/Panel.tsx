import type { ElementType, ReactNode } from 'react';
import { Box, Typography, type SxProps, type Theme } from '@mui/material';
import { color, hairline, radius } from '@/theme/tokens';

export interface PanelProps {
    /** Heading shown in the hairline header row. */
    title?: ReactNode;
    /** Small muted line under or beside the title. */
    subtitle?: ReactNode;
    /** Right side of the header: a link, a small button, a count. */
    actions?: ReactNode;
    /** Footer row on the subtle background (totals, "view all"). */
    footer?: ReactNode;
    /** Drop body padding for edge-to-edge content (lists, tables, rulers with own padding). */
    flush?: boolean;
    /** Heading element for the title. Defaults to h2. */
    titleComponent?: ElementType;
    component?: ElementType;
    id?: string;
    'aria-label'?: string;
    className?: string;
    sx?: SxProps<Theme>;
    children?: ReactNode;
}

/** Hairline section: the basic container for page content. No shadow, 10px radius. */
export default function Panel({
    title,
    subtitle,
    actions,
    footer,
    flush = false,
    titleComponent = 'h2',
    component = 'section',
    children,
    sx,
    ...rest
}: PanelProps) {
    const hasHeader = title || actions;
    return (
        <Box
            component={component}
            {...rest}
            sx={[
                {
                    bgcolor: color.surface,
                    border: hairline,
                    borderRadius: `${radius.md}px`,
                    minWidth: 0,
                },
                ...(Array.isArray(sx) ? sx : [sx]),
            ]}
        >
            {hasHeader && (
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 1.5,
                        px: { xs: 2, sm: 2.5 },
                        py: { xs: 1.5, sm: 2 },
                        borderBottom: children ? hairline : 0,
                        minHeight: 56,
                    }}
                >
                    <Box sx={{ minWidth: 0 }}>
                        {title && (
                            <Typography variant="h6" component={titleComponent}>
                                {title}
                            </Typography>
                        )}
                        {subtitle && (
                            <Typography variant="body2" color="text.secondary">
                                {subtitle}
                            </Typography>
                        )}
                    </Box>
                    {actions && (
                        <Box
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1,
                                flexShrink: 0,
                                fontSize: 13,
                                fontWeight: 600,
                                color: color.ink600,
                            }}
                        >
                            {actions}
                        </Box>
                    )}
                </Box>
            )}
            {children !== undefined && (
                <Box sx={flush ? undefined : { p: { xs: 2, sm: 2.5 } }}>{children}</Box>
            )}
            {footer && (
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 2,
                        px: { xs: 2, sm: 2.5 },
                        py: 1.5,
                        borderTop: hairline,
                        bgcolor: color.subtle,
                        borderRadius: `0 0 ${radius.md}px ${radius.md}px`,
                        fontSize: 13,
                    }}
                >
                    {footer}
                </Box>
            )}
        </Box>
    );
}
