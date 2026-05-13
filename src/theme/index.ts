import { createTheme } from '@mui/material/styles';

export const colors = {
    primary: '#FF5740',
    primaryDark: '#D93D29',
    primarySoft: '#FFF0EC',
    ink: '#101828',
    body: '#475467',
    muted: '#667085',
    line: '#E4E7EC',
    canvas: '#F7F8FA',
    surface: '#FFFFFF',
    success: '#12B76A',
    warning: '#F79009',
    error: '#F04438',
    info: '#2563EB',
};

export const appTheme = createTheme({
    palette: {
        mode: 'light',
        primary: {
            main: colors.primary,
            dark: colors.primaryDark,
            light: '#FFAA9C',
            contrastText: '#FFFFFF',
        },
        secondary: {
            main: colors.ink,
            contrastText: '#FFFFFF',
        },
        error: {
            main: colors.error,
        },
        warning: {
            main: colors.warning,
        },
        success: {
            main: colors.success,
        },
        info: {
            main: colors.info,
        },
        background: {
            default: colors.canvas,
            paper: colors.surface,
        },
        text: {
            primary: colors.ink,
            secondary: colors.body,
        },
        divider: colors.line,
    },
    typography: {
        fontFamily:
            '"Plus Jakarta Sans", Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        h1: {
            fontSize: 'clamp(3rem, 7vw, 5.75rem)',
            lineHeight: 0.95,
            fontWeight: 800,
            letterSpacing: 0,
        },
        h2: {
            fontSize: 'clamp(2.5rem, 5vw, 4.5rem)',
            lineHeight: 1,
            fontWeight: 800,
            letterSpacing: 0,
        },
        h3: {
            fontSize: 'clamp(2rem, 3vw, 3rem)',
            lineHeight: 1.08,
            fontWeight: 800,
            letterSpacing: 0,
        },
        h4: {
            fontSize: 'clamp(1.6rem, 2vw, 2.25rem)',
            lineHeight: 1.15,
            fontWeight: 800,
            letterSpacing: 0,
        },
        h5: {
            fontSize: '1.35rem',
            lineHeight: 1.25,
            fontWeight: 750,
            letterSpacing: 0,
        },
        h6: {
            fontSize: '1rem',
            lineHeight: 1.35,
            fontWeight: 750,
            letterSpacing: 0,
        },
        body1: {
            fontSize: '1rem',
            lineHeight: 1.65,
            fontWeight: 500,
            letterSpacing: 0,
        },
        body2: {
            fontSize: '0.9rem',
            lineHeight: 1.55,
            fontWeight: 500,
            letterSpacing: 0,
        },
        button: {
            textTransform: 'none',
            fontWeight: 750,
            letterSpacing: 0,
        },
    },
    shape: {
        borderRadius: 8,
    },
    shadows: [
        'none',
        '0 1px 2px rgba(16, 24, 40, 0.05)',
        '0 2px 8px rgba(16, 24, 40, 0.06)',
        '0 6px 18px rgba(16, 24, 40, 0.07)',
        '0 12px 32px rgba(16, 24, 40, 0.08)',
        '0 18px 48px rgba(16, 24, 40, 0.10)',
        '0 24px 64px rgba(16, 24, 40, 0.12)',
        '0 28px 72px rgba(16, 24, 40, 0.14)',
        ...Array(17).fill('0 28px 72px rgba(16, 24, 40, 0.14)'),
    ] as unknown as import('@mui/material/styles').Shadows,
    components: {
        MuiCssBaseline: {
            styleOverrides: {
                body: {
                    backgroundColor: colors.canvas,
                    color: colors.ink,
                },
                '::selection': {
                    backgroundColor: '#FFD8D0',
                    color: colors.ink,
                },
            },
        },
        MuiButton: {
            defaultProps: {
                disableElevation: true,
            },
            styleOverrides: {
                root: {
                    borderRadius: 8,
                    minHeight: 44,
                    padding: '10px 20px',
                    boxShadow: 'none',
                },
                containedPrimary: {
                    background: `linear-gradient(135deg, ${colors.primary} 0%, #FF7A66 100%)`,
                    '&:hover': {
                        background: `linear-gradient(135deg, ${colors.primaryDark} 0%, ${colors.primary} 100%)`,
                        boxShadow: '0 12px 28px rgba(255, 87, 64, 0.28)',
                    },
                },
                outlined: {
                    borderColor: colors.line,
                    color: colors.ink,
                    backgroundColor: '#FFFFFF',
                    '&:hover': {
                        borderColor: colors.primary,
                        backgroundColor: colors.primarySoft,
                    },
                },
            },
        },
        MuiCard: {
            defaultProps: {
                elevation: 0,
            },
            styleOverrides: {
                root: {
                    borderRadius: 8,
                    border: `1px solid ${colors.line}`,
                    boxShadow: '0 1px 2px rgba(16, 24, 40, 0.05)',
                    backgroundImage: 'none',
                },
            },
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    borderRadius: 8,
                    backgroundImage: 'none',
                },
            },
        },
        MuiTextField: {
            defaultProps: {
                variant: 'outlined',
            },
            styleOverrides: {
                root: {
                    '& .MuiOutlinedInput-root': {
                        borderRadius: 8,
                        backgroundColor: '#FFFFFF',
                    },
                    '& .MuiInputLabel-root': {
                        fontWeight: 650,
                    },
                },
            },
        },
        MuiChip: {
            styleOverrides: {
                root: {
                    borderRadius: 8,
                    fontWeight: 700,
                },
            },
        },
        MuiTabs: {
            styleOverrides: {
                root: {
                    minHeight: 48,
                },
                indicator: {
                    height: 3,
                    borderRadius: 3,
                },
            },
        },
        MuiTab: {
            styleOverrides: {
                root: {
                    textTransform: 'none',
                    fontWeight: 750,
                    minHeight: 48,
                },
            },
        },
        MuiTableCell: {
            styleOverrides: {
                head: {
                    color: colors.body,
                    fontWeight: 800,
                    backgroundColor: '#F9FAFB',
                },
            },
        },
    },
});

export const lightTheme = appTheme;
export const darkTheme = appTheme;
