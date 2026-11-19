import { Box } from '@mui/material';
import { color, radius } from '@/theme/tokens';
import {
    LinenPorterIcon,
    PublicAreaIcon,
    RoomAttendantIcon,
    ServiceIconFallback,
    type AppIcon,
} from './icons';

// Service ids match SERVICES in src/types: 1 Public Area Attendant, 2 Room Attendant, 3 Linen Porter.
const ICONS: Record<number, AppIcon> = {
    1: PublicAreaIcon,
    2: RoomAttendantIcon,
    3: LinenPorterIcon,
};

interface ServiceIconProps {
    serviceId?: number;
    /** plain: the line glyph only. tile: duotone glyph on a coral-50 square (headers, summaries). */
    variant?: 'plain' | 'tile';
    size?: number;
}

/** Icon for a service: a made bed, a broom for shared spaces, folded linen. */
export default function ServiceIcon({ serviceId, variant = 'plain', size }: ServiceIconProps) {
    const Icon = (serviceId !== undefined && ICONS[serviceId]) || ServiceIconFallback;
    if (variant === 'plain') return <Icon size={size ?? 20} />;
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
            <Icon weight="duotone" size={Math.round(box * 0.55)} />
        </Box>
    );
}
