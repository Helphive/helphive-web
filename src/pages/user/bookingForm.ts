import dayjs, { type Dayjs } from 'dayjs';

// Limits are unchanged from the original booking form.
export const RATE_LIMITS = { min: 20, max: 200, step: 5 } as const;
export const HOUR_LIMITS = { min: 1, max: 12 } as const;

// Common start times offered as tiles. "Other time" opens the full time picker.
export const QUICK_TIMES = ['06:00', '07:00', '08:00', '09:00', '10:00', '12:00', '14:00'] as const;

/** The next seven days, each at the start of the local day (what the date picker produces). */
export const getDayOptions = (): Dayjs[] =>
    Array.from({ length: 7 }, (_, i) => dayjs().startOf('day').add(i, 'day'));

/** Today at the given "HH:mm" (what the time picker produces for a time picked without a date). */
export const timeFromLabel = (label: string): Dayjs => {
    const [h, m] = label.split(':').map(Number);
    return dayjs().startOf('day').hour(h).minute(m);
};

export const isValidDate = (d: Dayjs | null): d is Dayjs => !!d && d.isValid();

/** Local start of the shift: the chosen day at the chosen time. */
export const combineStart = (date: Dayjs | null, time: Dayjs | null): Dayjs | null =>
    isValidDate(date) && isValidDate(time)
        ? date.startOf('day').hour(time.hour()).minute(time.minute())
        : null;

export interface FlowValues {
    serviceId: number | null;
    date: Dayjs | null;
    time: Dayjs | null;
    /** The address text that will be shown to the provider. */
    address: string;
    /** Whether a pin has been placed (by search, the map or the current location). */
    pinned: boolean;
}

export interface FlowErrors {
    service?: string;
    date?: string;
    time?: string;
    address?: string;
}

/** Messages say how to fix the problem. The past-time check only runs once both values exist. */
export function validateFlow({ serviceId, date, time, address, pinned }: FlowValues): FlowErrors {
    const errors: FlowErrors = {};
    if (!serviceId) errors.service = 'Choose a service to book.';
    if (!date) errors.date = 'Choose the day of the shift.';
    else if (!date.isValid()) errors.date = 'Enter a valid date, for example 21/11/2026.';
    else if (date.isBefore(dayjs().startOf('day'))) errors.date = 'Choose today or a later day.';
    if (!time) errors.time = 'Choose a start time.';
    else if (!time.isValid()) errors.time = 'Enter a valid time, for example 08:00.';
    const start = combineStart(date, time);
    if (start && !errors.date && !errors.time && start.isBefore(dayjs())) {
        errors.time = 'That start time has passed. Choose a later time or another day.';
    }
    if (!pinned) errors.address = 'Search for the place, or choose it on the map.';
    else if (!address.trim()) errors.address = 'Type the address your provider should go to.';
    return errors;
}

/** Order the sections are completed in, used for the step header and the next-step hint. */
export const FLOW_STEPS = [
    { label: 'Service' },
    { label: 'Date and time', short: 'Date' },
    { label: 'Hours and rate', short: 'Hours' },
    { label: 'Address' },
    { label: 'Payment' },
];

/** Whole US dollars, for rates that move in $5 steps. */
export const usd0 = (n: number) => `$${n}`;
