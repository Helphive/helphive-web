import { memo } from 'react';
import { Chip } from '@mui/material';
import type { DisplayStatus } from '@/types';
import { STATUS_META } from '@/utils/format';

interface StatusChipProps {
    status: DisplayStatus;
    size?: 'small' | 'medium';
}

function StatusChip({ status, size = 'small' }: StatusChipProps) {
    const meta = STATUS_META[status];
    return (
        <Chip
            label={meta.label}
            size={size}
            sx={{
                color: meta.color,
                bgcolor: meta.background,
                fontWeight: 700,
                border: '1px solid',
                borderColor: `${meta.color}33`,
                flexShrink: 0,
            }}
        />
    );
}

export default memo(StatusChip);
