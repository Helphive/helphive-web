import { Box } from '@mui/material';

// Tab label with a small count pill.
export default function TabLabel({ label, count }: { label: string; count?: number }) {
    return (
        <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1 }}>
            {label}
            {count !== undefined && (
                <Box
                    component="span"
                    sx={{
                        minWidth: 22,
                        px: 0.75,
                        py: 0.125,
                        borderRadius: 10,
                        bgcolor: 'action.hover',
                        fontSize: 12,
                        fontWeight: 700,
                        lineHeight: '18px',
                    }}
                >
                    {count}
                </Box>
            )}
        </Box>
    );
}
