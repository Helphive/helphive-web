import type { ReactNode } from 'react';
import {
    Button,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
} from '@mui/material';

interface ConfirmDialogProps {
    open: boolean;
    title: string;
    description?: string;
    confirmLabel: string;
    cancelLabel?: string;
    // MUI color for the confirm button.
    confirmColor?: 'primary' | 'error' | 'success';
    loading?: boolean;
    onConfirm: () => void;
    onClose: () => void;
    // Optional extra body content (e.g. a reason field).
    children?: ReactNode;
}

export default function ConfirmDialog({
    open,
    title,
    description,
    confirmLabel,
    cancelLabel = 'Go back',
    confirmColor = 'primary',
    loading = false,
    onConfirm,
    onClose,
    children,
}: ConfirmDialogProps) {
    return (
        <Dialog
            open={open}
            onClose={loading ? undefined : onClose}
            fullWidth
            maxWidth="xs"
            aria-labelledby="confirm-dialog-title"
        >
            <DialogTitle id="confirm-dialog-title">{title}</DialogTitle>
            <DialogContent>
                {description && (
                    <DialogContentText sx={{ mb: children ? 2 : 0 }}>
                        {description}
                    </DialogContentText>
                )}
                {children}
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2 }}>
                <Button onClick={onClose} disabled={loading} color="inherit">
                    {cancelLabel}
                </Button>
                <Button
                    variant="contained"
                    color={confirmColor}
                    onClick={onConfirm}
                    disabled={loading}
                    startIcon={loading ? <CircularProgress size={16} color="inherit" /> : undefined}
                >
                    {confirmLabel}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
