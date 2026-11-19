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

export interface ConfirmDialogProps {
    open: boolean;
    /** A question naming the action ("Cancel this booking?"). */
    title: string;
    /** The consequence, in one or two sentences. */
    description?: string;
    /** Repeats the action verb ("Cancel booking"), never "OK" or "Submit". */
    confirmLabel: string;
    cancelLabel?: string;
    /** error for destructive actions. */
    confirmColor?: 'primary' | 'error' | 'success';
    loading?: boolean;
    onConfirm: () => void;
    onClose: () => void;
    /** Optional extra body content (e.g. a reason field). */
    children?: ReactNode;
}

/** Confirmation before a consequential action. Cannot be dismissed while `loading`. */
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
            aria-describedby={description ? 'confirm-dialog-description' : undefined}
        >
            <DialogTitle id="confirm-dialog-title">{title}</DialogTitle>
            <DialogContent>
                {description && (
                    <DialogContentText
                        id="confirm-dialog-description"
                        sx={{ mb: children ? 2 : 0 }}
                    >
                        {description}
                    </DialogContentText>
                )}
                {children}
            </DialogContent>
            <DialogActions>
                <Button variant="outlined" onClick={onClose} disabled={loading}>
                    {cancelLabel}
                </Button>
                <Button
                    variant="contained"
                    color={confirmColor}
                    onClick={onConfirm}
                    disabled={loading}
                    startIcon={loading ? <CircularProgress size={16} /> : undefined}
                >
                    {confirmLabel}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
