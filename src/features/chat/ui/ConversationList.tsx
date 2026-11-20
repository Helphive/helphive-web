import { Link as RouterLink } from 'react-router-dom';
import { Avatar, Badge, Box, Typography } from '@mui/material';
import type { Booking } from '@/types';
import { getInitials } from '@/utils/profileImage';
import { formatDay } from '@/utils/format';
import { color, font, hairline, hoverItem, inDark, wash } from '@/theme/tokens';
import type { Presence } from '../runtime/chatRuntime';
import { listTime, messagesPath, type Area, srText } from './chatModel';

export interface ConversationItem {
    uid: string;
    name: string;
    firstName: string;
    avatar?: string;
    lastText: string;
    lastAt?: number;
    unread: number;
    open: boolean | null; // null while the server's answer is loading
    blocked: boolean;
    bookings: Booking[];
}

export function PersonAvatar({
    name,
    src,
    presence,
    size = 40,
}: {
    name: string;
    src?: string;
    presence?: Presence;
    size?: number;
}) {
    const [first, ...rest] = name.split(' ');
    const avatar = (
        <Avatar
            src={src}
            alt=""
            sx={{ width: size, height: size }}
            imgProps={{ referrerPolicy: 'no-referrer' }}
        >
            {getInitials(first, rest.join(' '))}
        </Avatar>
    );
    if (!presence?.online) return avatar;
    return (
        <Badge
            overlap="circular"
            variant="dot"
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            sx={{
                '& .MuiBadge-badge': {
                    bgcolor: color.green500,
                    boxShadow: `0 0 0 2px ${color.surface}`,
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                },
            }}
        >
            {avatar}
        </Badge>
    );
}

export default function ConversationList({
    items,
    area,
    selected,
    presence,
    typing,
}: {
    items: ConversationItem[];
    area: Area;
    selected?: string;
    presence: Record<string, Presence>;
    typing: Record<string, boolean>;
}) {
    return (
        <Box component="ul" aria-label="Conversations" sx={{ listStyle: 'none', m: 0, p: 0 }}>
            {items.map((item) => {
                const active = item.uid === selected;
                const booking = item.bookings[0];
                const more = item.bookings.length - 1;
                return (
                    <Box component="li" key={item.uid} sx={{ borderBottom: hairline }}>
                        <Box
                            component={RouterLink}
                            to={messagesPath(area, item.uid)}
                            aria-current={active ? 'page' : undefined}
                            sx={{
                                display: 'grid',
                                gridTemplateColumns: '40px minmax(0, 1fr) auto',
                                columnGap: 1.5,
                                alignItems: 'start',
                                px: 2,
                                py: 1.5,
                                textDecoration: 'none',
                                color: 'inherit',
                                position: 'relative',
                                bgcolor: active ? color.canvas : 'transparent',
                                ...inDark({
                                    bgcolor: active ? wash(color.ink900, 0.06) : 'transparent',
                                }),
                                '&::before': active
                                    ? {
                                          content: '""',
                                          position: 'absolute',
                                          left: 0,
                                          top: 0,
                                          bottom: 0,
                                          width: 3,
                                          bgcolor: color.ink900,
                                      }
                                    : undefined,
                                '&:hover': hoverItem,
                                '&:focus-visible': { outlineOffset: -2 },
                            }}
                        >
                            <PersonAvatar
                                name={item.name}
                                src={item.avatar}
                                presence={presence[item.uid]}
                            />
                            <Box sx={{ minWidth: 0 }}>
                                <Typography
                                    variant="subtitle2"
                                    noWrap
                                    sx={{ fontWeight: item.unread ? 800 : 700 }}
                                >
                                    {item.name}
                                </Typography>
                                <Typography
                                    variant="body2"
                                    noWrap
                                    sx={{
                                        color: item.unread ? color.ink900 : color.ink600,
                                        fontWeight: item.unread ? 600 : 400,
                                    }}
                                >
                                    {typing[item.uid]
                                        ? 'Typing…'
                                        : item.lastText || (item.open ? 'No messages yet' : '')}
                                </Typography>
                                {booking && (
                                    <Typography
                                        variant="caption"
                                        component="p"
                                        noWrap
                                        sx={{ mt: 0.25 }}
                                    >
                                        {booking.service?.name}, {formatDay(booking.startDate)}
                                        {more > 0 && ` and ${more} more`}
                                        {item.open === false && ' (closed)'}
                                        {item.blocked && ' (blocked)'}
                                    </Typography>
                                )}
                            </Box>
                            <Box sx={{ display: 'grid', justifyItems: 'end', gap: 0.75 }}>
                                <Box
                                    component="span"
                                    sx={{
                                        fontSize: font.size.xs,
                                        fontWeight: 600,
                                        color: item.unread ? color.coral600 : color.ink500,
                                        whiteSpace: 'nowrap',
                                    }}
                                >
                                    {listTime(item.lastAt)}
                                </Box>
                                {item.unread > 0 && (
                                    <Box
                                        component="span"
                                        sx={{
                                            minWidth: 20,
                                            height: 20,
                                            px: '6px',
                                            borderRadius: 999,
                                            bgcolor: color.brandFill,
                                            color: color.onBrand,
                                            fontSize: 11,
                                            fontWeight: 700,
                                            display: 'grid',
                                            placeItems: 'center',
                                        }}
                                    >
                                        {item.unread > 99 ? '99+' : item.unread}
                                        <Box component="span" sx={srText}>
                                            {' '}
                                            unread
                                        </Box>
                                    </Box>
                                )}
                            </Box>
                        </Box>
                    </Box>
                );
            })}
        </Box>
    );
}
