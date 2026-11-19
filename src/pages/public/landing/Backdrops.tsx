import { Box } from '@mui/material';
import { color } from '@/theme/tokens';
import { coralWash, dotsImage, fadeFrom, honeycombImage, inkGlow } from './backgrounds';

const layer = { position: 'absolute', inset: 0, pointerEvents: 'none' } as const;

/** Honeycomb lines fading out from a focal point, over a faint coral wash. */
export function HoneycombBackdrop({
    focus = '85% 25%',
    stroke = color.ink200,
    wash = true,
}: {
    focus?: string;
    stroke?: string;
    wash?: boolean;
}) {
    return (
        <Box aria-hidden="true" sx={layer}>
            {wash && <Box sx={{ ...layer, backgroundImage: coralWash(focus), opacity: 0.55 }} />}
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
export function DotsBackdrop({
    focus = '100% 0%',
    fill = color.ink300,
}: {
    focus?: string;
    fill?: string;
}) {
    return (
        <Box
            aria-hidden="true"
            sx={{
                ...layer,
                backgroundImage: dotsImage(fill),
                WebkitMaskImage: fadeFrom(focus),
                maskImage: fadeFrom(focus),
            }}
        />
    );
}

/** The deep ink section's backdrop: honeycomb in a slightly lighter ink, lit by a coral glow. */
export function InkBackdrop({ focus = '85% 40%' }: { focus?: string }) {
    return (
        <Box aria-hidden="true" sx={layer}>
            <Box sx={{ ...layer, backgroundImage: inkGlow(focus) }} />
            <Box
                sx={{
                    ...layer,
                    backgroundImage: honeycombImage(color.ink700),
                    backgroundSize: '55.4px 96px',
                    opacity: 0.7,
                    WebkitMaskImage: fadeFrom(focus),
                    maskImage: fadeFrom(focus),
                }}
            />
        </Box>
    );
}
