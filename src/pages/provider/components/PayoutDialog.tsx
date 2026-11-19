import { useState, type FormEvent } from 'react';
import {
    Alert,
    Button,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    InputAdornment,
    TextField,
} from '@mui/material';
import { formatMoney } from '@/utils/format';

interface PayoutDialogProps {
    open: boolean;
    availableBalance: number;
    loading: boolean;
    /** Message from a failed request, shown inside the dialog. */
    submitError?: string | null;
    onSubmit: (amount: number) => void;
    onClose: () => void;
}

/** Returns an error message for the amount, or null when it can be requested. */
function validatePayoutAmount(raw: string, available: number): string | null {
    const amount = parseFloat(raw);
    if (isNaN(amount) || amount <= 0) return 'Enter an amount greater than $0.00';
    if (amount > available) {
        return `You can withdraw up to ${formatMoney(available)}. Enter a smaller amount.`;
    }
    return null;
}

/** Payout request form. Validates on submit, then on every change. */
export default function PayoutDialog({
    open,
    availableBalance,
    loading,
    submitError,
    onSubmit,
    onClose,
}: PayoutDialogProps) {
    const [amount, setAmount] = useState('');
    const [fieldError, setFieldError] = useState<string | null>(null);

    const change = (value: string) => {
        setAmount(value);
        if (fieldError) setFieldError(validatePayoutAmount(value, availableBalance));
    };

    const submit = (e: FormEvent) => {
        e.preventDefault();
        const message = validatePayoutAmount(amount, availableBalance);
        setFieldError(message);
        if (!message) onSubmit(parseFloat(amount));
    };

    return (
        <Dialog
            open={open}
            onClose={loading ? undefined : onClose}
            fullWidth
            maxWidth="xs"
            aria-labelledby="payout-dialog-title"
            slotProps={{
                transition: {
                    onExited: () => {
                        setAmount('');
                        setFieldError(null);
                    },
                },
            }}
        >
            <form onSubmit={submit} noValidate>
                <DialogTitle id="payout-dialog-title">Withdraw funds</DialogTitle>
                <DialogContent>
                    <DialogContentText sx={{ mb: 2 }}>
                        Move money from your available balance to the bank account connected in
                        Stripe. Pending earnings cannot be withdrawn until the job is completed.
                    </DialogContentText>
                    {submitError && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {submitError}
                        </Alert>
                    )}
                    <TextField
                        fullWidth
                        autoFocus
                        label="Amount"
                        type="number"
                        value={amount}
                        onChange={(e) => change(e.target.value)}
                        error={!!fieldError}
                        helperText={
                            fieldError ?? `Available to withdraw: ${formatMoney(availableBalance)}`
                        }
                        slotProps={{
                            input: {
                                startAdornment: <InputAdornment position="start">$</InputAdornment>,
                            },
                            htmlInput: { min: 0, step: '0.01', inputMode: 'decimal' },
                        }}
                    />
                    <Button
                        size="small"
                        sx={{ mt: 1, ml: -1 }}
                        onClick={() => change(availableBalance.toFixed(2))}
                        disabled={loading}
                    >
                        Withdraw full balance
                    </Button>
                </DialogContent>
                <DialogActions>
                    <Button variant="outlined" onClick={onClose} disabled={loading}>
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        variant="contained"
                        disabled={loading}
                        startIcon={loading ? <CircularProgress size={16} /> : undefined}
                    >
                        Withdraw
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
}
