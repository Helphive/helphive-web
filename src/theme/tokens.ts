// Direction B design tokens. Single source for colours, type, spacing, radius and elevation.
//
// Colours come in two schemes (light and dark; values from scratch/dark-mode/spec.md, shared with the
// console and the mobile app). `color.*` and `shadow.*` are CSS custom property references
// (`var(--hh-ink-900)`), so every style that uses them follows the active scheme without re-rendering.
// Code that needs a real colour value (MUI palette, canvas charts, maps, Stripe, data-URL images) reads
// `palettes[scheme]` instead; see `useColorScheme()` in ThemeContext.

const light = {
    coral500: '#FF5740', // brand mark, highlights, ruler blocks, unread dots. Never behind white text.
    coral600: '#D93D29', // coral text, links, icons, focus ring (fills use brandFill)
    coral700: '#B8301E', // hover / pressed coral text
    coral100: '#FFDDD5',
    coral50: '#FFF0EC',

    ink900: '#101828', // headings, body text, selected outlines (fills use inkFill)
    ink700: '#344054',
    ink600: '#475467', // secondary text
    ink500: '#5B6578', // muted labels (AA on white and canvas)
    ink300: '#C3C9D4',
    ink200: '#DDE1E8',

    line: '#E4E7EC', // default hairline
    lineStrong: '#D0D5DD', // control borders
    canvas: '#F5F6F8', // page background
    surface: '#FFFFFF', // panels, cards, inputs
    subtle: '#FAFBFC', // table heads, sidebars, panel footers
    skeleton: '#ECEEF2',
    raised: '#FFFFFF', // floating layers: menus, popovers, dialogs, sheets, toasts, pickers

    brandFill: '#D93D29', // filled coral buttons, selected coral fills
    brandFillHover: '#B8301E',
    onBrand: '#FFFFFF', // text and icons on brandFill and the status fills
    inkFill: '#101828', // dark buttons, tooltips, selected chips, dark banners
    onInk: '#FFFFFF', // text and icons on inkFill

    green700: '#067647',
    green500: '#12B76A',
    green200: '#ABEFC6',
    green50: '#ECFDF3',
    greenFill: '#067647',
    blue700: '#175CD3',
    blue500: '#2E90FA',
    blue200: '#B2DDFF',
    blue50: '#EFF8FF',
    blueFill: '#175CD3',
    amber700: '#B54708',
    amber500: '#F79009',
    amber200: '#FEDF89',
    amber50: '#FFFAEB',
    amberFill: '#B54708',
    red700: '#B42318',
    red500: '#F04438',
    red200: '#FECDCA',
    red50: '#FEF3F2',
    redFill: '#B42318',

    // Behind dialogs and sheets. Light keeps the web's existing 0.40 (the spec lists 0.45 for mobile).
    scrim: 'rgba(16, 24, 40, 0.4)',
};

export type ColorToken = keyof typeof light;
export type Palette = Record<ColorToken, string>;

const dark: Palette = {
    coral500: '#FF5740',
    coral600: '#FF8672',
    coral700: '#FFA291',
    coral100: '#4A231C',
    coral50: '#2B1612',

    ink900: '#F2F4F7',
    ink700: '#D5DAE1',
    ink600: '#AAB2BF',
    ink500: '#8E97A7',
    ink300: '#4B5565',
    ink200: '#343D4C',

    line: '#252D3A',
    lineStrong: '#3A4557',
    canvas: '#0B0E14',
    surface: '#141922',
    subtle: '#10141C',
    skeleton: '#1E2532',
    raised: '#1B2230',

    brandFill: '#D93D29',
    brandFillHover: '#C7341F',
    onBrand: '#FFFFFF',
    inkFill: '#F2F4F7',
    onInk: '#101828',

    green700: '#47CD89',
    green500: '#17B26A',
    green200: '#155B3E',
    green50: '#0D261B',
    greenFill: '#067647',
    blue700: '#70B5FF',
    blue500: '#2E90FA',
    blue200: '#1C4278',
    blue50: '#0E1F37',
    blueFill: '#1570EF',
    amber700: '#FDB022',
    amber500: '#F79009',
    amber200: '#6E4A10',
    amber50: '#2A1C08',
    amberFill: '#B54708',
    red700: '#F97066',
    red500: '#F04438',
    red200: '#70241F',
    red50: '#2C1412',
    redFill: '#D92D20',

    scrim: 'rgba(3, 5, 9, 0.66)',
};

export type Scheme = 'light' | 'dark';

/** Raw colour values per scheme, for code that cannot use a CSS variable. */
export const palettes: Record<Scheme, Palette> = { light, dark };

// Scheme-dependent effects (not colours, but they change with the scheme too).
/** Raw shadow values per scheme, for places CSS variables cannot reach (Stripe's iframe). */
export const effectValues = {
    light: {
        // Only for layers that float: menus, popovers, dialogs, toasts, the hero ticket.
        shadowFloat: '0 1px 2px rgba(16, 24, 40, 0.05), 0 12px 32px -12px rgba(16, 24, 40, 0.18)',
        shadowFocusField: '0 0 0 3px rgba(16, 24, 40, 0.08)',
    },
    dark: {
        shadowFloat: '0 0 0 1px #252D3A, 0 16px 40px -12px rgba(0, 0, 0, 0.70)',
        shadowFocusField: '0 0 0 3px rgba(242, 244, 247, 0.12)',
    },
} as const;
type EffectToken = keyof (typeof effectValues)['light'];

/** `ink900` -> `--hh-ink-900`, `lineStrong` -> `--hh-line-strong`. */
export const cssVarName = (token: string) =>
    '--hh-' +
    token
        .replace(/([a-z])([A-Z])/g, '$1-$2')
        .replace(/([a-zA-Z])(\d)/g, '$1-$2')
        .toLowerCase();

const refs = <K extends string>(keys: K[]) =>
    Object.fromEntries(keys.map((k) => [k, `var(${cssVarName(k)})`])) as Record<K, string>;

/** Colour tokens as CSS variable references; they follow the active scheme. */
export const color: Readonly<Record<ColorToken, string>> = refs(Object.keys(light) as ColorToken[]);

const tokenByVar = Object.fromEntries(
    (Object.keys(light) as ColorToken[]).map((k) => [color[k], k])
) as Record<string, ColorToken>;

/**
 * The real colour behind a `color.*` reference in a scheme, for places CSS variables cannot reach
 * (data-URL images, canvas, iframes). Anything else is returned unchanged.
 */
export const rawColor = (value: string, scheme: Scheme): string => {
    const token = tokenByVar[value];
    return token ? palettes[scheme][token] : value;
};

const effect = refs(Object.keys(effectValues.light) as EffectToken[]);

/**
 * A token at a given opacity, as a CSS colour that follows the scheme (replaces `alpha(token, a)`).
 * `wash(color.ink900, 0.04)` is a 4% ink overlay: dark ink on light, light ink on dark.
 */
export const wash = (token: string, opacity: number) =>
    `color-mix(in srgb, ${token} ${Math.round(opacity * 1000) / 10}%, transparent)`;

/**
 * Styles that apply only in the dark scheme, for the few places where dark needs a different role
 * rather than a different value. Spread into `sx`: `{ bgcolor: color.inkFill, ...inDark({ bgcolor: color.canvas }) }`.
 */
// (html, not :root: a selector starting with a colon is read as a pseudo-class of the element.)
export const inDark = <T extends object>(styles: T) => ({ 'html[data-theme="dark"] &': styles });

/**
 * Hover backgrounds for rows and list items. Light uses the subtle or canvas grey; on dark those are
 * darker than the surface, so the hover lifts with a light ink wash instead. Use as `'&:hover': hoverRow`.
 */
export const hoverRow = { bgcolor: color.subtle, ...inDark({ bgcolor: wash(color.ink900, 0.04) }) };
export const hoverItem = {
    bgcolor: color.canvas,
    ...inDark({ bgcolor: wash(color.ink900, 0.06) }),
};

const declarations = (scheme: Scheme) =>
    [
        ...Object.entries(palettes[scheme]).map(([k, v]) => `${cssVarName(k)}:${v};`),
        ...Object.entries(effectValues[scheme]).map(([k, v]) => `${cssVarName(k)}:${v};`),
    ].join('');

/**
 * The stylesheet that defines every token for both schemes. `<html data-theme="dark">` selects dark;
 * printing always uses light.
 */
export const schemeCss = () =>
    `:root{${declarations('light')}color-scheme:light;}` +
    `:root[data-theme="dark"]{${declarations('dark')}color-scheme:dark;}` +
    `@media print{:root,:root[data-theme="dark"]{${declarations('light')}color-scheme:light;}}`;

export const font = {
    family: '"Plus Jakarta Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    // Loaded weights (index.html): 400 500 600 700 800. Do not use others.
    weight: { regular: 400, medium: 500, semibold: 600, bold: 700, extrabold: 800 },
    size: {
        xs: '0.75rem', // 12
        sm: '0.8125rem', // 13
        md: '0.875rem', // 14, default UI text
        lg: '1rem', // 16
        xl: '1.125rem', // 18
        '2xl': '1.25rem', // 20
        '3xl': '1.75rem', // 28, page titles
        '4xl': 'clamp(1.75rem, 3.2vw, 2.5rem)', // 28-40
        display: 'clamp(2.375rem, 5.4vw, 4.25rem)', // 38-68
    },
    lineHeight: { tight: 1.04, snug: 1.25, body: 1.55 },
    tracking: { display: '-0.035em', head: '-0.02em', title: '-0.01em' },
} as const;

// Pixel values. MUI's spacing unit stays 8px, so sx={{ p: 2.5 }} === space[5] (20px).
export const space = {
    1: 4,
    2: 8,
    3: 12,
    4: 16,
    5: 20,
    6: 24,
    8: 32,
    10: 40,
    12: 48,
    16: 72,
} as const;

export const radius = {
    sm: 6, // controls: buttons, inputs, chips, tiles
    md: 10, // panels, menus, alerts
    lg: 14, // frames: dialogs, auth panel
    pill: 999, // status pills and counts only
} as const;

export const hairline = `1px solid ${color.line}`;
export const hairlineStrong = `1px solid ${color.lineStrong}`;

export const shadow = {
    // Only for layers that float: menus, popovers, dialogs, toasts, the hero ticket.
    float: effect.shadowFloat,
    focusField: effect.shadowFocusField,
} as const;

export const focusRing = {
    outline: `2px solid ${color.coral600}`,
    outlineOffset: 2,
} as const;

export const layout = {
    contentMaxWidth: 1200,
    narrowMaxWidth: 720, // forms, receipts, single-column detail
    topBarHeight: 60,
    sidebarWidth: 232,
    bottomNavHeight: 64,
    // Page gutters by breakpoint (xs / sm / md+), in px.
    gutter: { xs: 16, sm: 24, md: 32 },
} as const;

export const tokens = {
    color,
    font,
    space,
    radius,
    hairline,
    hairlineStrong,
    shadow,
    focusRing,
    layout,
};
export default tokens;
