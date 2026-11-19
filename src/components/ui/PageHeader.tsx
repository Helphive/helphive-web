import type { ReactNode } from 'react';
import { Box, Button, Stack, Typography } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';
import { font } from '@/theme/tokens';

export interface PageHeaderProps {
    title: ReactNode;
    /** One line of context under the title. */
    subtitle?: ReactNode;
    /** Buttons on the right (stack under the title on phones). Hidden when printing. */
    actions?: ReactNode;
    /** Renders a small back link above the title. */
    backTo?: string;
    backLabel?: string;
    /** Inline next to the title, e.g. a StatusPill. */
    badge?: ReactNode;
}

/** Page title block: 28px/800 title (20px on phones), muted subtitle, actions on the right. */
export default function PageHeader({
    title,
    subtitle,
    actions,
    backTo,
    backLabel = 'Back',
    badge,
}: PageHeaderProps) {
    return (
        <Box component="header" sx={{ mb: { xs: 2.5, sm: 3 } }}>
            {backTo && (
                <Button
                    component={RouterLink}
                    to={backTo}
                    size="small"
                    startIcon={<ArrowBack />}
                    className="no-print"
                    sx={{ mb: 1, ml: -1.5 }}
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
                        sx={{ alignItems: 'center', flexWrap: 'wrap', rowGap: 0.5 }}
                    >
                        <Typography
                            variant="h3"
                            component="h1"
                            sx={{ fontSize: { xs: font.size['2xl'], sm: font.size['3xl'] } }}
                        >
                            {title}
                        </Typography>
                        {badge}
                    </Stack>
                    {subtitle && (
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
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
