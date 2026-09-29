import type { ReactNode } from 'react';
import { Box, Button, Stack, Typography } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

interface PageHeaderProps {
    title: string;
    subtitle?: string;
    actions?: ReactNode;
    // Renders a "back" button above the title.
    backTo?: string;
    backLabel?: string;
    // Extra content rendered next to the title (e.g. a status chip).
    badge?: ReactNode;
}

export default function PageHeader({
    title,
    subtitle,
    actions,
    backTo,
    backLabel = 'Back',
    badge,
}: PageHeaderProps) {
    const navigate = useNavigate();
    return (
        <Box sx={{ mb: { xs: 2.5, sm: 4 } }}>
            {backTo && (
                <Button
                    startIcon={<ArrowBack />}
                    onClick={() => navigate(backTo)}
                    sx={{ mb: 1.5, ml: -1 }}
                    color="inherit"
                    className="no-print"
                >
                    {backLabel}
                </Button>
            )}
            <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={2}
                sx={{ justifyContent: 'space-between', alignItems: { sm: 'center' } }}
            >
                <Box sx={{ minWidth: 0 }}>
                    <Stack
                        direction="row"
                        spacing={1.5}
                        sx={{ alignItems: 'center', flexWrap: 'wrap' }}
                    >
                        <Typography variant="h4" component="h1" fontWeight={700}>
                            {title}
                        </Typography>
                        {badge}
                    </Stack>
                    {subtitle && (
                        <Typography color="text.secondary" sx={{ mt: 0.5 }}>
                            {subtitle}
                        </Typography>
                    )}
                </Box>
                {actions && (
                    <Stack
                        direction="row"
                        spacing={1}
                        className="no-print"
                        sx={{ flexShrink: 0, flexWrap: 'wrap', rowGap: 1 }}
                    >
                        {actions}
                    </Stack>
                )}
            </Stack>
        </Box>
    );
}
