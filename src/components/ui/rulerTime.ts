import dayjs, { type Dayjs } from 'dayjs';

/** Decimal hour (8.5 = 08:30), "HH:mm", an ISO string, a Date or a dayjs value. */
export type TimeInput = number | string | Date | Dayjs;

export function toHour(t: TimeInput): number {
    if (typeof t === 'number') return t;
    if (typeof t === 'string') {
        const m = /^(\d{1,2}):(\d{2})$/.exec(t.trim());
        if (m) return Number(m[1]) + Number(m[2]) / 60;
    }
    const d = dayjs(t);
    return d.hour() + d.minute() / 60;
}

export function formatHour(h: number): string {
    const total = Math.round(h * 60);
    const hh = Math.floor(total / 60) % 24;
    const mm = total % 60;
    return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
}

/** Scale step giving at most `maxLabels` labels; prefers steps that land on both ends. */
export function pickTickStep(range: number, maxLabels: number): number {
    const steps = [1, 2, 3, 4, 6, 8, 12];
    const fits = (step: number) => range / step + 1 <= maxLabels;
    return steps.find((step) => fits(step) && range % step === 0) ?? steps.find(fits) ?? 12;
}
