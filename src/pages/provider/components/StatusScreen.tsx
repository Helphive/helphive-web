import { cloneElement, isValidElement, type ReactElement, type ReactNode } from 'react';
import { Box, Link, Stack, Typography } from '@mui/material';
import { color, font, radius } from '@/theme/tokens';
import { PageHeader, Panel, StatusPill, TONE_STYLES, type Tone } from '@/components/ui';
import { SUPPORT_EMAIL } from '../constants';
import OnboardingFrame from './OnboardingFrame';
import type { AppIconProps } from '@/components/ui/icons';

interface StatusScreenProps {
    tone: Tone;
    /** Text of the status pill next to the title ("In review"). */
    statusLabel: string;
    icon: ReactNode;
    title: string;
    /** What happened, in one or two sentences. */
    description: ReactNode;
    /** Extra block between the header and the next steps (e.g. the rejection reason). */
    notice?: ReactNode;
    nextTitle?: string;
    /** What happens next, in order. */
    next?: string[];
    /** Buttons the person can use now. */
    actions: ReactNode;
    /** Show the support line under the actions. */
    support?: boolean;
}

/** Calm status page: what happened, what happens next, what you can do. */
export default function StatusScreen({
    tone,
    statusLabel,
    icon,
    title,
    description,
    notice,
    nextTitle = 'What happens next',
    next,
    actions,
    support = true,
}: StatusScreenProps) {
    const t = TONE_STYLES[tone];
    return (
        <OnboardingFrame>
            <Box
                aria-hidden="true"
                sx={{
                    width: 48,
                    height: 48,
                    mb: 2,
                    borderRadius: `${radius.sm}px`,
                    bgcolor: t.bg,
                    color: t.fg,
                    border: `1px solid ${t.border}`,
                    display: 'grid',
                    placeItems: 'center',
                    '& svg': { fontSize: 26 },
                }}
            >
                {isValidElement(icon)
                    ? cloneElement(icon as ReactElement<AppIconProps>, { weight: 'duotone' })
                    : icon}
            </Box>
            <PageHeader
                title={title}
                subtitle={description}
                badge={<StatusPill tone={tone}>{statusLabel}</StatusPill>}
            />
            <Stack spacing={2.5}>
                {notice}
                {next && next.length > 0 && (
                    <Panel title={nextTitle}>
                        <Box
                            component="ol"
                            sx={{
                                listStyle: 'none',
                                m: 0,
                                p: 0,
                                display: 'grid',
                                gap: 1.5,
                                counterReset: 'step',
                            }}
                        >
                            {next.map((text) => (
                                <Box
                                    component="li"
                                    key={text}
                                    sx={{
                                        display: 'grid',
                                        gridTemplateColumns: '24px minmax(0, 1fr)',
                                        columnGap: 1.5,
                                        alignItems: 'start',
                                        counterIncrement: 'step',
                                        fontSize: font.size.md,
                                        color: color.ink700,
                                        '&::before': {
                                            content: 'counter(step)',
                                            display: 'grid',
                                            placeItems: 'center',
                                            width: 24,
                                            height: 24,
                                            borderRadius: `${radius.sm}px`,
                                            bgcolor: color.canvas,
                                            border: '1px solid',
                                            borderColor: color.line,
                                            fontSize: font.size.xs,
                                            fontWeight: 700,
                                            color: color.ink900,
                                        },
                                    }}
                                >
                                    <span>{text}</span>
                                </Box>
                            ))}
                        </Box>
                    </Panel>
                )}
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                    {actions}
                </Stack>
                {support && (
                    <Typography variant="body2" color="text.secondary">
                        Questions? Email{' '}
                        <Link href={`mailto:${SUPPORT_EMAIL}`} underline="always">
                            {SUPPORT_EMAIL}
                        </Link>
                        .
                    </Typography>
                )}
            </Stack>
        </OnboardingFrame>
    );
}
