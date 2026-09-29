import type { ReactNode } from 'react';
import { Box, Typography } from '@mui/material';

interface EmptyStateProps {
    icon?: ReactNode;
    title: string;
    description?: string;
    action?: ReactNode;
}

export default function EmptyState({ icon, title, description, action }: EmptyStateProps) {
    return (
        <Box
            sx={{
                textAlign: 'center',
                py: { xs: 6, sm: 8 },
                px: 2,
                border: '1px dashed',
                borderColor: 'divider',
                borderRadius: 2,
                bgcolor: 'background.paper',
            }}
        >
            {icon && (
                <Box
                    sx={{
                        width: 56,
                        height: 56,
                        borderRadius: '50%',
                        bgcolor: 'primary.main',
                        color: 'primary.contrastText',
                        opacity: 0.9,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mx: 'auto',
                        mb: 2,
                    }}
                >
                    {icon}
                </Box>
            )}
            <Typography variant="h6" fontWeight={600} sx={{ mb: description ? 0.5 : 0 }}>
                {title}
            </Typography>
            {description && (
                <Typography color="text.secondary" sx={{ maxWidth: 420, mx: 'auto' }}>
                    {description}
                </Typography>
            )}
            {action && <Box sx={{ mt: 3 }}>{action}</Box>}
        </Box>
    );
}
