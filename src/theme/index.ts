import { alpha, createTheme, type Shadows } from '@mui/material/styles';
import type {} from '@mui/x-date-pickers/themeAugmentation';
import { color, focusRing, font, hairline, hairlineStrong, radius, shadow, tokens } from './tokens';

export { color, font, space, radius, hairline, hairlineStrong, shadow, layout } from './tokens';
export { tokens };

// Legacy names kept for older imports; prefer `color` from tokens.
export const colors = {
    primary: color.coral500,
    primaryDark: color.coral600,
    primarySoft: color.coral50,
    ink: color.ink900,
    body: color.ink600,
    muted: color.ink500,
    line: color.line,
    canvas: color.canvas,
    surface: color.surface,
    success: color.green700,
    warning: color.amber700,
    error: color.red700,
    info: color.blue700,
};

const focusVisible = { '&.Mui-focusVisible': focusRing };

// Static surfaces get no shadow; anything elevated above 4 is a floating layer.
const shadows = [
    'none',
    'none',
    'none',
    'none',
    'none',
    ...Array(20).fill(shadow.float),
] as unknown as Shadows;

export const appTheme = createTheme({
    palette: {
        mode: 'light',
        primary: {
            main: color.coral600,
            dark: color.coral700,
            light: color.coral500,
            contrastText: '#FFFFFF',
        },
        secondary: { main: color.ink900, light: color.ink700, contrastText: '#FFFFFF' },
        error: { main: color.red700, light: color.red500, contrastText: '#FFFFFF' },
        warning: { main: color.amber700, light: color.amber500, contrastText: '#FFFFFF' },
        success: { main: color.green700, light: color.green500, contrastText: '#FFFFFF' },
        info: { main: color.blue700, light: color.blue500, contrastText: '#FFFFFF' },
        grey: {
            50: color.subtle,
            100: color.canvas,
            200: color.line,
            300: color.lineStrong,
            400: color.ink300,
            500: color.ink500,
            600: color.ink600,
            700: color.ink700,
            800: color.ink900,
            900: color.ink900,
        },
        background: { default: color.canvas, paper: color.surface },
        text: { primary: color.ink900, secondary: color.ink600, disabled: color.ink300 },
        divider: color.line,
        action: {
            hover: alpha(color.ink900, 0.04),
            selected: alpha(color.ink900, 0.06),
            focus: alpha(color.ink900, 0.08),
            disabledBackground: color.line,
            disabled: color.ink300,
        },
    },
    typography: {
        fontFamily: font.family,
        fontWeightRegular: 400,
        fontWeightMedium: 500,
        fontWeightBold: 700,
        h1: {
            fontSize: font.size.display,
            lineHeight: font.lineHeight.tight,
            fontWeight: 800,
            letterSpacing: font.tracking.display,
        },
        h2: {
            fontSize: font.size['4xl'],
            lineHeight: 1.1,
            fontWeight: 800,
            letterSpacing: font.tracking.display,
        },
        h3: {
            fontSize: font.size['3xl'],
            lineHeight: font.lineHeight.snug,
            fontWeight: 800,
            letterSpacing: font.tracking.head,
        },
        h4: {
            fontSize: font.size['2xl'],
            lineHeight: font.lineHeight.snug,
            fontWeight: 800,
            letterSpacing: font.tracking.head,
        },
        h5: {
            fontSize: font.size.xl,
            lineHeight: 1.35,
            fontWeight: 700,
            letterSpacing: font.tracking.title,
        },
        h6: { fontSize: font.size.lg, lineHeight: 1.4, fontWeight: 700, letterSpacing: 0 },
        subtitle1: { fontSize: font.size.lg, lineHeight: 1.45, fontWeight: 600 },
        subtitle2: { fontSize: font.size.md, lineHeight: 1.45, fontWeight: 700 },
        body1: { fontSize: font.size.lg, lineHeight: font.lineHeight.body, fontWeight: 400 },
        body2: { fontSize: font.size.md, lineHeight: font.lineHeight.body, fontWeight: 400 },
        caption: {
            fontSize: font.size.xs,
            lineHeight: 1.45,
            fontWeight: 600,
            color: color.ink500,
        },
        // Sentence case on purpose: no tracked all-caps labels in this system.
        overline: {
            fontSize: font.size.xs,
            lineHeight: 1.45,
            fontWeight: 700,
            letterSpacing: 0,
            textTransform: 'none',
            color: color.ink500,
        },
        button: { textTransform: 'none', fontWeight: 700, letterSpacing: 0 },
    },
    shape: { borderRadius: radius.sm },
    shadows,
    components: {
        // Subtitles are emphasised labels, not headings. MUI renders them as h6 by default,
        // which put stray h6s into the outline; pass component="h2"/"h3" when one is a heading.
        MuiTypography: {
            defaultProps: { variantMapping: { subtitle1: 'p', subtitle2: 'p' } },
        },
        MuiCssBaseline: {
            styleOverrides: {
                body: {
                    backgroundColor: color.canvas,
                    color: color.ink900,
                    fontSize: font.size.md,
                    lineHeight: font.lineHeight.body,
                    // Tabular figures everywhere so money and times line up.
                    fontFeatureSettings: '"tnum" 1, "ss01" 1',
                    fontVariantNumeric: 'tabular-nums',
                },
                ':where(a, button, input, textarea, select, [tabindex]):focus-visible': focusRing,
                '::selection': { backgroundColor: color.coral100, color: color.ink900 },
            },
        },
        MuiButtonBase: {
            defaultProps: { disableRipple: true },
            styleOverrides: { root: focusVisible },
        },
        MuiButton: {
            defaultProps: { disableElevation: true },
            styleOverrides: {
                root: {
                    minHeight: 40,
                    padding: '0 16px',
                    borderRadius: radius.sm,
                    fontSize: font.size.md,
                    fontWeight: 700,
                    whiteSpace: 'nowrap',
                    boxShadow: 'none',
                    transition: 'background-color .15s, border-color .15s, color .15s',
                    '&:hover': { boxShadow: 'none' },
                    '@media (prefers-reduced-motion: reduce)': { transition: 'none' },
                    ...focusVisible,
                },
                sizeSmall: { minHeight: 32, padding: '0 12px', fontSize: font.size.sm },
                sizeLarge: { minHeight: 48, padding: '0 20px', fontSize: font.size.lg },
                startIcon: { marginRight: 6, '& > *:nth-of-type(1)': { fontSize: 18 } },
                endIcon: { marginLeft: 6, '& > *:nth-of-type(1)': { fontSize: 18 } },
                contained: {
                    '&.Mui-disabled': { backgroundColor: color.line, color: color.ink500 },
                },
                containedPrimary: {
                    backgroundColor: color.coral600,
                    '&:hover': { backgroundColor: color.coral700 },
                },
                containedSecondary: {
                    backgroundColor: color.ink900,
                    '&:hover': { backgroundColor: color.ink700 },
                },
                outlined: {
                    backgroundColor: color.surface,
                    '&.Mui-disabled': { borderColor: color.line, color: color.ink300 },
                },
                outlinedPrimary: {
                    borderColor: color.lineStrong,
                    color: color.ink900,
                    '&:hover': { borderColor: color.ink300, backgroundColor: color.subtle },
                },
                outlinedInherit: {
                    borderColor: color.lineStrong,
                    color: color.ink900,
                    '&:hover': { borderColor: color.ink300, backgroundColor: color.subtle },
                },
                outlinedSecondary: {
                    borderColor: color.ink900,
                    color: color.ink900,
                    '&:hover': { backgroundColor: color.subtle },
                },
                textPrimary: {
                    color: color.ink700,
                    '&:hover': { backgroundColor: color.canvas, color: color.ink900 },
                },
                textInherit: { '&:hover': { backgroundColor: color.canvas } },
            },
        },
        MuiIconButton: {
            styleOverrides: {
                root: {
                    borderRadius: radius.sm,
                    color: color.ink700,
                    '&:hover': { backgroundColor: color.canvas, color: color.ink900 },
                    ...focusVisible,
                },
                sizeMedium: { width: 40, height: 40 },
                sizeSmall: { width: 32, height: 32 },
            },
        },
        MuiToggleButton: {
            styleOverrides: {
                root: {
                    minHeight: 34,
                    padding: '0 12px',
                    borderRadius: radius.sm,
                    border: hairlineStrong,
                    textTransform: 'none',
                    fontWeight: 600,
                    fontSize: font.size.md,
                    color: color.ink600,
                    backgroundColor: color.surface,
                    '&:hover': { borderColor: color.ink300, backgroundColor: color.surface },
                    '&.Mui-selected, &.Mui-selected:hover': {
                        color: color.ink900,
                        backgroundColor: color.surface,
                        borderColor: color.ink900,
                        boxShadow: `inset 0 0 0 1px ${color.ink900}`,
                        fontWeight: 700,
                    },
                },
            },
        },
        MuiToggleButtonGroup: {
            styleOverrides: {
                root: { gap: 8, flexWrap: 'wrap' },
                grouped: {
                    // Separate pills rather than a joined segmented bar.
                    '&&': { borderRadius: radius.sm, border: hairlineStrong, margin: 0 },
                    '&&.Mui-selected': { borderColor: color.ink900 },
                },
            },
        },

        // Inputs: label sits above the field, never floating inside it.
        MuiFormControl: { styleOverrides: { root: { gap: 6 } } },
        MuiInputLabel: {
            defaultProps: { shrink: true },
            styleOverrides: {
                root: {
                    position: 'static',
                    transform: 'none',
                    maxWidth: '100%',
                    fontSize: font.size.sm,
                    fontWeight: 600,
                    lineHeight: 1.4,
                    color: color.ink700,
                    '&.Mui-focused': { color: color.ink900 },
                    '&.Mui-error': { color: color.ink700 },
                    '&.Mui-disabled': { color: color.ink500 },
                },
                asterisk: { color: color.coral600 },
                formControl: { position: 'static', transform: 'none' },
                outlined: { '&.MuiInputLabel-shrink': { transform: 'none' } },
            },
        },
        MuiFormLabel: {
            styleOverrides: {
                root: {
                    fontSize: font.size.sm,
                    fontWeight: 600,
                    color: color.ink700,
                    '&.Mui-focused': { color: color.ink900 },
                },
            },
        },
        MuiInputBase: {
            styleOverrides: {
                root: { fontSize: font.size.md, fontWeight: 500, color: color.ink900 },
                input: {
                    '&::placeholder': { color: color.ink500, opacity: 1 },
                },
            },
        },
        MuiOutlinedInput: {
            styleOverrides: {
                root: {
                    borderRadius: radius.sm,
                    backgroundColor: color.surface,
                    transition: 'box-shadow .15s',
                    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: color.ink300 },
                    '&.Mui-focused': { boxShadow: shadow.focusField },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: color.ink900,
                        borderWidth: 1,
                    },
                    '&.Mui-error .MuiOutlinedInput-notchedOutline': {
                        borderColor: color.red700,
                    },
                    '&.Mui-disabled': { backgroundColor: color.subtle },
                    '&.Mui-disabled .MuiOutlinedInput-notchedOutline': {
                        borderColor: color.line,
                    },
                },
                input: {
                    height: 20,
                    padding: '12px 12px',
                    '&.Mui-disabled': { WebkitTextFillColor: color.ink600 },
                },
                inputSizeSmall: { padding: '8px 10px' },
                multiline: { padding: '12px 12px' },
                adornedStart: { paddingLeft: 12 },
                adornedEnd: { paddingRight: 6 },
                notchedOutline: {
                    top: 0,
                    borderColor: color.lineStrong,
                    '& legend': { display: 'none' },
                },
            },
        },
        MuiInputAdornment: {
            styleOverrides: { root: { color: color.ink500, '& svg': { fontSize: 18 } } },
        },
        MuiSelect: {
            styleOverrides: { icon: { color: color.ink500 } },
        },
        MuiFormHelperText: {
            styleOverrides: {
                root: {
                    margin: 0,
                    fontSize: font.size.sm,
                    fontWeight: 500,
                    lineHeight: 1.45,
                    color: color.ink500,
                    '&.Mui-error': { color: color.red700, fontWeight: 600 },
                    '&.Mui-disabled': { color: color.ink500 },
                },
            },
        },
        MuiAutocomplete: {
            styleOverrides: {
                inputRoot: { '&&': { padding: '4px 6px 4px 8px' } },
                paper: {
                    marginTop: 4,
                    border: hairline,
                    borderRadius: radius.md,
                    boxShadow: shadow.float,
                },
                listbox: { padding: 4 },
                option: {
                    borderRadius: radius.sm,
                    minHeight: 40,
                    fontSize: font.size.md,
                    '&[aria-selected="true"]': { fontWeight: 700 },
                },
            },
        },

        // Choice controls
        MuiCheckbox: {
            defaultProps: { color: 'secondary' },
            styleOverrides: {
                root: {
                    color: color.lineStrong,
                    borderRadius: radius.sm,
                    '&:hover': { backgroundColor: 'transparent', color: color.ink300 },
                    '&.Mui-checked, &.MuiCheckbox-indeterminate': { color: color.ink900 },
                    '&.Mui-focusVisible': focusRing,
                },
            },
        },
        MuiRadio: {
            styleOverrides: {
                root: {
                    color: color.lineStrong,
                    '&:hover': { backgroundColor: 'transparent', color: color.ink300 },
                    '&.Mui-checked': { color: color.coral600 },
                    '&.Mui-focusVisible': focusRing,
                },
            },
        },
        MuiFormControlLabel: {
            styleOverrides: {
                label: { fontSize: font.size.md, fontWeight: 500 },
            },
        },
        MuiSwitch: {
            styleOverrides: {
                root: { width: 44, height: 24, padding: 0, margin: 8, overflow: 'visible' },
                switchBase: {
                    padding: 3,
                    '&.Mui-checked': {
                        transform: 'translateX(20px)',
                        color: '#FFFFFF',
                        '& + .MuiSwitch-track': { backgroundColor: color.green500, opacity: 1 },
                    },
                    '&.Mui-focusVisible + .MuiSwitch-track': focusRing,
                    '&.Mui-disabled + .MuiSwitch-track': { opacity: 0.4 },
                },
                thumb: {
                    width: 18,
                    height: 18,
                    boxShadow: '0 1px 2px rgba(16, 24, 40, 0.2)',
                    color: '#FFFFFF',
                },
                track: {
                    borderRadius: radius.pill,
                    backgroundColor: color.ink300,
                    opacity: 1,
                },
            },
        },
        MuiSlider: {
            styleOverrides: {
                root: { color: color.ink900, height: 4 },
                rail: { backgroundColor: color.line, opacity: 1 },
                track: { border: 0 },
                thumb: {
                    width: 20,
                    height: 20,
                    backgroundColor: '#FFFFFF',
                    border: `2px solid ${color.ink900}`,
                    '&:hover, &.Mui-active': {
                        boxShadow: `0 0 0 6px ${alpha(color.ink900, 0.08)}`,
                    },
                    '&.Mui-focusVisible': { ...focusRing, boxShadow: 'none' },
                },
                valueLabel: {
                    backgroundColor: color.ink900,
                    borderRadius: radius.sm,
                    fontSize: font.size.xs,
                    fontWeight: 700,
                },
                markLabel: { fontSize: font.size.xs, fontWeight: 600, color: color.ink500 },
            },
        },

        // Navigation
        MuiTabs: {
            styleOverrides: {
                root: { minHeight: 44 },
                indicator: { height: 2, borderRadius: 0, backgroundColor: color.ink900 },
                flexContainer: { gap: 4 },
            },
        },
        MuiTab: {
            styleOverrides: {
                root: {
                    minHeight: 44,
                    minWidth: 0,
                    padding: '0 12px',
                    textTransform: 'none',
                    fontSize: font.size.md,
                    fontWeight: 600,
                    color: color.ink600,
                    '&:hover': { color: color.ink900 },
                    '&.Mui-selected': { color: color.ink900 },
                    '&.Mui-focusVisible': { ...focusRing, outlineOffset: -2 },
                },
            },
        },
        MuiLink: {
            defaultProps: { underline: 'hover' },
            styleOverrides: { root: { fontWeight: 600 } },
        },
        MuiBreadcrumbs: {
            styleOverrides: { root: { fontSize: font.size.sm, fontWeight: 600 } },
        },
        MuiStepper: { styleOverrides: { root: { gap: 0 } } },
        MuiStepIcon: {
            styleOverrides: {
                root: {
                    color: color.lineStrong,
                    '&.Mui-active': { color: color.coral600 },
                    '&.Mui-completed': { color: color.ink900 },
                },
                text: { fontSize: font.size.xs, fontWeight: 700 },
            },
        },
        MuiStepLabel: {
            styleOverrides: {
                label: {
                    fontSize: font.size.sm,
                    fontWeight: 600,
                    color: color.ink500,
                    '&.Mui-active, &.Mui-completed': { color: color.ink900, fontWeight: 700 },
                },
            },
        },
        MuiStepConnector: { styleOverrides: { line: { borderColor: color.line } } },
        MuiAppBar: {
            defaultProps: { elevation: 0, color: 'inherit' },
            styleOverrides: {
                root: {
                    backgroundColor: color.surface,
                    color: color.ink900,
                    border: 0,
                    borderBottom: hairline,
                    borderRadius: 0,
                },
            },
        },
        MuiToolbar: {
            styleOverrides: {
                root: { minHeight: 60, '@media (min-width:0px)': { minHeight: 60 } },
            },
        },
        MuiDrawer: {
            styleOverrides: {
                paper: { border: 0, borderRadius: 0 },
                paperAnchorDockedLeft: { borderRight: hairline },
                modal: { '& .MuiDrawer-paper': { boxShadow: shadow.float } },
            },
        },
        MuiBottomNavigation: {
            styleOverrides: {
                root: { height: 64, backgroundColor: 'rgba(255, 255, 255, 0.96)' },
            },
        },
        MuiBottomNavigationAction: {
            styleOverrides: {
                root: {
                    minWidth: 0,
                    padding: '8px 0 10px',
                    gap: 2,
                    color: color.ink600,
                    '& .MuiSvgIcon-root': { fontSize: 22 },
                    '&.Mui-selected': { color: color.ink900 },
                    '&.Mui-selected .MuiSvgIcon-root': { color: color.coral600 },
                    '&.Mui-focusVisible': { ...focusRing, outlineOffset: -2 },
                },
                label: {
                    fontSize: 11,
                    fontWeight: 600,
                    '&.Mui-selected': { fontSize: 11, fontWeight: 700 },
                },
            },
        },
        MuiListItemButton: {
            styleOverrides: {
                root: {
                    borderRadius: radius.sm,
                    '&:hover': { backgroundColor: color.canvas },
                    '&.Mui-selected, &.Mui-selected:hover': {
                        backgroundColor: color.surface,
                        boxShadow: `inset 0 0 0 1px ${color.line}`,
                        color: color.ink900,
                    },
                    '&.Mui-focusVisible': {
                        ...focusRing,
                        outlineOffset: -2,
                        backgroundColor: 'transparent',
                    },
                },
            },
        },
        MuiListItemIcon: { styleOverrides: { root: { minWidth: 32, color: 'inherit' } } },
        MuiListItemText: {
            styleOverrides: { primary: { fontSize: font.size.md, fontWeight: 600 } },
        },

        // Surfaces
        MuiPaper: {
            defaultProps: { elevation: 0 },
            styleOverrides: {
                root: {
                    backgroundImage: 'none',
                    border: hairline,
                    borderRadius: radius.md,
                },
                outlined: { border: hairline },
            },
        },
        MuiCard: {
            defaultProps: { elevation: 0 },
            styleOverrides: {
                root: {
                    border: hairline,
                    borderRadius: radius.md,
                    boxShadow: 'none',
                    backgroundImage: 'none',
                },
            },
        },
        MuiCardContent: {
            styleOverrides: {
                root: { padding: 20, '&:last-child': { paddingBottom: 20 } },
            },
        },
        MuiCardActionArea: {
            styleOverrides: {
                root: { '&:hover .MuiCardActionArea-focusHighlight': { opacity: 0.02 } },
                focusHighlight: { backgroundColor: color.ink900 },
            },
        },
        MuiDivider: { styleOverrides: { root: { borderColor: color.line } } },
        MuiDialog: {
            styleOverrides: {
                paper: {
                    borderRadius: radius.lg,
                    border: hairline,
                    boxShadow: shadow.float,
                    margin: 16,
                    width: 'calc(100% - 32px)',
                },
            },
        },
        MuiBackdrop: {
            styleOverrides: {
                root: {
                    backgroundColor: alpha(color.ink900, 0.4),
                    '&.MuiBackdrop-invisible': { backgroundColor: 'transparent' },
                },
            },
        },
        MuiDialogTitle: {
            styleOverrides: {
                root: {
                    padding: '20px 24px 8px',
                    fontSize: font.size.xl,
                    fontWeight: 700,
                    letterSpacing: font.tracking.title,
                },
            },
        },
        MuiDialogContent: { styleOverrides: { root: { padding: '8px 24px 8px' } } },
        MuiDialogContentText: {
            styleOverrides: { root: { color: color.ink600, fontSize: font.size.md } },
        },
        MuiDialogActions: {
            styleOverrides: {
                root: {
                    padding: '16px 24px 20px',
                    gap: 8,
                    '& > :not(style) ~ :not(style)': { marginLeft: 0 },
                },
            },
        },
        MuiPopover: {
            styleOverrides: {
                paper: { borderRadius: radius.md, border: hairline, boxShadow: shadow.float },
            },
        },
        MuiMenu: {
            styleOverrides: {
                paper: { marginTop: 4, minWidth: 200 },
                list: { padding: 4 },
            },
        },
        MuiMenuItem: {
            styleOverrides: {
                root: {
                    minHeight: 40,
                    borderRadius: radius.sm,
                    fontSize: font.size.md,
                    fontWeight: 600,
                    gap: 10,
                    color: color.ink700,
                    '& .MuiSvgIcon-root': { fontSize: 18, color: color.ink500 },
                    '& .MuiListItemIcon-root': { minWidth: 0 },
                    '&:hover': { backgroundColor: color.canvas, color: color.ink900 },
                    '&.Mui-selected, &.Mui-selected:hover': {
                        backgroundColor: color.canvas,
                        color: color.ink900,
                    },
                    '&.Mui-focusVisible': {
                        ...focusRing,
                        outlineOffset: -2,
                        backgroundColor: color.canvas,
                    },
                },
            },
        },
        MuiTooltip: {
            defaultProps: { arrow: true },
            styleOverrides: {
                tooltip: {
                    backgroundColor: color.ink900,
                    borderRadius: radius.sm,
                    padding: '6px 8px',
                    fontSize: font.size.xs,
                    fontWeight: 600,
                },
                arrow: { color: color.ink900 },
            },
        },

        // Feedback
        MuiAlert: {
            styleOverrides: {
                root: {
                    borderRadius: radius.md,
                    padding: '10px 14px',
                    fontSize: font.size.md,
                    fontWeight: 500,
                    alignItems: 'flex-start',
                    '& .MuiAlert-icon': {
                        padding: '2px 0',
                        marginRight: 10,
                        fontSize: 20,
                        opacity: 1,
                    },
                    '& .MuiAlert-message': { padding: '1px 0' },
                    '& .MuiAlert-action': { padding: '0 0 0 12px', marginRight: -4 },
                },
                standardSuccess: {
                    backgroundColor: color.green50,
                    color: color.green700,
                    border: `1px solid ${color.green200}`,
                    '& .MuiAlert-icon': { color: color.green700 },
                },
                standardInfo: {
                    backgroundColor: color.blue50,
                    color: color.blue700,
                    border: `1px solid ${color.blue200}`,
                    '& .MuiAlert-icon': { color: color.blue700 },
                },
                standardWarning: {
                    backgroundColor: color.amber50,
                    color: color.amber700,
                    border: `1px solid ${color.amber200}`,
                    '& .MuiAlert-icon': { color: color.amber700 },
                },
                standardError: {
                    backgroundColor: color.red50,
                    color: color.red700,
                    border: `1px solid ${color.red200}`,
                    '& .MuiAlert-icon': { color: color.red700 },
                },
                // Filled alerts are toasts: ink surface, tinted icon.
                filled: {
                    backgroundColor: color.ink900,
                    color: '#FFFFFF',
                    border: 0,
                    boxShadow: shadow.float,
                    '& .MuiAlert-action .MuiIconButton-root': { color: color.ink200 },
                    '& .MuiAlert-action .MuiIconButton-root:hover': {
                        backgroundColor: alpha('#FFFFFF', 0.08),
                    },
                },
                filledSuccess: { '& .MuiAlert-icon': { color: color.green500 } },
                filledInfo: { '& .MuiAlert-icon': { color: color.blue500 } },
                filledWarning: { '& .MuiAlert-icon': { color: color.amber500 } },
                filledError: { '& .MuiAlert-icon': { color: color.red500 } },
            },
        },
        MuiAlertTitle: {
            styleOverrides: { root: { fontWeight: 700, fontSize: font.size.md, marginBottom: 2 } },
        },
        MuiSnackbarContent: {
            styleOverrides: {
                root: {
                    backgroundColor: color.ink900,
                    borderRadius: radius.md,
                    border: 0,
                    fontWeight: 600,
                },
            },
        },
        MuiSkeleton: {
            defaultProps: { animation: 'wave' },
            styleOverrides: {
                root: { backgroundColor: color.skeleton },
                rounded: { borderRadius: radius.sm },
                text: { borderRadius: 4 },
            },
        },
        MuiLinearProgress: {
            styleOverrides: {
                root: { height: 4, borderRadius: 2, backgroundColor: color.line },
                bar: { borderRadius: 2 },
            },
        },
        MuiCircularProgress: { defaultProps: { color: 'inherit' } },
        MuiBadge: {
            styleOverrides: {
                badge: {
                    fontWeight: 700,
                    fontSize: 11,
                    height: 18,
                    minWidth: 18,
                    padding: '0 5px',
                },
            },
        },
        MuiChip: {
            styleOverrides: {
                root: {
                    height: 32,
                    borderRadius: radius.sm,
                    fontSize: font.size.sm,
                    fontWeight: 600,
                    '&.Mui-focusVisible': focusRing,
                },
                sizeSmall: { height: 24, fontSize: font.size.xs },
                filled: { backgroundColor: color.canvas, color: color.ink700, border: hairline },
                outlined: {
                    backgroundColor: color.surface,
                    borderColor: color.lineStrong,
                    color: color.ink600,
                },
                clickable: {
                    '&:hover': { borderColor: color.ink300, backgroundColor: color.subtle },
                },
                icon: { fontSize: 16, color: 'inherit', marginLeft: 8 },
                iconSmall: { fontSize: 14 },
                deleteIcon: {
                    fontSize: 16,
                    color: color.ink500,
                    '&:hover': { color: color.ink900 },
                },
            },
        },
        MuiAvatar: {
            styleOverrides: {
                root: { fontSize: font.size.xs, fontWeight: 700 },
                colorDefault: { backgroundColor: color.ink900, color: '#FFFFFF' },
            },
        },

        // Tables
        MuiTableContainer: {
            styleOverrides: { root: { borderRadius: radius.md } },
        },
        MuiTableCell: {
            styleOverrides: {
                root: {
                    borderBottom: hairline,
                    padding: '12px 20px',
                    fontSize: font.size.md,
                    fontVariantNumeric: 'tabular-nums',
                },
                head: {
                    padding: '8px 20px',
                    backgroundColor: color.subtle,
                    color: color.ink500,
                    fontSize: font.size.xs,
                    fontWeight: 600,
                    lineHeight: 1.45,
                },
                sizeSmall: { padding: '8px 16px' },
            },
        },
        MuiTableRow: {
            styleOverrides: {
                root: {
                    '&:last-child td': { borderBottom: 0 },
                    '&.MuiTableRow-hover:hover': { backgroundColor: color.subtle },
                },
            },
        },
        MuiTablePagination: {
            styleOverrides: { root: { borderTop: hairline }, toolbar: { minHeight: 48 } },
        },

        // MUI X date and time pickers
        MuiPickersPopper: {
            styleOverrides: {
                paper: { borderRadius: radius.md, border: hairline, boxShadow: shadow.float },
            },
        },
        MuiPickersDay: {
            styleOverrides: {
                root: {
                    borderRadius: radius.sm,
                    fontSize: font.size.md,
                    fontWeight: 600,
                    '&:hover': { backgroundColor: color.canvas },
                    '&.Mui-selected, &.Mui-selected:hover, &.Mui-selected:focus': {
                        backgroundColor: color.ink900,
                        color: '#FFFFFF',
                    },
                    '&.Mui-focusVisible': focusRing,
                },
                today: {
                    '&:not(.Mui-selected)': { border: hairlineStrong },
                },
            },
        },
        MuiPickersCalendarHeader: {
            styleOverrides: {
                label: { fontSize: font.size.md, fontWeight: 700 },
            },
        },
        MuiDayCalendar: {
            styleOverrides: {
                weekDayLabel: { fontSize: font.size.xs, fontWeight: 600, color: color.ink500 },
            },
        },
        MuiPickersYear: {
            styleOverrides: {
                yearButton: {
                    borderRadius: radius.sm,
                    fontWeight: 600,
                    '&.Mui-selected, &.Mui-selected:hover, &.Mui-selected:focus': {
                        backgroundColor: color.ink900,
                    },
                },
            },
        },
        MuiPickersMonth: {
            styleOverrides: {
                monthButton: {
                    borderRadius: radius.sm,
                    fontWeight: 600,
                    '&.Mui-selected, &.Mui-selected:hover, &.Mui-selected:focus': {
                        backgroundColor: color.ink900,
                    },
                },
            },
        },
        MuiClock: {
            styleOverrides: {
                pin: { backgroundColor: color.ink900 },
                clock: { backgroundColor: color.canvas },
            },
        },
        MuiClockPointer: {
            styleOverrides: {
                root: { backgroundColor: color.ink900 },
                thumb: { backgroundColor: color.ink900, borderColor: color.ink900 },
            },
        },
        MuiClockNumber: {
            styleOverrides: {
                root: { fontWeight: 600, '&.Mui-selected': { backgroundColor: color.ink900 } },
            },
        },
        MuiMultiSectionDigitalClockSection: {
            styleOverrides: {
                item: {
                    borderRadius: radius.sm,
                    fontWeight: 600,
                    '&.Mui-selected, &.Mui-selected:hover': {
                        backgroundColor: color.ink900,
                        color: '#FFFFFF',
                    },
                },
            },
        },
        MuiPickersLayout: {
            styleOverrides: { actionBar: { padding: '8px 12px 12px', gap: 8 } },
        },
    },
});

export const lightTheme = appTheme;
// Dark mode is not designed yet; this stays a stub that points at the light theme.
export const darkTheme = appTheme;
