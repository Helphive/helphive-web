import { useEffect, useState } from 'react';
import {
    Alert,
    Button,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    FormControl,
    FormControlLabel,
    FormLabel,
    Radio,
    RadioGroup,
    TextField,
} from '@mui/material';
import { ConfirmDialog } from '@/components/ui';
import { useSnackbar } from '@/components/feedback/snackbarContext';
import { getErrorMessage } from '@/utils/format';
import {
    useBlockChatUserMutation,
    useReportChatMutation,
    useUnblockChatUserMutation,
    type ReportCategory,
} from '../chatApi';

const CATEGORIES: { value: ReportCategory; label: string }[] = [
    { value: 'harassment', label: 'Harassment or threats' },
    { value: 'spam', label: 'Spam or advertising' },
    { value: 'inappropriate', label: 'Inappropriate content' },
    { value: 'safety', label: 'I feel unsafe' },
    { value: 'fraud', label: 'Fraud or a payment outside HelpHive' },
    { value: 'other', label: 'Something else' },
];

export function BlockDialog({
    open,
    uid,
    firstName,
    blocked,
    onClose,
    onDone,
}: {
    open: boolean;
    uid: string;
    firstName: string;
    blocked: boolean;
    onClose: () => void;
    onDone: () => void;
}) {
    const snackbar = useSnackbar();
    const [block, blockState] = useBlockChatUserMutation();
    const [unblock, unblockState] = useUnblockChatUserMutation();
    const busy = blockState.isLoading || unblockState.isLoading;
    const confirm = async () => {
        try {
            if (blocked) await unblock({ uid }).unwrap();
            else await block({ uid }).unwrap();
            snackbar.success(blocked ? `${firstName} unblocked` : `${firstName} blocked`);
            onDone();
            onClose();
        } catch (err) {
            snackbar.error(
                getErrorMessage(
                    err,
                    blocked ? `Could not unblock ${firstName}` : `Could not block ${firstName}`
                )
            );
        }
    };
    return blocked ? (
        <ConfirmDialog
            open={open}
            title={`Unblock ${firstName}?`}
            description="You will be able to message each other again while you share a booking."
            confirmLabel={`Unblock ${firstName}`}
            loading={busy}
            onConfirm={confirm}
            onClose={onClose}
        />
    ) : (
        <ConfirmDialog
            open={open}
            title={`Block ${firstName}?`}
            description={`Neither of you will be able to send messages, and you will not get notifications from ${firstName}. Your bookings are not affected. You can unblock at any time.`}
            confirmLabel={`Block ${firstName}`}
            confirmColor="error"
            loading={busy}
            onConfirm={confirm}
            onClose={onClose}
        />
    );
}

export function ReportDialog({
    open,
    uid,
    firstName,
    messageId,
    blocked,
    onClose,
    onBlock,
}: {
    open: boolean;
    uid: string;
    firstName: string;
    /** Set when reporting one message rather than the person. */
    messageId?: number;
    blocked: boolean;
    onClose: () => void;
    onBlock: () => void;
}) {
    const [report, { isLoading }] = useReportChatMutation();
    const [category, setCategory] = useState<ReportCategory | ''>('');
    const [details, setDetails] = useState('');
    const [error, setError] = useState('');
    const [sent, setSent] = useState(false);

    useEffect(() => {
        if (open) {
            setCategory('');
            setDetails('');
            setError('');
            setSent(false);
        }
    }, [open]);

    const submit = async () => {
        if (!category) {
            setError('Choose a reason');
            return;
        }
        try {
            await report({
                reportedUid: uid,
                category,
                details: details.trim() || undefined,
                messageId: messageId ? String(messageId) : undefined,
            }).unwrap();
            setSent(true);
        } catch (err) {
            setError(getErrorMessage(err, 'Could not send the report. Try again.'));
        }
    };

    const title = messageId ? 'Report this message?' : `Report ${firstName}?`;
    return (
        <Dialog
            open={open}
            onClose={isLoading ? undefined : onClose}
            fullWidth
            maxWidth="xs"
            aria-labelledby="chat-report-title"
        >
            <DialogTitle id="chat-report-title">{sent ? 'Report sent' : title}</DialogTitle>
            {sent ? (
                <>
                    <DialogContent>
                        <DialogContentText>
                            HelpHive's team will review it
                            {messageId ? ' with a copy of the message' : ''}.{' '}
                            {blocked
                                ? `${firstName} is already blocked.`
                                : `You can also block ${firstName} so neither of you can send messages.`}
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        {!blocked && (
                            <Button
                                color="error"
                                variant="outlined"
                                onClick={() => {
                                    onClose();
                                    onBlock();
                                }}
                            >
                                Block {firstName}
                            </Button>
                        )}
                        <Button variant="contained" color="secondary" onClick={onClose} autoFocus>
                            Done
                        </Button>
                    </DialogActions>
                </>
            ) : (
                <>
                    <DialogContent>
                        <DialogContentText sx={{ mb: 2 }}>
                            {messageId
                                ? `HelpHive's team will see this message and your reason. ${firstName} is not told who reported it.`
                                : `HelpHive's team will review your report. ${firstName} is not told who reported them.`}
                        </DialogContentText>
                        <FormControl error={!!error && !category} required>
                            <FormLabel id="chat-report-reason">Reason</FormLabel>
                            <RadioGroup
                                aria-labelledby="chat-report-reason"
                                value={category}
                                onChange={(e) => {
                                    setCategory(e.target.value as ReportCategory);
                                    setError('');
                                }}
                            >
                                {CATEGORIES.map((c) => (
                                    <FormControlLabel
                                        key={c.value}
                                        value={c.value}
                                        control={<Radio />}
                                        label={c.label}
                                    />
                                ))}
                            </RadioGroup>
                        </FormControl>
                        <TextField
                            fullWidth
                            multiline
                            minRows={3}
                            label="Details (optional)"
                            value={details}
                            onChange={(e) => setDetails(e.target.value.slice(0, 1000))}
                            helperText={`${details.length}/1000`}
                            sx={{ mt: 2 }}
                        />
                        {error && (
                            <Alert severity="error" sx={{ mt: 2 }}>
                                {error}
                            </Alert>
                        )}
                    </DialogContent>
                    <DialogActions>
                        <Button variant="outlined" onClick={onClose} disabled={isLoading}>
                            Go back
                        </Button>
                        <Button
                            variant="contained"
                            onClick={submit}
                            disabled={isLoading}
                            startIcon={isLoading ? <CircularProgress size={16} /> : undefined}
                        >
                            Send report
                        </Button>
                    </DialogActions>
                </>
            )}
        </Dialog>
    );
}
