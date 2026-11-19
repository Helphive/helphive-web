import { Box, type SxProps, type Theme } from '@mui/material';
import { contactShadow, phoneLift } from './backgrounds';

export type PhoneScreen = 'book-service' | 'booking-details' | 'chat' | 'provider-home';

const SCREENS: Record<PhoneScreen, { src: string; alt: string }> = {
    'book-service': {
        src: '/images/app/phone-book-service.webp',
        alt: 'HelpHive app, Book Service screen: choose services, set quantities and see the price before booking.',
    },
    'booking-details': {
        src: '/images/app/phone-booking-details.webp',
        alt: 'HelpHive app, Reservation Status screen: the assigned provider, booking status and payment details.',
    },
    chat: {
        src: '/images/app/phone-chat.webp',
        alt: 'HelpHive app chat screen: a conversation with a provider.',
    },
    'provider-home': {
        src: '/images/app/phone-provider-home.webp',
        alt: 'HelpHive provider app home screen: a map of nearby work, an availability switch and the services offered.',
    },
};

/**
 * Real app screen, already inside an iPhone frame (608 x 1249, transparent), shown whole,
 * with a soft lift shadow and a contact shadow on the ground beneath it.
 * Size it with `sx.width`; the height follows the image ratio.
 */
export default function PhoneImage({
    screen,
    eager = false,
    decorative = false,
    sx,
}: {
    screen: PhoneScreen;
    eager?: boolean;
    /** Hide from assistive tech when a neighbouring phone already describes the same idea. */
    decorative?: boolean;
    sx?: SxProps<Theme>;
}) {
    const { src, alt } = SCREENS[screen];
    return (
        <Box
            sx={[
                {
                    position: 'relative',
                    flex: 'none',
                    '&::after': {
                        content: '""',
                        position: 'absolute',
                        left: '8%',
                        right: '8%',
                        bottom: '-3.5%',
                        height: '7%',
                        backgroundImage: contactShadow,
                        zIndex: 0,
                        pointerEvents: 'none',
                    },
                },
                ...(Array.isArray(sx) ? sx : [sx]),
            ]}
        >
            <Box
                component="img"
                src={src}
                alt={decorative ? '' : alt}
                width={608}
                height={1249}
                loading={eager ? 'eager' : 'lazy'}
                decoding="async"
                sx={{
                    position: 'relative',
                    zIndex: 1,
                    display: 'block',
                    width: '100%',
                    height: 'auto',
                    // Reserve the space before a lazy image loads, so nothing shifts while scrolling.
                    aspectRatio: '608 / 1249',
                    filter: phoneLift,
                }}
            />
        </Box>
    );
}
