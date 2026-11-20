import { forwardRef, useRef, type KeyboardEvent, type ReactNode } from 'react';
import { Box, type SxProps, type Theme } from '@mui/material';
import { color, font, hairlineStrong, radius } from '@/theme/tokens';
import { CheckMarkIcon } from '@/components/ui/icons';

export interface SelectableTileProps {
    selected: boolean;
    /** Called on click / Space / Enter. For checkboxes, toggle in the handler. */
    onSelect: () => void;
    /** ARIA role. Use 'radio' inside a radiogroup, 'checkbox' for multi-select. */
    type?: 'radio' | 'checkbox';
    title: ReactNode;
    description?: ReactNode;
    /** Trailing icon (service icon). */
    icon?: ReactNode;
    /** tile: full card with radio/check mark. compact: 34px pill (times, days, filters). */
    size?: 'tile' | 'compact';
    disabled?: boolean;
    tabIndex?: number;
    onKeyDown?: (e: KeyboardEvent<HTMLButtonElement>) => void;
    id?: string;
    sx?: SxProps<Theme>;
}

/** A choice rendered as a tile. Selected = ink outline (never a coral fill). */
export const SelectableTile = forwardRef<HTMLButtonElement, SelectableTileProps>(
    function SelectableTile(
        {
            selected,
            onSelect,
            type = 'radio',
            title,
            description,
            icon,
            size = 'tile',
            disabled,
            tabIndex,
            onKeyDown,
            id,
            sx,
        },
        ref
    ) {
        const compact = size === 'compact';
        return (
            <Box
                component="button"
                type="button"
                ref={ref}
                id={id}
                role={type}
                aria-checked={selected}
                disabled={disabled}
                tabIndex={tabIndex}
                onClick={onSelect}
                onKeyDown={onKeyDown}
                sx={[
                    {
                        font: 'inherit',
                        color: color.ink900,
                        textAlign: 'left',
                        cursor: 'pointer',
                        bgcolor: color.surface,
                        border: hairlineStrong,
                        borderRadius: `${radius.sm}px`,
                        transition: 'border-color .15s, box-shadow .15s',
                        '&:hover:not(:disabled)': { borderColor: color.ink300 },
                        '&[aria-checked="true"]': {
                            borderColor: color.ink900,
                            boxShadow: `inset 0 0 0 1px ${color.ink900}`,
                            fontWeight: compact ? 700 : undefined,
                        },
                        '&:disabled': { cursor: 'not-allowed', opacity: 0.5 },
                        ...(compact
                            ? {
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  gap: 0.75,
                                  minHeight: 34,
                                  px: 1.5,
                                  fontSize: font.size.md,
                                  fontWeight: 600,
                                  fontVariantNumeric: 'tabular-nums',
                              }
                            : {
                                  display: 'grid',
                                  gridTemplateColumns: icon
                                      ? 'auto minmax(0, 1fr) auto'
                                      : 'auto minmax(0, 1fr)',
                                  gap: 1.5,
                                  alignItems: 'start',
                                  width: '100%',
                                  px: 2,
                                  py: 1.5,
                              }),
                    },
                    ...(Array.isArray(sx) ? sx : [sx]),
                ]}
            >
                {!compact && <Mark type={type} selected={selected} />}
                {compact ? (
                    title
                ) : (
                    <Box component="span" sx={{ minWidth: 0 }}>
                        <Box
                            component="span"
                            sx={{ display: 'block', fontSize: font.size.md, fontWeight: 700 }}
                        >
                            {title}
                        </Box>
                        {description && (
                            <Box
                                component="span"
                                sx={{
                                    display: 'block',
                                    mt: '2px',
                                    fontSize: font.size.xs,
                                    lineHeight: 1.4,
                                    color: color.ink500,
                                }}
                            >
                                {description}
                            </Box>
                        )}
                    </Box>
                )}
                {!compact && icon && (
                    <Box
                        component="span"
                        aria-hidden="true"
                        sx={{ color: color.ink500, display: 'flex', '& svg': { fontSize: 20 } }}
                    >
                        {icon}
                    </Box>
                )}
            </Box>
        );
    }
);

function Mark({ type, selected }: { type: 'radio' | 'checkbox'; selected: boolean }) {
    if (type === 'checkbox') {
        return (
            <Box
                component="span"
                aria-hidden="true"
                sx={{
                    width: 16,
                    height: 16,
                    mt: '2px',
                    borderRadius: '4px',
                    border: selected ? 0 : `1.5px solid ${color.lineStrong}`,
                    bgcolor: selected ? color.inkFill : 'transparent',
                    color: color.onInk,
                    display: 'grid',
                    placeItems: 'center',
                    '& svg': { fontSize: 13 },
                }}
            >
                {selected && <CheckMarkIcon weight="bold" />}
            </Box>
        );
    }
    return (
        <Box
            component="span"
            aria-hidden="true"
            sx={{
                width: 16,
                height: 16,
                mt: '2px',
                borderRadius: '50%',
                border: selected
                    ? `5px solid ${color.coral600}`
                    : `1.5px solid ${color.lineStrong}`,
            }}
        />
    );
}

export interface TileOption<T> {
    value: T;
    title: ReactNode;
    description?: ReactNode;
    icon?: ReactNode;
    disabled?: boolean;
}

type GroupBase<T> = {
    options: TileOption<T>[];
    size?: 'tile' | 'compact';
    /** Grid columns from sm up (phones get one column for tiles; compact tiles wrap). */
    columns?: number;
    'aria-label'?: string;
    'aria-labelledby'?: string;
    sx?: SxProps<Theme>;
};

type RadioGroupProps<T> = GroupBase<T> & {
    type?: 'radio';
    value: T | null | undefined;
    onChange: (value: T) => void;
};

type CheckboxGroupProps<T> = GroupBase<T> & {
    type: 'checkbox';
    value: T[];
    onChange: (value: T[]) => void;
};

/**
 * A set of SelectableTiles with the right group role. Radio groups use a roving tab stop:
 * Tab enters the group once, arrow keys move and select.
 */
export function SelectableTileGroup<T extends string | number>(
    props: RadioGroupProps<T> | CheckboxGroupProps<T>
) {
    const { options, size = 'tile', columns = 3, sx } = props;
    const refs = useRef<(HTMLButtonElement | null)[]>([]);
    const isRadio = props.type !== 'checkbox';

    const isSelected = (v: T) =>
        props.type === 'checkbox' ? props.value.includes(v) : props.value === v;

    const enabled = options.map((o, i) => (o.disabled ? -1 : i)).filter((i) => i >= 0);
    const selectedIndex = options.findIndex((o) => isSelected(o.value) && !o.disabled);
    const tabStop = selectedIndex >= 0 ? selectedIndex : (enabled[0] ?? -1);

    const select = (v: T) => {
        if (props.type === 'checkbox') {
            props.onChange(
                props.value.includes(v) ? props.value.filter((x) => x !== v) : [...props.value, v]
            );
        } else {
            props.onChange(v);
        }
    };

    const onKeyDown = (i: number) => (e: KeyboardEvent<HTMLButtonElement>) => {
        if (!isRadio) return;
        const delta =
            e.key === 'ArrowRight' || e.key === 'ArrowDown'
                ? 1
                : e.key === 'ArrowLeft' || e.key === 'ArrowUp'
                  ? -1
                  : 0;
        if (!delta || enabled.length === 0) return;
        e.preventDefault();
        const pos = enabled.indexOf(i);
        const next = enabled[(pos + delta + enabled.length) % enabled.length];
        refs.current[next]?.focus();
        select(options[next].value);
    };

    return (
        <Box
            role={isRadio ? 'radiogroup' : 'group'}
            aria-label={props['aria-label']}
            aria-labelledby={props['aria-labelledby']}
            sx={[
                size === 'compact'
                    ? { display: 'flex', flexWrap: 'wrap', gap: 1 }
                    : {
                          display: 'grid',
                          gap: 1,
                          gridTemplateColumns: {
                              xs: '1fr',
                              sm: `repeat(${columns}, minmax(0, 1fr))`,
                          },
                      },
                ...(Array.isArray(sx) ? sx : [sx]),
            ]}
        >
            {options.map((o, i) => (
                <SelectableTile
                    key={String(o.value)}
                    ref={(el) => {
                        refs.current[i] = el;
                    }}
                    type={isRadio ? 'radio' : 'checkbox'}
                    size={size}
                    selected={isSelected(o.value)}
                    onSelect={() => select(o.value)}
                    title={o.title}
                    description={o.description}
                    icon={o.icon}
                    disabled={o.disabled}
                    tabIndex={isRadio ? (i === tabStop ? 0 : -1) : undefined}
                    onKeyDown={onKeyDown(i)}
                />
            ))}
        </Box>
    );
}

export default SelectableTile;
