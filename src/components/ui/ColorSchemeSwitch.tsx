import { ToggleButton, ToggleButtonGroup, Tooltip, type SxProps, type Theme } from '@mui/material';
import { useColorScheme } from '@/theme/colorScheme';
import type { SchemePreference } from '@/theme/scheme';
import { SchemeDarkIcon, SchemeLightIcon, SchemeSystemIcon } from './icons';

const OPTIONS: { value: SchemePreference; label: string; Icon: typeof SchemeLightIcon }[] = [
    { value: 'system', label: 'System', Icon: SchemeSystemIcon },
    { value: 'light', label: 'Light', Icon: SchemeLightIcon },
    { value: 'dark', label: 'Dark', Icon: SchemeDarkIcon },
];

export interface ColorSchemeSwitchProps {
    /** `labelled`: icon and word (settings). `compact`: icons only, named by tooltip and aria-label. */
    variant?: 'labelled' | 'compact';
    /** Accessible name of the group. */
    'aria-label'?: string;
    'aria-labelledby'?: string;
    sx?: SxProps<Theme>;
}

/** Appearance: System (follow the device), Light or Dark. Saved on this device. */
export default function ColorSchemeSwitch({
    variant = 'labelled',
    'aria-label': ariaLabel,
    'aria-labelledby': labelledBy,
    sx,
}: ColorSchemeSwitchProps) {
    const { preference, setPreference } = useColorScheme();
    const compact = variant === 'compact';
    return (
        <ToggleButtonGroup
            exclusive
            value={preference}
            onChange={(_, v: SchemePreference | null) => v && setPreference(v)}
            aria-label={labelledBy ? undefined : (ariaLabel ?? 'Appearance')}
            aria-labelledby={labelledBy}
            sx={[
                // Three equal columns, so the choices never wrap into a ragged second row.
                !compact && {
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
                    maxWidth: 360,
                },
                compact && {
                    gap: 0.5,
                    flexWrap: 'nowrap',
                    '& .MuiToggleButton-root': { minHeight: 32, width: 32, p: 0 },
                },
                ...(Array.isArray(sx) ? sx : [sx]),
            ]}
        >
            {OPTIONS.map(({ value, label, Icon }) => {
                const button = (
                    <ToggleButton
                        key={value}
                        value={value}
                        aria-label={compact ? `${label} appearance` : undefined}
                        sx={compact ? undefined : { gap: 0.75, px: 1, minHeight: 40 }}
                    >
                        <Icon size={18} />
                        {!compact && label}
                    </ToggleButton>
                );
                return compact ? (
                    <Tooltip key={value} title={label} disableInteractive>
                        {button}
                    </Tooltip>
                ) : (
                    button
                );
            })}
        </ToggleButtonGroup>
    );
}
