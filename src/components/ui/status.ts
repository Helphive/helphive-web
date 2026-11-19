import type { DisplayStatus } from '@/types';
import { color } from '@/theme/tokens';

export type Tone = 'green' | 'blue' | 'amber' | 'grey' | 'red';

/** Pill colours per tone: green done, blue in motion, amber needs action, grey neutral, red stopped. */
export const TONE_STYLES: Record<Tone, { fg: string; bg: string; border: string }> = {
    green: { fg: color.green700, bg: color.green50, border: color.green200 },
    blue: { fg: color.blue700, bg: color.blue50, border: color.blue200 },
    amber: { fg: color.amber700, bg: color.amber50, border: color.amber200 },
    grey: { fg: color.ink600, bg: color.canvas, border: color.line },
    red: { fg: color.red700, bg: color.red50, border: color.red200 },
};

export const BOOKING_STATUS: Record<DisplayStatus, { label: string; tone: Tone }> = {
    scheduled: { label: 'Scheduled', tone: 'grey' },
    accepted: { label: 'Accepted', tone: 'blue' },
    awaiting_start_approval: { label: 'Needs approval', tone: 'amber' },
    in_progress: { label: 'In progress', tone: 'blue' },
    completed: { label: 'Completed', tone: 'green' },
    cancelled: { label: 'Cancelled', tone: 'red' },
    expired: { label: 'Expired', tone: 'grey' },
};

// Visually hidden but read by screen readers.
export const srOnly = {
    position: 'absolute',
    width: '1px',
    height: '1px',
    padding: 0,
    margin: -1,
    overflow: 'hidden',
    clip: 'rect(0 0 0 0)',
    whiteSpace: 'nowrap',
    border: 0,
} as const;
