import { Box } from '@mui/material';
import { Count } from '@/components/ui/StatusPill';

// Tab label with a small count pill.
export default function TabLabel({ label, count }: { label: string; count?: number }) {
    return (
        <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.75 }}>
            {label}
            {count !== undefined && <Count value={count} />}
        </Box>
    );
}
