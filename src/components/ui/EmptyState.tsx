import type { ReactNode } from 'react';
import { Box, Typography, type SxProps, type Theme } from '@mui/material';
import { color, hairline, radius } from '@/theme/tokens';

export interface EmptyStateProps {
    icon?: ReactNode;
    /** What is empty, in plain words ("No bookings yet"). */
    title: string;
    /** What the person can do about it. */
    description?: ReactNode;
    /** Usually one Button that starts the next step. */
    action?: ReactNode;
    /** Drop the frame when the empty state already sits inside a Panel. */
    bare?: boolean;
    sx?: SxProps<Theme>;
}

/** Empty list or page. Treat it as an invitation to act, not a mood. */
export default function EmptyState({
    icon,
    title,
    description,
    action,
    bare,
    sx,
}: EmptyStateProps) {
    return (
        <Box
            sx={[
                {
                    textAlign: 'center',
                    py: { xs: 5, sm: 7 },
                    px: 2,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                },
                bare
                    ? {}
                    : {
                          bgcolor: color.surface,
                          border: hairline,
                          borderRadius: `${radius.md}px`,
                      },
                ...(Array.isArray(sx) ? sx : [sx]),
            ]}
        >
            {icon && (
                <Box
                    aria-hidden="true"
                    sx={{
                        width: 44,
                        height: 44,
                        borderRadius: `${radius.sm}px`,
                        bgcolor: color.coral50,
                        color: color.coral700,
                        display: 'grid',
                        placeItems: 'center',
                        mb: 2,
                        '& svg': { fontSize: 22 },
                    }}
                >
                    {icon}
                </Box>
            )}
            <Typography variant="h6" component="p">
                {title}
            </Typography>
            {description && (
                <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mt: 0.5, maxWidth: '46ch' }}
                >
                    {description}
                </Typography>
            )}
            {action && <Box sx={{ mt: 2.5 }}>{action}</Box>}
        </Box>
    );
}
