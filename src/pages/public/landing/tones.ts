import { color, inDark } from '@/theme/tokens';

export type SectionTone = 'surface' | 'canvas' | 'ink' | 'coral';

// The ink band is the page's one deep section. On dark an ink fill would be a near-white slab, so there it
// becomes the deepest layer (canvas) with light text, set off by hairlines.
export const TONES: Record<SectionTone, { bg: string; fg: string; muted: string }> = {
    surface: { bg: color.surface, fg: color.ink900, muted: color.ink600 },
    canvas: { bg: color.canvas, fg: color.ink900, muted: color.ink600 },
    coral: { bg: color.coral50, fg: color.ink900, muted: color.ink700 },
    ink: { bg: color.inkFill, fg: color.onInk, muted: color.ink300 },
};

/** Secondary text colour in a section band. */
export const toneMutedSx = (tone: SectionTone) => ({
    color: TONES[tone].muted,
    ...(tone === 'ink' && inDark({ color: color.ink600 })),
});
