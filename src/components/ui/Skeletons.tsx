import type { ReactNode } from 'react';
import { Box, Skeleton } from '@mui/material';
import { color, hairline, layout, radius } from '@/theme/tokens';
import { srOnly } from './status';

function Busy({ label = 'Loading', children }: { label?: string; children: ReactNode }) {
    return (
        <Box role="status" aria-busy="true">
            <Box component="span" sx={srOnly}>
                {label}
            </Box>
            <Box aria-hidden="true">{children}</Box>
        </Box>
    );
}

const frame = {
    bgcolor: color.surface,
    border: hairline,
    borderRadius: `${radius.md}px`,
} as const;

function HeaderBlock() {
    return (
        <Box sx={{ mb: 3 }}>
            <Skeleton width={220} height={36} />
            <Skeleton width={320} sx={{ maxWidth: '80%' }} />
        </Box>
    );
}

function Rows({ rows }: { rows: number }) {
    return (
        <>
            {Array.from({ length: rows }, (_, i) => (
                <Box
                    key={i}
                    sx={{
                        display: 'grid',
                        gridTemplateColumns: '4px minmax(0, 1fr) auto',
                        gap: 2,
                        alignItems: 'center',
                        px: { xs: 2, sm: 2.5 },
                        py: 2,
                        borderTop: i === 0 ? 0 : hairline,
                    }}
                >
                    <Skeleton variant="rounded" width={4} height={36} />
                    <Box>
                        <Skeleton width="45%" />
                        <Skeleton width="70%" />
                    </Box>
                    <Skeleton variant="rounded" width={72} height={22} />
                </Box>
            ))}
        </>
    );
}

/** Rows inside a hairline panel, shaped like a booking or notification list. */
export function ListSkeleton({
    rows = 4,
    withHeader = true,
    label,
}: {
    rows?: number;
    withHeader?: boolean;
    label?: string;
}) {
    return (
        <Busy label={label}>
            <Box sx={frame}>
                {withHeader && (
                    <Box sx={{ px: { xs: 2, sm: 2.5 }, py: 2, borderBottom: hairline }}>
                        <Skeleton width={160} height={24} />
                    </Box>
                )}
                <Rows rows={rows} />
            </Box>
        </Busy>
    );
}

/** Generic page: title, a stat strip and two panels. Default Suspense fallback inside the shell. */
export function PageSkeleton({ label }: { label?: string }) {
    return (
        <Busy label={label}>
            <HeaderBlock />
            <Box
                sx={{
                    ...frame,
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(3, 1fr)' },
                    mb: 2.5,
                }}
            >
                {[0, 1, 2].map((i) => (
                    <Box
                        key={i}
                        sx={{
                            p: 2.5,
                            borderRight: { md: i < 2 ? hairline : 0 },
                            display: { xs: i === 2 ? 'none' : 'block', md: 'block' },
                        }}
                    >
                        <Skeleton width="50%" />
                        <Skeleton width="70%" height={40} />
                    </Box>
                ))}
            </Box>
            <Box
                sx={{
                    display: 'grid',
                    gap: 2.5,
                    gridTemplateColumns: { xs: '1fr', md: '1.35fr 1fr' },
                }}
            >
                <Box sx={frame}>
                    <Box sx={{ px: 2.5, py: 2, borderBottom: hairline }}>
                        <Skeleton width={140} height={24} />
                    </Box>
                    <Rows rows={3} />
                </Box>
                <Box sx={{ ...frame, p: 2.5 }}>
                    <Skeleton width={140} height={24} sx={{ mb: 2 }} />
                    <Skeleton variant="rounded" height={160} />
                </Box>
            </Box>
        </Busy>
    );
}

/** Detail page: title, summary strip, main column and a side summary. */
export function DetailSkeleton({ label }: { label?: string }) {
    return (
        <Busy label={label}>
            <HeaderBlock />
            <Box
                sx={{
                    display: 'grid',
                    gap: { xs: 2.5, md: 3 },
                    gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 1fr) 360px' },
                    alignItems: 'start',
                }}
            >
                <Box sx={{ display: 'grid', gap: 2.5 }}>
                    <Box sx={frame}>
                        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)' }}>
                            {[0, 1, 2, 3].map((i) => (
                                <Box key={i} sx={{ p: 2, borderRight: i < 3 ? hairline : 0 }}>
                                    <Skeleton width="60%" />
                                    <Skeleton width="80%" height={28} />
                                </Box>
                            ))}
                        </Box>
                        <Box sx={{ p: 2.5, borderTop: hairline }}>
                            <Skeleton variant="rounded" height={28} />
                        </Box>
                    </Box>
                    <Box sx={{ ...frame, p: 2.5 }}>
                        <Skeleton width={120} height={24} sx={{ mb: 1.5 }} />
                        <Skeleton />
                        <Skeleton width="85%" />
                        <Skeleton width="60%" />
                    </Box>
                </Box>
                <Box sx={{ ...frame, p: 2.5 }}>
                    <Skeleton width="50%" height={24} sx={{ mb: 1.5 }} />
                    {[0, 1, 2, 3].map((i) => (
                        <Skeleton key={i} height={28} />
                    ))}
                    <Skeleton variant="rounded" height={48} sx={{ mt: 2 }} />
                </Box>
            </Box>
        </Busy>
    );
}

/** Full-screen fallback before any layout has mounted: top bar plus PageSkeleton. */
export function AppSkeleton() {
    return (
        <Box sx={{ minHeight: '100vh', bgcolor: color.canvas }}>
            <Box
                sx={{
                    height: layout.topBarHeight,
                    bgcolor: color.surface,
                    borderBottom: hairline,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    px: { xs: 2, sm: 3 },
                }}
            >
                <Skeleton variant="rounded" width={28} height={28} />
                <Skeleton width={96} height={24} />
            </Box>
            <Box
                sx={{
                    maxWidth: layout.contentMaxWidth,
                    mx: 'auto',
                    px: { xs: 2, sm: 3, md: 4 },
                    py: { xs: 2.5, md: 4 },
                }}
            >
                <PageSkeleton />
            </Box>
        </Box>
    );
}
