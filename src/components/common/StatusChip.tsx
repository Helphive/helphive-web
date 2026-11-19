import type { DisplayStatus } from '@/types';
import { BookingStatusPill } from '@/components/ui/StatusPill';

interface StatusChipProps {
    status: DisplayStatus;
    size?: 'small' | 'medium';
}

// Legacy name for BookingStatusPill.
export default function StatusChip({ status, size = 'small' }: StatusChipProps) {
    return <BookingStatusPill status={status} size={size === 'small' ? 'sm' : 'md'} />;
}
