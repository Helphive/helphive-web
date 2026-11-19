import { Link as RouterLink } from 'react-router-dom';
import { Box, Button, Link, Typography } from '@mui/material';
import { color, font } from '@/theme/tokens';
import { HoneycombBackdrop } from './Backdrops';
import { IOS_UNAVAILABLE_MESSAGE } from './constants';
import { revealChild } from './motion';
import PhoneImage from './PhoneImage';
import { Section } from './Section';
import { AndroidIcon, AppleIcon } from '@/components/ui/icons';

/** Three whole phones, fanned: chat in front, booking and provider screens tucked behind. */
function PhoneFan() {
    const side = { xs: 118, sm: 170, lg: 186 };
    const overlap = { xs: '-24px', sm: '-36px', lg: '-40px' };
    return (
        <Box
            data-reveal=""
            sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                // Room for the contact shadows under the phones.
                pb: 2,
            }}
        >
            <Box {...revealChild(1)} sx={{ mr: overlap, mt: { xs: 5, sm: 8 }, zIndex: 1 }}>
                <PhoneImage screen="book-service" sx={{ width: side }} />
            </Box>
            <Box {...revealChild(0)} sx={{ zIndex: 2 }}>
                <PhoneImage
                    screen="chat"
                    decorative
                    sx={{ width: { xs: 146, sm: 210, lg: 228 } }}
                />
            </Box>
            <Box {...revealChild(2)} sx={{ ml: overlap, mt: { xs: 5, sm: 8 }, zIndex: 1 }}>
                <PhoneImage screen="provider-home" decorative sx={{ width: side }} />
            </Box>
        </Box>
    );
}

export default function AppDownload({
    onAndroid,
    onIos,
}: {
    onAndroid: () => void;
    onIos: () => void;
}) {
    return (
        <Section
            id="get-the-app"
            tone="coral"
            aria-labelledby="app-title"
            decoration={<HoneycombBackdrop focus="78% 55%" stroke={color.coral100} wash={false} />}
            sx={{ py: { xs: 7, md: 10 } }}
        >
            <Box
                sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 1fr) 560px' },
                    gap: { xs: 6, lg: 6 },
                    alignItems: 'center',
                }}
            >
                <Box
                    data-reveal=""
                    sx={{
                        textAlign: { xs: 'center', lg: 'left' },
                        maxWidth: { xs: 620, lg: 'none' },
                        mx: { xs: 'auto', lg: 0 },
                    }}
                >
                    <Typography
                        id="app-title"
                        variant="h2"
                        sx={{
                            fontSize: font.size['4xl'],
                            letterSpacing: font.tracking.display,
                            lineHeight: 1.1,
                        }}
                    >
                        Take HelpHive with you
                    </Typography>
                    <Typography
                        sx={{
                            mt: 2,
                            maxWidth: '48ch',
                            mx: { xs: 'auto', lg: 0 },
                            color: color.ink700,
                            fontSize: { xs: font.size.lg, md: font.size.xl },
                            lineHeight: 1.55,
                        }}
                    >
                        Book, track and manage work from your phone. The Android APK comes straight
                        from the official HelpHive GitHub release.
                    </Typography>
                    <Box
                        sx={{
                            mt: 4,
                            display: 'flex',
                            flexDirection: { xs: 'column', sm: 'row' },
                            flexWrap: 'wrap',
                            justifyContent: { xs: 'center', lg: 'flex-start' },
                            gap: 1.5,
                        }}
                    >
                        <Button
                            variant="contained"
                            size="large"
                            startIcon={<AndroidIcon weight="fill" size={20} />}
                            onClick={onAndroid}
                        >
                            Download Android APK
                        </Button>
                        <Button
                            variant="outlined"
                            size="large"
                            startIcon={<AppleIcon weight="fill" size={20} />}
                            onClick={onIos}
                            sx={{ bgcolor: color.surface }}
                        >
                            Get the iOS app
                        </Button>
                    </Box>
                    <Typography variant="body2" sx={{ mt: 2, color: color.ink700 }}>
                        {IOS_UNAVAILABLE_MESSAGE}{' '}
                        <Link
                            component={RouterLink}
                            to="/login"
                            sx={{ color: color.coral700, fontWeight: 700, whiteSpace: 'nowrap' }}
                        >
                            Open the web app
                        </Link>
                    </Typography>
                </Box>
                <PhoneFan />
            </Box>
        </Section>
    );
}
