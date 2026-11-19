import { Box, type SxProps, type Theme } from '@mui/material';

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

/** Real app screen, already inside an iPhone frame (608 x 1249, transparent). */
export default function PhoneImage({
    screen,
    eager = false,
    sx,
}: {
    screen: PhoneScreen;
    eager?: boolean;
    sx?: SxProps<Theme>;
}) {
    const { src, alt } = SCREENS[screen];
    return (
        <Box
            component="img"
            src={src}
            alt={alt}
            width={608}
            height={1249}
            loading={eager ? 'eager' : 'lazy'}
            decoding="async"
            sx={[
                { display: 'block', width: '100%', height: 'auto', flex: 'none' },
                ...(Array.isArray(sx) ? sx : [sx]),
            ]}
        />
    );
}
