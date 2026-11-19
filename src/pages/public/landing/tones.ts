import { color } from '@/theme/tokens';

export type SectionTone = 'surface' | 'canvas' | 'ink' | 'coral';

export const TONES: Record<SectionTone, { bg: string; fg: string; muted: string }> = {
    surface: { bg: color.surface, fg: color.ink900, muted: color.ink600 },
    canvas: { bg: color.canvas, fg: color.ink900, muted: color.ink600 },
    coral: { bg: color.coral50, fg: color.ink900, muted: color.ink700 },
    ink: { bg: color.ink900, fg: color.surface, muted: color.ink300 },
};

export const toneMuted = (tone: SectionTone) => TONES[tone].muted;
