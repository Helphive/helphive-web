import { Box } from '@mui/material';
import {
    BedOutlined,
    CleaningServicesOutlined,
    DryCleaningOutlined,
    WorkOutline,
} from '@mui/icons-material';
import { color, radius } from '@/theme/tokens';

// Service ids match SERVICES in src/types: 1 Public Area Attendant, 2 Room Attendant, 3 Linen Porter.
const ICONS = {
    1: CleaningServicesOutlined,
    2: BedOutlined,
    3: DryCleaningOutlined,
} as const;

interface ServiceIconProps {
    serviceId?: number;
    /** plain: the glyph only. tile: 40px coral-50 square (service headers, summaries). */
    variant?: 'plain' | 'tile';
    size?: number;
}

/** Line icon for a service. Replaces the PNG icons in /public/icons for new UI. */
export default function ServiceIcon({ serviceId, variant = 'plain', size }: ServiceIconProps) {
    const Icon = ICONS[serviceId as keyof typeof ICONS] ?? WorkOutline;
    if (variant === 'plain') return <Icon aria-hidden="true" sx={{ fontSize: size ?? 18 }} />;
    const box = size ?? 40;
    return (
        <Box
            aria-hidden="true"
            sx={{
                width: box,
                height: box,
                borderRadius: `${radius.sm}px`,
                bgcolor: color.coral50,
                color: color.coral700,
                display: 'grid',
                placeItems: 'center',
                flexShrink: 0,
            }}
        >
            <Icon sx={{ fontSize: Math.round(box * 0.5) }} />
        </Box>
    );
}
