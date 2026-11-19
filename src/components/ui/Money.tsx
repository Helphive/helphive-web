import { Box, type SxProps, type Theme } from '@mui/material';
import { formatMoney } from '@/utils/format';
import { font } from '@/theme/tokens';

interface MoneyProps {
    amount?: number | null;
    /** ISO currency code; bookings are in US dollars. */
    currency?: string;
    /** Appends "/hr". */
    perHour?: boolean;
    /** inherit: body text. lg: 20/800 summary figure. xl: 28/800 total. */
    size?: 'inherit' | 'lg' | 'xl';
    sx?: SxProps<Theme>;
}

const SIZES = {
    inherit: {},
    lg: { fontSize: font.size['2xl'], fontWeight: 800, letterSpacing: font.tracking.head },
    xl: {
        fontSize: { xs: font.size['2xl'], sm: font.size['3xl'] },
        fontWeight: 800,
        letterSpacing: font.tracking.head,
        lineHeight: 1.15,
    },
} as const;

/** A formatted amount with tabular figures. Use formatMoney() for plain strings. */
export default function Money({
    amount,
    currency = 'usd',
    perHour,
    size = 'inherit',
    sx,
}: MoneyProps) {
    return (
        <Box
            component="span"
            sx={[
                { fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap', ...SIZES[size] },
                ...(Array.isArray(sx) ? sx : [sx]),
            ]}
        >
            {formatMoney(amount, currency)}
            {perHour && '/hr'}
        </Box>
    );
}
