import { useEffect, useRef, useState, type ChangeEvent, type KeyboardEvent } from 'react';
import { Alert, Box, IconButton, InputBase, Tooltip, Typography } from '@mui/material';
import { color, font, hairline, hairlineStrong, radius } from '@/theme/tokens';
import { AttachIcon, CloseIcon, DocumentIcon, SendIcon } from '@/components/ui/icons';
import { draftKey } from '../chatBridge';
import { chatRuntime } from '../runtime/chatRuntime';
import {
    ACCEPT,
    checkFile,
    formatBytes,
    isRenderableImage,
    fileType,
    safeName,
} from '../runtime/safety';

const TYPING_IDLE_MS = 3000;
const MAX_TEXT = 4000;

const readDraft = (key: string) => {
    try {
        return sessionStorage.getItem(key) ?? '';
    } catch {
        return '';
    }
};
const writeDraft = (key: string, text: string) => {
    try {
        if (text) sessionStorage.setItem(key, text);
        else sessionStorage.removeItem(key);
    } catch {
        // Storage blocked: the draft lives as long as the page.
    }
};

export interface Pending {
    file: File;
    kind: 'image' | 'file';
    previewUrl?: string;
}

export default function Composer({
    me,
    uid,
    firstName,
    onSend,
}: {
    me: string;
    uid: string;
    firstName: string;
    onSend: (text: string, pending: Pending | null) => void;
}) {
    const key = draftKey(me, uid);
    const [text, setText] = useState(() => readDraft(key));
    const [pending, setPending] = useState<Pending | null>(null);
    const [fileError, setFileError] = useState('');
    const inputRef = useRef<HTMLTextAreaElement>(null);
    const fileRef = useRef<HTMLInputElement>(null);
    const typing = useRef<{ on: boolean; timer?: ReturnType<typeof setTimeout> }>({ on: false });

    // Switching conversations keeps each one's own draft.
    useEffect(() => {
        setText(readDraft(key));
        setPending(null);
        setFileError('');
    }, [key]);

    useEffect(
        () => () => {
            clearTimeout(typing.current.timer);
            if (typing.current.on) chatRuntime.endTyping(uid);
            typing.current.on = false;
        },
        [uid]
    );

    useEffect(
        () => () => {
            if (pending?.previewUrl) URL.revokeObjectURL(pending.previewUrl);
        },
        [pending]
    );

    const signalTyping = () => {
        const t = typing.current;
        if (!t.on) {
            t.on = true;
            chatRuntime.startTyping(uid);
        }
        clearTimeout(t.timer);
        t.timer = setTimeout(() => {
            t.on = false;
            chatRuntime.endTyping(uid);
        }, TYPING_IDLE_MS);
    };

    const change = (value: string) => {
        const next = value.slice(0, MAX_TEXT);
        setText(next);
        writeDraft(key, next);
        if (next.trim()) signalTyping();
    };

    const pick = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        e.target.value = '';
        if (!file) return;
        const check = checkFile(file);
        if (!check.ok) {
            setFileError(check.error);
            return;
        }
        setFileError('');
        setPending({
            file,
            kind: check.kind,
            previewUrl: isRenderableImage(fileType(file)) ? URL.createObjectURL(file) : undefined,
        });
        inputRef.current?.focus();
    };

    const send = () => {
        const body = text.trim();
        if (!body && !pending) return;
        onSend(body, pending);
        setText('');
        writeDraft(key, '');
        setPending(null);
        clearTimeout(typing.current.timer);
        if (typing.current.on) chatRuntime.endTyping(uid);
        typing.current.on = false;
        inputRef.current?.focus();
    };

    const keyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
            e.preventDefault();
            send();
        }
    };

    const canSend = !!text.trim() || !!pending;
    return (
        <Box sx={{ borderTop: hairline, bgcolor: color.surface, px: { xs: 1, sm: 1.5 }, py: 1 }}>
            {fileError && (
                <Alert severity="error" onClose={() => setFileError('')} sx={{ mb: 1 }}>
                    {fileError}
                </Alert>
            )}
            {pending && (
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1.25,
                        mb: 1,
                        p: 1,
                        border: hairline,
                        borderRadius: `${radius.sm}px`,
                        bgcolor: color.subtle,
                    }}
                >
                    {pending.previewUrl ? (
                        <Box
                            component="img"
                            src={pending.previewUrl}
                            alt=""
                            sx={{
                                width: 44,
                                height: 44,
                                objectFit: 'cover',
                                borderRadius: `${radius.sm}px`,
                            }}
                        />
                    ) : (
                        <DocumentIcon sx={{ fontSize: 28, color: color.ink600 }} />
                    )}
                    <Box sx={{ minWidth: 0, flex: 1 }}>
                        <Typography variant="body2" noWrap sx={{ fontWeight: 600 }}>
                            {safeName(pending.file.name)}
                        </Typography>
                        <Typography variant="caption" component="p">
                            {formatBytes(pending.file.size)}. Add a message or send it as it is.
                        </Typography>
                    </Box>
                    <IconButton
                        size="small"
                        aria-label="Remove attachment"
                        onClick={() => setPending(null)}
                    >
                        <CloseIcon size={18} />
                    </IconButton>
                </Box>
            )}
            <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 0.5 }}>
                <input
                    ref={fileRef}
                    type="file"
                    accept={ACCEPT}
                    hidden
                    onChange={pick}
                    tabIndex={-1}
                />
                <Tooltip title="Attach a photo or PDF (up to 10 MB)">
                    <IconButton
                        aria-label="Attach a photo or PDF"
                        onClick={() => fileRef.current?.click()}
                    >
                        <AttachIcon />
                    </IconButton>
                </Tooltip>
                <InputBase
                    inputRef={inputRef}
                    multiline
                    maxRows={6}
                    value={text}
                    onChange={(e) => change(e.target.value)}
                    onKeyDown={keyDown}
                    placeholder={`Message ${firstName}`}
                    inputProps={{ 'aria-label': `Message ${firstName}`, maxLength: MAX_TEXT }}
                    sx={{
                        flex: 1,
                        minWidth: 0,
                        px: 1.5,
                        py: 1,
                        border: hairlineStrong,
                        borderRadius: `${radius.md}px`,
                        fontSize: font.size.md,
                        lineHeight: 1.5,
                        '&.Mui-focused': { borderColor: color.ink900 },
                    }}
                />
                <Tooltip title="Send (Enter). New line: Shift+Enter">
                    <span>
                        <IconButton
                            aria-label="Send message"
                            onClick={send}
                            disabled={!canSend}
                            sx={{
                                bgcolor: canSend ? color.coral600 : 'transparent',
                                color: canSend ? color.surface : color.ink300,
                                '&:hover': { bgcolor: canSend ? color.coral700 : 'transparent' },
                                '&.Mui-disabled': { color: color.ink300 },
                            }}
                        >
                            <SendIcon />
                        </IconButton>
                    </span>
                </Tooltip>
            </Box>
        </Box>
    );
}
