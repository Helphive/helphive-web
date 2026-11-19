import { forwardRef, useState } from 'react';
import { IconButton, InputAdornment, TextField, Tooltip, type TextFieldProps } from '@mui/material';
import { HidePasswordIcon, ShowPasswordIcon } from '@/components/ui/icons';

export type PasswordFieldProps = Omit<TextFieldProps, 'type'>;

/**
 * TextField with a labelled show/hide toggle. Forwards the ref to the <input>,
 * so `{...register('password')}` from react-hook-form works unchanged.
 */
const PasswordField = forwardRef<HTMLInputElement, PasswordFieldProps>(function PasswordField(
    { slotProps, autoComplete = 'current-password', ...props },
    ref
) {
    const [visible, setVisible] = useState(false);
    const label = visible ? 'Hide password' : 'Show password';
    const inputSlot = (slotProps?.input ?? {}) as Record<string, unknown>;
    return (
        <TextField
            {...props}
            inputRef={ref}
            type={visible ? 'text' : 'password'}
            autoComplete={autoComplete}
            slotProps={{
                ...slotProps,
                input: {
                    ...inputSlot,
                    endAdornment: (
                        <InputAdornment position="end">
                            <Tooltip title={label}>
                                <IconButton
                                    size="small"
                                    aria-label={label}
                                    aria-pressed={visible}
                                    onClick={() => setVisible((v) => !v)}
                                    onMouseDown={(e) => e.preventDefault()}
                                >
                                    {visible ? (
                                        <HidePasswordIcon fontSize="small" />
                                    ) : (
                                        <ShowPasswordIcon fontSize="small" />
                                    )}
                                </IconButton>
                            </Tooltip>
                        </InputAdornment>
                    ),
                },
            }}
        />
    );
});

export default PasswordField;
