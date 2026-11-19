import type { Booking } from '@/types';
import { PLATFORM_FEE_RATE, formatMoney } from '@/utils/format';
import { color } from '@/theme/tokens';
import { DataList, DataRow, Panel } from '@/components/ui';
import { orderTotal } from '../orderUtils';

/** Pay breakdown for a job: rate, hours, platform fee and what the provider keeps. */
export default function EarningsBreakdown({ booking }: { booking: Booking }) {
    const subtotal = orderTotal(booking);
    const fee = subtotal * PLATFORM_FEE_RATE;
    return (
        <Panel title="Your pay">
            <DataList variant="inline">
                <DataRow label="Hourly rate" value={`${formatMoney(booking.rate)}/hr`} />
                <DataRow label="Hours" value={booking.hours || 0} />
                <DataRow label="Subtotal" value={formatMoney(subtotal)} />
                <DataRow
                    label={`Platform fee (${Math.round(PLATFORM_FEE_RATE * 100)}%)`}
                    value={<span style={{ color: color.red700 }}>-{formatMoney(fee)}</span>}
                />
            </DataList>
            <DataList
                variant="inline"
                sx={{ mt: 1, pt: 1, borderTop: '1px solid', borderColor: 'divider' }}
            >
                <DataRow label="You earn" value={formatMoney(subtotal - fee)} emphasis />
            </DataList>
        </Panel>
    );
}
