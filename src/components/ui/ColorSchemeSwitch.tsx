import { ToggleButton, ToggleButtonGroup, Tooltip, type SxProps, type Theme } from '@mui/material';
import { useColorScheme } from '@/theme/colorScheme';
import type { SchemePreference } from '@/theme/scheme';
import { color, font, radius } from '@/theme/tokens';
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

const TRACK_PAD = 3;

/**
 * Appearance: System (follow the device), Light or Dark. Saved on this device.
 * A segmented control: one recessed track, the chosen segment lifted out of it. The `&&` selectors outrank the
 * theme's toggle buttons, which are separate outlined pills.
 */
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
                {
                    display: compact ? 'inline-grid' : 'grid',
                    gridTemplateColumns: compact ? 'repeat(3, 30px)' : 'repeat(3, minmax(0, 1fr))',
                    gap: '2px',
                    flexWrap: 'nowrap',
                    p: `${TRACK_PAD}px`,
                    width: compact ? 'auto' : '100%',
                    maxWidth: compact ? 'none' : 360,
                    boxSizing: 'border-box',
                    bgcolor: color.canvas,
                    border: `1px solid ${color.line}`,
                    borderRadius: `${radius.sm + TRACK_PAD}px`,
                    '&& .MuiToggleButton-root': {
                        m: 0,
                        minWidth: 0,
                        minHeight: compact ? 28 : 32,
                        height: compact ? 28 : 32,
                        px: compact ? 0 : 1,
                        gap: 0.75,
                        border: 0,
                        borderRadius: `${radius.sm}px`,
                        bgcolor: 'transparent',
                        boxShadow: 'none',
                        color: color.ink600,
                        fontFamily: font.family,
                        fontSize: font.size.sm,
                        fontWeight: 600,
                        lineHeight: 1,
                        whiteSpace: 'nowrap',
                        transition: 'background-color 120ms, color 120ms, box-shadow 120ms',
                        '@media (prefers-reduced-motion: reduce)': { transition: 'none' },
                        '& svg': { flexShrink: 0 },
                        '&:hover': { bgcolor: 'transparent', color: color.ink900 },
                    },
                    '&& .MuiToggleButton-root.Mui-selected, && .MuiToggleButton-root.Mui-selected:hover':
                        {
                            bgcolor: color.raised,
                            color: color.ink900,
                            fontWeight: 600,
                            boxShadow: `0 0 0 1px ${color.lineStrong}`,
                            '& svg': { color: color.coral600 },
                        },
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
                    >
                        <Icon size={16} />
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
