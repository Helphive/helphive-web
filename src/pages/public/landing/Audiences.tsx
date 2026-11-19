import type { ReactNode } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Box, Button, Link, Typography } from '@mui/material';
import { Panel } from '@/components/ui';
import { demoLoginPath, type DemoKey } from '@/pages/auth/demoAccounts';
import { color, radius } from '@/theme/tokens';
import { coralWash } from './backgrounds';
import PhoneImage, { type PhoneScreen } from './PhoneImage';
import { Section, SectionHead } from './Section';

function AudiencePanel({
    title,
    text,
    action,
    demo,
    demoLabel,
    screen,
}: {
    title: string;
    text: string;
    action: ReactNode;
    demo: DemoKey;
    demoLabel: string;
    screen: PhoneScreen;
}) {
    return (
        <Panel title={title} titleComponent="h3" flush>
            <Box
                sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', sm: 'minmax(0, 1fr) 210px' },
                    alignItems: 'stretch',
                }}
            >
                <Box sx={{ p: { xs: 2, sm: 2.5 }, display: 'flex', flexDirection: 'column' }}>
                    <Typography color="text.secondary">{text}</Typography>
                    <Box sx={{ mt: 2.5 }}>{action}</Box>
                    <Link
                        component={RouterLink}
                        to={demoLoginPath(demo)}
                        sx={{
                            mt: 2,
                            color: color.coral700,
                            fontSize: '0.8125rem',
                            alignSelf: 'flex-start',
                        }}
                    >
                        {demoLabel}
                    </Link>
                </Box>
                <Box
                    sx={{
                        position: 'relative',
                        height: { xs: 260, sm: 'auto' },
                        minHeight: { sm: 300 },
                        overflow: 'hidden',
                        backgroundImage: coralWash('50% 80%'),
                        bgcolor: color.coral50,
                        borderTop: { xs: `1px solid ${color.coral100}`, sm: 0 },
                        borderLeft: { xs: 0, sm: `1px solid ${color.coral100}` },
                        borderRadius: {
                            xs: `0 0 ${radius.md}px ${radius.md}px`,
                            sm: `0 0 ${radius.md}px 0`,
                        },
                    }}
                >
                    <PhoneImage
                        screen={screen}
                        sx={{
                            position: 'absolute',
                            top: 24,
                            left: '50%',
                            width: 170,
                            transform: 'translateX(-50%)',
                        }}
                    />
                </Box>
            </Box>
        </Panel>
    );
}

export default function Audiences() {
    return (
        <Section id="providers" aria-labelledby="audience-title" bg={color.canvas}>
            <SectionHead
                id="audience-title"
                title="Made for both sides of the shift"
                description="HelpHive keeps requests, people, status, payments, and support connected."
            />
            <Box
                sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))' },
                    gap: 2.5,
                }}
            >
                <AudiencePanel
                    title="For operations teams"
                    text="Fill short-notice hospitality shifts with a focused marketplace built around real job categories. Clear booking statuses and structured records make it easier to resolve issues quickly."
                    action={
                        <Button component={RouterLink} to="/signup" variant="contained">
                            Book a service
                        </Button>
                    }
                    demo="user"
                    demoLabel="Try the demo customer"
                    screen="booking-details"
                />
                <AudiencePanel
                    title="For providers"
                    text="Keep upcoming work, completed jobs, and earnings in one place without chasing message threads."
                    action={
                        <Button component={RouterLink} to="/provider-signup" variant="outlined">
                            Become a provider
                        </Button>
                    }
                    demo="provider"
                    demoLabel="Try the demo provider"
                    screen="provider-home"
                />
            </Box>
        </Section>
    );
}
