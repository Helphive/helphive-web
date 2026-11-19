import { Box } from '@mui/material';
import { color } from '@/theme/tokens';
import { coralWash, dotsImage, fadeFrom, honeycombImage } from './backgrounds';

const layer = { position: 'absolute', inset: 0, pointerEvents: 'none' } as const;

/** Honeycomb lines fading out from a focal point, over a faint coral wash. */
export function HoneycombBackdrop({
    focus = '85% 25%',
    stroke = color.ink200,
}: {
    focus?: string;
    stroke?: string;
}) {
    return (
        <Box aria-hidden="true" sx={layer}>
            <Box sx={{ ...layer, backgroundImage: coralWash(focus), opacity: 0.55 }} />
            <Box
                sx={{
                    ...layer,
                    backgroundImage: honeycombImage(stroke),
                    backgroundSize: '55.4px 96px',
                    WebkitMaskImage: fadeFrom(focus),
                    maskImage: fadeFrom(focus),
                }}
            />
        </Box>
    );
}

/** Fine dot grid fading out from a focal point. */
export function DotsBackdrop({ focus = '100% 0%' }: { focus?: string }) {
    return (
        <Box
            aria-hidden="true"
            sx={{
                ...layer,
                backgroundImage: dotsImage(color.ink300),
                WebkitMaskImage: fadeFrom(focus),
                maskImage: fadeFrom(focus),
            }}
        />
    );
}
