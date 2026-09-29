import type { ReactNode } from 'react';
import { Box, Typography } from '@mui/material';

interface InfoRowProps {
    icon: ReactNode;
    label: string;
    children: ReactNode;
}

export default function InfoRow({ icon, label, children }: InfoRowProps) {
    return (
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
            <Box
                sx={{
                    width: 40,
                    height: 40,
                    borderRadius: 2,
                    bgcolor: 'primary.main',
                    color: 'primary.contrastText',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    '& svg': { fontSize: 20 },
                }}
            >
                {icon}
            </Box>
            <Box sx={{ minWidth: 0 }}>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                    {label}
                </Typography>
                <Typography sx={{ wordBreak: 'break-word' }}>{children}</Typography>
            </Box>
        </Box>
    );
}

export function PriceRow({
    label,
    value,
    color,
    strong,
}: {
    label: string;
    value: string;
    color?: string;
    strong?: boolean;
}) {
    return (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, py: 0.75 }}>
            <Typography
                color={strong ? 'text.primary' : 'text.secondary'}
                fontWeight={strong ? 700 : 400}
                variant={strong ? 'h6' : 'body1'}
            >
                {label}
            </Typography>
            <Typography
                fontWeight={strong ? 700 : 500}
                variant={strong ? 'h6' : 'body1'}
                color={color ?? (strong ? 'primary' : 'text.primary')}
            >
                {value}
            </Typography>
        </Box>
    );
}
