import { Box, Typography } from '@mui/material';
import {
    ChatBubbleOutline,
    ForumOutlined,
    PhoneOutlined,
    PhotoOutlined,
} from '@mui/icons-material';
import type { ReactNode } from 'react';
import { color, radius } from '@/theme/tokens';
import { HoneycombBackdrop } from './Backdrops';
import { revealChild } from './motion';
import PhoneImage from './PhoneImage';
import { Section, SectionHead } from './Section';

interface Note {
    icon: ReactNode;
    title: string;
    text: string;
}

const LEFT: Note[] = [
    {
        icon: <ChatBubbleOutline />,
        title: 'Chat from the booking',
        text: 'Open a booking and tap Chat to message the person on the other side of it.',
    },
    {
        icon: <ForumOutlined />,
        title: 'Every conversation in one tab',
        text: 'Customers and providers both have a Chat tab in the mobile app.',
    },
];

const RIGHT: Note[] = [
    {
        icon: <PhoneOutlined />,
        title: 'Call when it is quicker',
        text: 'The booking shows a Call button when a phone number is on the profile.',
    },
    {
        icon: <PhotoOutlined />,
        title: 'Send photos',
        text: 'Share photos in the conversation, right next to the messages.',
    },
];

function Notes({ notes, start, align }: { notes: Note[]; start: number; align: 'left' | 'right' }) {
    return (
        <Box
            component="ul"
            sx={{
                listStyle: 'none',
                p: 0,
                m: 0,
                display: 'grid',
                gap: { xs: 3, md: 6 },
                textAlign: { xs: 'left', md: align },
            }}
        >
            {notes.map((note, index) => (
                <Box
                    component="li"
                    key={note.title}
                    {...revealChild(start + index)}
                    sx={{
                        display: 'flex',
                        flexDirection: { xs: 'row', md: 'column' },
                        alignItems: {
                            xs: 'flex-start',
                            md: align === 'right' ? 'flex-end' : 'flex-start',
                        },
                        gap: { xs: 2, md: 1.5 },
                    }}
                >
                    <Box
                        aria-hidden="true"
                        sx={{
                            flex: 'none',
                            width: 40,
                            height: 40,
                            display: 'grid',
                            placeItems: 'center',
                            borderRadius: `${radius.sm}px`,
                            bgcolor: color.coral50,
                            color: color.coral700,
                            '& svg': { fontSize: 22 },
                        }}
                    >
                        {note.icon}
                    </Box>
                    <Box>
                        <Typography variant="h6" component="h3">
                            {note.title}
                        </Typography>
                        <Typography
                            color="text.secondary"
                            sx={{
                                mt: 0.5,
                                maxWidth: '30ch',
                                ml: { md: align === 'right' ? 'auto' : 0 },
                            }}
                        >
                            {note.text}
                        </Typography>
                    </Box>
                </Box>
            ))}
        </Box>
    );
}

/** Staying in touch: the chat phone in the middle, with what you can do around it. */
export default function StayInTouch() {
    return (
        <Section
            id="chat"
            aria-labelledby="chat-title"
            bordered={false}
            decoration={<HoneycombBackdrop focus="50% 70%" wash={false} />}
        >
            <SectionHead
                id="chat-title"
                align="center"
                title="Stay in touch while the job is on"
                description="Customers and providers talk in the HelpHive mobile app, so changes on the day do not get lost in texts."
            />
            <Box
                data-reveal=""
                sx={{
                    display: 'grid',
                    gridTemplateColumns: {
                        xs: '1fr',
                        md: 'minmax(0, 1fr) auto minmax(0, 1fr)',
                    },
                    alignItems: 'center',
                    columnGap: 8,
                    rowGap: 5,
                }}
            >
                <Box sx={{ order: { xs: 2, md: 1 } }}>
                    <Notes notes={LEFT} start={1} align="right" />
                </Box>
                <Box sx={{ order: { xs: 1, md: 2 }, display: 'grid', placeItems: 'center' }}>
                    <PhoneImage screen="chat" sx={{ width: { xs: 220, sm: 240, md: 240 } }} />
                </Box>
                <Box sx={{ order: 3 }}>
                    <Notes notes={RIGHT} start={3} align="left" />
                </Box>
            </Box>
        </Section>
    );
}
