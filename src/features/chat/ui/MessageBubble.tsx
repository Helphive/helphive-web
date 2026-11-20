import { useState } from 'react';
import dayjs from 'dayjs';
import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    IconButton,
    LinearProgress,
    Menu,
    MenuItem,
    ListItemIcon,
    Typography,
    useMediaQuery,
    useTheme,
} from '@mui/material';
import { color, font, hairline, inDark, radius } from '@/theme/tokens';
import {
    CheckMarkIcon,
    CloseIcon,
    DocumentIcon,
    DownloadIcon,
    ErrorIcon,
    ExternalLinkIcon,
    MarkAllReadIcon,
    MoreIcon,
    ReportIcon,
    RetryIcon,
    TimeIcon,
    DeleteIcon,
} from '@/components/ui/icons';
import { srText } from './chatModel';
import type { ChatMessage } from '../runtime/chatRuntime';
import { formatBytes, isRenderableImage } from '../runtime/safety';

function Ticks({ m }: { m: ChatMessage }) {
    const sx = { fontSize: 14 };
    if (m.state === 'sending') return <TimeIcon weight="bold" sx={sx} titleAccess="Sending" />;
    if (m.state === 'failed') return null;
    if (m.readAt)
        return (
            <MarkAllReadIcon
                weight="bold"
                sx={{ ...sx, color: color.blue200, ...inDark({ color: color.blue700 }) }}
                titleAccess="Read"
            />
        );
    if (m.deliveredAt) return <MarkAllReadIcon weight="bold" sx={sx} titleAccess="Delivered" />;
    return <CheckMarkIcon weight="bold" sx={sx} titleAccess="Sent" />;
}

export function ImageViewer({
    image,
    onClose,
}: {
    image: { url: string; name: string } | null;
    onClose: () => void;
}) {
    const theme = useTheme();
    const phone = useMediaQuery(theme.breakpoints.down('sm'));
    return (
        <Dialog
            open={!!image}
            onClose={onClose}
            fullScreen={phone}
            maxWidth="lg"
            aria-label={image?.name ?? 'Photo'}
        >
            {image && (
                <>
                    <DialogContent
                        sx={{
                            p: 0,
                            display: 'grid',
                            placeItems: 'center',
                            bgcolor: color.inkFill,
                            // A photo sits on the deepest layer on dark, not on a light slab.
                            ...inDark({ bgcolor: color.canvas }),
                            minHeight: 240,
                        }}
                    >
                        <Box
                            component="img"
                            src={image.url}
                            alt={image.name}
                            referrerPolicy="no-referrer"
                            sx={{
                                maxWidth: '100%',
                                maxHeight: phone ? 'calc(100dvh - 72px)' : '80vh',
                                display: 'block',
                            }}
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button
                            component="a"
                            href={image.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            startIcon={<ExternalLinkIcon />}
                        >
                            Open original
                        </Button>
                        <Button
                            variant="contained"
                            color="secondary"
                            onClick={onClose}
                            startIcon={<CloseIcon />}
                            autoFocus
                        >
                            Close
                        </Button>
                    </DialogActions>
                </>
            )}
        </Dialog>
    );
}

function Attachment({
    m,
    onOpenImage,
}: {
    m: ChatMessage;
    onOpenImage: (img: { url: string; name: string }) => void;
}) {
    const att = m.attachment;
    if (!att) return null;
    const src = att.localUrl ?? att.url;
    if (m.kind === 'image' && src && isRenderableImage(att.mimeType)) {
        return (
            <Box
                component="button"
                type="button"
                onClick={() => att.url && onOpenImage({ url: att.url, name: att.name })}
                disabled={!att.url}
                aria-label={`Open photo ${att.name}`}
                sx={{
                    display: 'block',
                    p: 0,
                    border: 0,
                    bgcolor: 'transparent',
                    cursor: att.url ? 'zoom-in' : 'default',
                    borderRadius: `${radius.sm}px`,
                    overflow: 'hidden',
                }}
            >
                <Box
                    component="img"
                    src={src}
                    alt=""
                    loading="lazy"
                    referrerPolicy="no-referrer"
                    sx={{
                        display: 'block',
                        width: '100%',
                        maxWidth: 260,
                        maxHeight: 260,
                        objectFit: 'cover',
                    }}
                />
            </Box>
        );
    }
    const linkable = !!att.url && m.state === 'sent';
    return (
        <Box
            component={linkable ? 'a' : 'div'}
            {...(linkable
                ? {
                      href: att.url,
                      target: '_blank',
                      rel: 'noopener noreferrer',
                      download: att.name,
                  }
                : {})}
            sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.25,
                p: 1.25,
                borderRadius: `${radius.sm}px`,
                border: hairline,
                bgcolor: color.surface,
                color: color.ink900,
                textDecoration: 'none',
                minWidth: 0,
                '&:hover': linkable ? { borderColor: color.ink300 } : undefined,
            }}
        >
            <DocumentIcon sx={{ color: color.ink600 }} />
            <Box sx={{ minWidth: 0, flex: 1 }}>
                <Typography variant="body2" noWrap sx={{ fontWeight: 600 }}>
                    {att.name}
                </Typography>
                <Typography variant="caption" component="p">
                    {[att.mimeType === 'application/pdf' ? 'PDF' : 'Photo', formatBytes(att.size)]
                        .filter(Boolean)
                        .join(', ')}
                    {!att.url && m.state === 'sent' && ', not available'}
                </Typography>
            </Box>
            {linkable && <DownloadIcon sx={{ color: color.ink600 }} />}
        </Box>
    );
}

export default function MessageBubble({
    m,
    onOpenImage,
    onRetry,
    onDiscard,
    onReport,
}: {
    m: ChatMessage;
    onOpenImage: (img: { url: string; name: string }) => void;
    onRetry: (m: ChatMessage) => void;
    onDiscard: (m: ChatMessage) => void;
    onReport?: (m: ChatMessage) => void;
}) {
    const [menu, setMenu] = useState<HTMLElement | null>(null);
    const canReport = !m.mine && m.kind !== 'deleted' && !!m.id && !!onReport;
    const time = dayjs(m.sentAt).format('HH:mm');
    return (
        <Box
            component="li"
            onContextMenu={
                canReport
                    ? (e) => {
                          e.preventDefault();
                          setMenu(e.currentTarget as HTMLElement);
                      }
                    : undefined
            }
            sx={{
                display: 'flex',
                justifyContent: m.mine ? 'flex-end' : 'flex-start',
                alignItems: 'center',
                gap: 0.5,
                '&:hover .msg-more, &:focus-within .msg-more': { opacity: 1 },
            }}
        >
            <Box
                sx={{
                    maxWidth: { xs: '84%', sm: '72%' },
                    minWidth: 0,
                    display: 'grid',
                    justifyItems: m.mine ? 'end' : 'start',
                    gap: 0.5,
                }}
            >
                <Box
                    sx={{
                        px: 1.5,
                        py: 1,
                        borderRadius: `${radius.md}px`,
                        [m.mine ? 'borderBottomRightRadius' : 'borderBottomLeftRadius']:
                            `${radius.sm / 2}px`,
                        bgcolor: m.mine ? color.inkFill : color.surface,
                        color: m.mine ? color.onInk : color.ink900,
                        // Own messages on dark: a quiet lifted tone, not a column of near-white slabs.
                        ...(m.mine && inDark({ bgcolor: color.ink200, color: color.ink900 })),
                        border: m.mine ? 'none' : hairline,
                        opacity: m.state === 'sending' ? 0.75 : 1,
                        display: 'grid',
                        gap: 0.75,
                        minWidth: 0,
                    }}
                >
                    <Box component="span" sx={srText}>
                        {m.mine ? 'You' : 'They'} said at {time}:
                    </Box>
                    {m.kind === 'deleted' ? (
                        <Typography variant="body2" sx={{ fontStyle: 'italic', opacity: 0.8 }}>
                            Message deleted
                        </Typography>
                    ) : (
                        <>
                            <Attachment m={m} onOpenImage={onOpenImage} />
                            {m.state === 'sending' && m.attachment && (
                                <LinearProgress
                                    aria-label="Uploading"
                                    sx={{ borderRadius: 1 }}
                                    color="inherit"
                                />
                            )}
                            {m.text && (
                                // Plain text only: React escapes it; no HTML, no markdown.
                                <Typography
                                    variant="body2"
                                    sx={{
                                        whiteSpace: 'pre-wrap',
                                        overflowWrap: 'anywhere',
                                        fontSize: font.size.md,
                                        lineHeight: 1.5,
                                    }}
                                >
                                    {m.text}
                                </Typography>
                            )}
                        </>
                    )}
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'flex-end',
                            gap: 0.5,
                            fontSize: font.size.xs,
                            fontWeight: 600,
                            color: m.mine ? color.ink300 : color.ink500,
                            ...(m.mine && inDark({ color: color.ink600 })),
                            mt: -0.25,
                        }}
                    >
                        <span aria-hidden>{time}</span>
                        {m.mine && <Ticks m={m} />}
                    </Box>
                </Box>
                {m.state === 'failed' && (
                    <Box
                        role="alert"
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            flexWrap: 'wrap',
                            justifyContent: 'flex-end',
                            gap: 0.5,
                            color: color.red700,
                            fontSize: font.size.sm,
                            fontWeight: 600,
                        }}
                    >
                        <ErrorIcon weight="bold" sx={{ fontSize: 16 }} />
                        <span>{m.error || 'Not sent.'}</span>
                        <Button size="small" startIcon={<RetryIcon />} onClick={() => onRetry(m)}>
                            Retry
                        </Button>
                        <Button
                            size="small"
                            color="inherit"
                            startIcon={<DeleteIcon />}
                            onClick={() => onDiscard(m)}
                        >
                            Remove
                        </Button>
                    </Box>
                )}
            </Box>
            {canReport && (
                <>
                    <IconButton
                        className="msg-more"
                        size="small"
                        aria-label={`Message options, sent at ${time}`}
                        aria-haspopup="menu"
                        onClick={(e) => setMenu(e.currentTarget)}
                        sx={{ opacity: 0, color: color.ink500 }}
                    >
                        <MoreIcon size={18} />
                    </IconButton>
                    <Menu anchorEl={menu} open={!!menu} onClose={() => setMenu(null)}>
                        <MenuItem
                            onClick={() => {
                                setMenu(null);
                                onReport?.(m);
                            }}
                        >
                            <ListItemIcon>
                                <ReportIcon />
                            </ListItemIcon>
                            Report message
                        </MenuItem>
                    </Menu>
                </>
            )}
        </Box>
    );
}
