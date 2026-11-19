import { Link as RouterLink } from 'react-router-dom';
import { Box, Button, Typography } from '@mui/material';
import { Apple, Download } from '@mui/icons-material';
import { color, font, radius } from '@/theme/tokens';
import { HoneycombBackdrop } from './Backdrops';
import { IOS_UNAVAILABLE_MESSAGE } from './constants';
import PhoneImage from './PhoneImage';
import { Section } from './Section';

export default function AppDownload({
    onAndroid,
    onIos,
}: {
    onAndroid: () => void;
    onIos: () => void;
}) {
    return (
        <Section id="get-the-app" aria-labelledby="app-title" sx={{ py: { xs: 4, md: 6 } }}>
            <Box
                sx={{
                    position: 'relative',
                    overflow: 'hidden',
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 1fr) 460px' },
                    bgcolor: color.coral50,
                    border: `1px solid ${color.coral100}`,
                    borderRadius: `${radius.md}px`,
                }}
            >
                <HoneycombBackdrop focus="85% 60%" stroke={color.coral100} />
                <Box sx={{ position: 'relative', p: { xs: 2.5, md: 4 }, alignSelf: 'center' }}>
                    <Typography
                        id="app-title"
                        variant="h3"
                        component="h2"
                        sx={{ fontSize: { xs: font.size['2xl'], sm: font.size['3xl'] } }}
                    >
                        Take HelpHive with you.
                    </Typography>
                    <Typography sx={{ mt: 1, maxWidth: '54ch', color: color.ink700 }}>
                        The Android APK is available directly from the official HelpHive GitHub
                        release. Install it on your device to book, track, and manage work on the
                        go.
                    </Typography>
                    <Box
                        sx={{
                            mt: 2.5,
                            display: 'flex',
                            flexDirection: { xs: 'column', sm: 'row' },
                            flexWrap: 'wrap',
                            gap: 1.5,
                        }}
                    >
                        <Button variant="contained" startIcon={<Download />} onClick={onAndroid}>
                            Download Android APK
                        </Button>
                        <Button
                            variant="outlined"
                            startIcon={<Apple />}
                            onClick={onIos}
                            sx={{ bgcolor: color.surface }}
                        >
                            Get the iOS app
                        </Button>
                        <Button
                            component={RouterLink}
                            to="/login"
                            variant="outlined"
                            sx={{ bgcolor: color.surface }}
                        >
                            Open web app
                        </Button>
                    </Box>
                    <Typography variant="body2" sx={{ mt: 1.5, color: color.ink600 }}>
                        {IOS_UNAVAILABLE_MESSAGE}
                    </Typography>
                </Box>
                <Box
                    sx={{
                        position: 'relative',
                        height: { xs: 250, md: 340 },
                        overflow: 'hidden',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'flex-start',
                        gap: { xs: 1, md: 1.5 },
                        pt: { xs: 0, md: 4 },
                        px: 2,
                    }}
                >
                    <PhoneImage
                        screen="book-service"
                        sx={{ width: { xs: 100, md: 140 }, mt: { xs: 4, md: 5 } }}
                    />
                    <PhoneImage screen="chat" sx={{ width: { xs: 118, md: 168 } }} />
                    <PhoneImage
                        screen="provider-home"
                        sx={{ width: { xs: 100, md: 140 }, mt: { xs: 4, md: 5 } }}
                    />
                </Box>
            </Box>
        </Section>
    );
}
