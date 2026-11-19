import { Box, type SxProps, type Theme } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { color, font } from '@/theme/tokens';

interface LogoProps {
    // Route the logo links to. Omit for a plain (non-link) logo.
    to?: string;
    // Mark size in px.
    size?: number;
    // 'always' | 'never' | 'desktop' (hidden below the sm breakpoint).
    wordmark?: 'always' | 'never' | 'desktop';
    sx?: SxProps<Theme>;
}

export function LogoMark({ size = 28 }: { size?: number }) {
    return (
        <Box
            component="svg"
            viewBox="0 0 32 32"
            width={size}
            height={size}
            aria-hidden="true"
            sx={{ display: 'block', flex: 'none' }}
        >
            <path d="M16 2.5 27.7 9.25v13.5L16 29.5 4.3 22.75V9.25Z" fill={color.coral500} />
            <path
                d="M11.5 10.5v11M20.5 10.5v11M11.5 16h9"
                stroke="#fff"
                strokeWidth="2.6"
                strokeLinecap="round"
                fill="none"
            />
        </Box>
    );
}

/** HelpHive hexagon mark with the wordmark. The bee PNG in /public is the favicon only. */
export default function Logo({ to, size = 28, wordmark = 'always', sx }: LogoProps) {
    const linkProps = to ? { component: RouterLink, to, 'aria-label': 'HelpHive home' } : {};
    return (
        <Box
            {...linkProps}
            sx={[
                {
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 1.25,
                    color: color.ink900,
                    textDecoration: 'none',
                    fontWeight: 800,
                    fontSize: font.size.xl,
                    letterSpacing: font.tracking.head,
                    borderRadius: 1,
                    flex: 'none',
                },
                ...(Array.isArray(sx) ? sx : [sx]),
            ]}
        >
            <LogoMark size={size} />
            {wordmark !== 'never' && (
                <Box
                    component="span"
                    sx={
                        wordmark === 'desktop'
                            ? { display: { xs: 'none', sm: 'inline' } }
                            : undefined
                    }
                >
                    HelpHive
                </Box>
            )}
        </Box>
    );
}
