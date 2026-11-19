import type { ReactNode } from 'react';
import { Box } from '@mui/material';
import { color, font } from '@/theme/tokens';

interface InfoRowProps {
    icon: ReactNode;
    label: string;
    children: ReactNode;
}

// Icon, label above value. For plain label/value sets prefer DataList from '@/components/ui'.
export default function InfoRow({ icon, label, children }: InfoRowProps) {
    return (
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
            <Box
                aria-hidden="true"
                sx={{
                    width: 32,
                    height: 32,
                    borderRadius: 1,
                    bgcolor: color.canvas,
                    border: '1px solid',
                    borderColor: color.line,
                    color: color.ink600,
                    display: 'grid',
                    placeItems: 'center',
                    flexShrink: 0,
                    '& svg': { fontSize: 18 },
                }}
            >
                {icon}
            </Box>
            <Box sx={{ minWidth: 0 }}>
                <Box sx={{ fontSize: font.size.xs, fontWeight: 600, color: color.ink500 }}>
                    {label}
                </Box>
                <Box
                    sx={{
                        fontSize: font.size.md,
                        fontWeight: 600,
                        overflowWrap: 'anywhere',
                        fontVariantNumeric: 'tabular-nums',
                    }}
                >
                    {children}
                </Box>
            </Box>
        </Box>
    );
}

export function PriceRow({
    label,
    value,
    color: valueColor,
    strong,
}: {
    label: string;
    value: string;
    color?: string;
    strong?: boolean;
}) {
    return (
        <Box
            sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'baseline',
                gap: 2,
                py: 1,
                fontVariantNumeric: 'tabular-nums',
            }}
        >
            <Box
                sx={{
                    fontSize: font.size.md,
                    fontWeight: strong ? 700 : 500,
                    color: strong ? color.ink900 : color.ink500,
                }}
            >
                {label}
            </Box>
            <Box
                sx={{
                    color: valueColor ?? color.ink900,
                    ...(strong
                        ? {
                              fontSize: { xs: font.size['2xl'], sm: font.size['3xl'] },
                              fontWeight: 800,
                              letterSpacing: font.tracking.head,
                          }
                        : { fontSize: font.size.md, fontWeight: 600 }),
                }}
            >
                {value}
            </Box>
        </Box>
    );
}
