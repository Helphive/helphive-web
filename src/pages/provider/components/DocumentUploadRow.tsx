import { useEffect, useMemo, useRef, type ReactNode } from 'react';
import { Avatar, Box, Button, Stack } from '@mui/material';
import { color, font, radius } from '@/theme/tokens';
import { SuccessIcon } from '@/components/ui/icons';

interface DocumentUploadRowProps {
    id: string;
    title: string;
    /** What this document is and why it is needed. */
    description: string;
    /** Value for the file input's accept attribute. */
    accept: string;
    /** Plain-words list of accepted formats ("PDF, DOC or DOCX"). */
    formats: string;
    icon: ReactNode;
    file: File | null;
    /** Shows a thumbnail of the chosen image instead of the icon. */
    previewImage?: boolean;
    error?: string;
    onChange: (file: File | null) => void;
    /** Called with a message when the chosen file is not one of the accepted types. */
    onInvalid: (message: string) => void;
}

function isAccepted(file: File, accept: string) {
    const name = file.name.toLowerCase();
    return accept.split(',').some((rule) => {
        const r = rule.trim().toLowerCase();
        if (r.endsWith('/*')) return file.type.startsWith(r.slice(0, -1));
        if (r.startsWith('.')) return name.endsWith(r);
        return file.type === r;
    });
}

function formatSize(bytes: number) {
    if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/** One required document: what it is, accepted formats, the chosen file and replace/remove. */
export default function DocumentUploadRow({
    id,
    title,
    description,
    accept,
    formats,
    icon,
    file,
    previewImage,
    error,
    onChange,
    onInvalid,
}: DocumentUploadRowProps) {
    const inputRef = useRef<HTMLInputElement>(null);
    const previewUrl = useMemo(
        () => (previewImage && file ? URL.createObjectURL(file) : null),
        [previewImage, file]
    );
    useEffect(
        () => () => {
            if (previewUrl) URL.revokeObjectURL(previewUrl);
        },
        [previewUrl]
    );

    const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        const chosen = e.target.files?.[0] ?? null;
        e.target.value = ''; // lets the same file be chosen again after removing it
        if (!chosen) return;
        if (!isAccepted(chosen, accept)) {
            onInvalid(`${title} must be ${formats}.`);
            return;
        }
        onChange(chosen);
    };

    const describedBy = error ? `${id}-error` : `${id}-hint`;

    return (
        <Box
            sx={{
                display: 'grid',
                gridTemplateColumns: { xs: 'auto minmax(0, 1fr)', sm: 'auto minmax(0, 1fr) auto' },
                columnGap: 2,
                rowGap: 1.5,
                alignItems: 'center',
                p: 2,
                border: '1px solid',
                borderColor: error ? color.red500 : color.lineStrong,
                borderRadius: `${radius.sm}px`,
                bgcolor: color.surface,
            }}
        >
            {previewUrl ? (
                <Avatar src={previewUrl} alt={`${title} preview`} sx={{ width: 48, height: 48 }} />
            ) : (
                <Box
                    aria-hidden="true"
                    sx={{
                        width: 48,
                        height: 48,
                        borderRadius: `${radius.sm}px`,
                        display: 'grid',
                        placeItems: 'center',
                        bgcolor: file ? color.green50 : color.canvas,
                        color: file ? color.green700 : color.ink500,
                        '& svg': { fontSize: 24 },
                    }}
                >
                    {file ? <SuccessIcon weight="fill" /> : icon}
                </Box>
            )}

            <Box sx={{ minWidth: 0 }}>
                <Box sx={{ fontWeight: 700, fontSize: font.size.md }}>
                    {title}{' '}
                    <Box component="span" aria-hidden="true" sx={{ color: color.red700 }}>
                        *
                    </Box>
                </Box>
                <Box id={`${id}-hint`} sx={{ fontSize: font.size.sm, color: color.ink600 }}>
                    {description} {formats}.
                </Box>
                {file && (
                    <Box
                        sx={{
                            mt: 0.5,
                            fontSize: font.size.sm,
                            fontWeight: 600,
                            color: color.green700,
                            overflowWrap: 'anywhere',
                        }}
                    >
                        {file.name} ({formatSize(file.size)})
                    </Box>
                )}
                {error && (
                    <Box
                        id={`${id}-error`}
                        role="alert"
                        sx={{
                            mt: 0.5,
                            fontSize: font.size.sm,
                            fontWeight: 600,
                            color: color.red700,
                        }}
                    >
                        {error}
                    </Box>
                )}
            </Box>

            <Stack
                direction="row"
                spacing={1}
                sx={{ gridColumn: { xs: '1 / -1', sm: 'auto' }, justifyContent: 'flex-start' }}
            >
                <input
                    ref={inputRef}
                    type="file"
                    accept={accept}
                    hidden
                    tabIndex={-1}
                    aria-hidden="true"
                    onChange={handleFile}
                />
                <Button
                    id={`${id}-choose`}
                    variant={file ? 'outlined' : 'contained'}
                    size="small"
                    onClick={() => inputRef.current?.click()}
                    aria-describedby={describedBy}
                    aria-label={`${file ? 'Replace' : 'Choose file for'} ${title.toLowerCase()}`}
                >
                    {file ? 'Replace' : 'Choose file'}
                </Button>
                {file && (
                    <Button
                        size="small"
                        color="error"
                        onClick={() => onChange(null)}
                        aria-label={`Remove ${title.toLowerCase()}`}
                    >
                        Remove
                    </Button>
                )}
            </Stack>
        </Box>
    );
}
