// Validation rules. Messages say how to fix the problem. Password rules mirror the API's.
export const emailRules = {
    required: 'Enter your email address',
    pattern: {
        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
        message: 'Enter an email address like name@example.com',
    },
};

const NAME_PATTERN = /^[a-zA-ZÀ-￿]+([ '-]?[a-zA-ZÀ-￿]+){0,2}\.?$/;

export const nameRules = (label: 'first' | 'last') => ({
    required: `Enter your ${label} name`,
    minLength: { value: 2, message: 'Use at least 2 characters' },
    maxLength: { value: 50, message: 'Use 50 characters or fewer' },
    pattern: {
        value: NAME_PATTERN,
        message: 'Use letters only. Spaces, hyphens and apostrophes are allowed.',
    },
});

export const PASSWORD_HINT =
    'At least 8 characters, with a lowercase letter, an uppercase letter, a number and a symbol.';

export function validateNewPassword(value: string): true | string {
    if (!value) return 'Create a password';
    if (value.length < 8) return 'Use at least 8 characters';
    if (!/[a-z]/.test(value)) return 'Add a lowercase letter';
    if (!/[A-Z]/.test(value)) return 'Add an uppercase letter';
    if (!/[0-9]/.test(value)) return 'Add a number';
    if (!/[^A-Za-z0-9]/.test(value)) return 'Add a symbol, such as ! or #';
    return true;
}

interface ApiError {
    status?: number;
    data?: { message?: string };
}

/** Turns an RTK Query error into a message for the form. `byStatus` overrides specific statuses. */
export function authErrorMessage(err: unknown, byStatus: Record<number, string> = {}): string {
    const { status, data } = (err ?? {}) as ApiError;
    if (status !== undefined && byStatus[status]) return byStatus[status];
    return data?.message || 'Something went wrong. Check your connection and try again.';
}
