// Direction B design tokens. Single source for colours, type, spacing, radius and elevation.
// src/index.css mirrors the colour values as CSS custom properties; keep both in sync.

export const color = {
    coral500: '#FF5740', // brand mark, highlights, ruler blocks. Never behind white text.
    coral600: '#D93D29', // filled buttons, text-bearing coral (AA on white)
    coral700: '#B8301E',
    coral100: '#FFDDD5',
    coral50: '#FFF0EC',

    ink900: '#101828', // headings, body text, selected outlines
    ink700: '#344054',
    ink600: '#475467', // secondary text
    ink500: '#5B6578', // muted labels (AA on white and canvas)
    ink300: '#C3C9D4',
    ink200: '#DDE1E8',

    line: '#E4E7EC', // default hairline
    lineStrong: '#D0D5DD', // control borders
    canvas: '#F5F6F8', // page background
    surface: '#FFFFFF', // panels
    subtle: '#FAFBFC', // table heads, sidebars, panel footers
    skeleton: '#ECEEF2',

    green700: '#067647',
    green500: '#12B76A',
    green200: '#ABEFC6',
    green50: '#ECFDF3',
    blue700: '#175CD3',
    blue500: '#2E90FA',
    blue200: '#B2DDFF',
    blue50: '#EFF8FF',
    amber700: '#B54708',
    amber500: '#F79009',
    amber200: '#FEDF89',
    amber50: '#FFFAEB',
    red700: '#B42318',
    red500: '#F04438',
    red200: '#FECDCA',
    red50: '#FEF3F2',
} as const;

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
    float: '0 1px 2px rgba(16, 24, 40, 0.05), 0 12px 32px -12px rgba(16, 24, 40, 0.18)',
    focusField: '0 0 0 3px rgba(16, 24, 40, 0.08)',
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
