import { Box } from '@mui/material';
import { color, inDark, rawColor } from '@/theme/tokens';
import { useColorScheme } from '@/theme/colorScheme';
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
    const { scheme } = useColorScheme();
    return (
        <Box aria-hidden="true" sx={layer}>
            {wash && (
                <Box
                    sx={{
                        ...layer,
                        backgroundImage: coralWash(focus),
                        opacity: 0.55,
                        // A deep coral glow reads as a stain on dark; keep it faint.
                        ...inDark({ opacity: 0.3 }),
                    }}
                />
            )}
            <Box
                sx={{
                    ...layer,
                    backgroundImage: honeycombImage(rawColor(stroke, scheme)),
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
    const { scheme } = useColorScheme();
    return (
        <Box
            aria-hidden="true"
            sx={{
                ...layer,
                backgroundImage: dotsImage(rawColor(fill, scheme)),
                WebkitMaskImage: fadeFrom(focus),
                maskImage: fadeFrom(focus),
            }}
        />
    );
}

/** The deep ink section's backdrop: honeycomb in a slightly lighter ink, lit by a coral glow. */
export function InkBackdrop({ focus = '85% 40%' }: { focus?: string }) {
    const { scheme } = useColorScheme();
    // The band is ink on light and the deepest layer on dark; its hexagons sit just above it in both.
    const stroke = scheme === 'dark' ? color.lineStrong : color.ink700;
    return (
        <Box aria-hidden="true" sx={layer}>
            <Box sx={{ ...layer, backgroundImage: inkGlow(focus) }} />
            <Box
                sx={{
                    ...layer,
                    backgroundImage: honeycombImage(rawColor(stroke, scheme)),
                    backgroundSize: '55.4px 96px',
                    opacity: 0.7,
                    WebkitMaskImage: fadeFrom(focus),
                    maskImage: fadeFrom(focus),
                }}
            />
        </Box>
    );
}
