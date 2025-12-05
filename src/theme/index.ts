import { createTheme, ThemeOptions } from '@mui/material/styles';

// Colors matching mobile app theme
const colors = {
    primary: '#FF5740',
    primaryContainer: '#fcd6cc',
    bodyColor: {
        light: '#667085',
        dark: '#626262',
    },
    background: {
        light: '#FFFFFF',
        dark: '#1D1B1E',
    },
    surface: {
        light: '#FFFFFF',
        dark: '#1D1B1E',
    },
    success: '#71BF74',
    warning: '#FEC84B',
    error: '#F6564A',
    buttonText: '#FFFFFF',
    placeholder: '#C6C6C6',
    outline: '#667085',
    onBackground: '#475467',
};

const baseTheme: ThemeOptions = {
    typography: {
        fontFamily: '"Plus Jakarta Sans", -apple-system, BlinkMacSystemFont, sans-serif',
        h1: {
            fontSize: '2.5rem',
            fontWeight: 700,
        },
        h2: {
            fontSize: '2rem',
            fontWeight: 700,
        },
        h3: {
            fontSize: '1.75rem',
            fontWeight: 600,
        },
        h4: {
            fontSize: '1.5rem',
            fontWeight: 600,
        },
        h5: {
            fontSize: '1.25rem',
            fontWeight: 600,
        },
        h6: {
            fontSize: '1rem',
            fontWeight: 600,
        },
        body1: {
            fontSize: '1rem',
            fontWeight: 400,
        },
        body2: {
            fontSize: '0.875rem',
            fontWeight: 400,
        },
        button: {
            textTransform: 'none',
            fontWeight: 600,
        },
    },
    shape: {
        borderRadius: 8,
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: 8,
                    padding: '10px 24px',
                    fontSize: '1rem',
                    fontWeight: 600,
                },
                contained: {
                    boxShadow: 'none',
                    '&:hover': {
                        boxShadow: 'none',
                    },
                },
            },
        },
        MuiTextField: {
            styleOverrides: {
                root: {
                    '& .MuiOutlinedInput-root': {
                        borderRadius: 8,
                    },
                },
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    borderRadius: 12,
                    boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.08)',
                },
            },
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    borderRadius: 12,
                },
            },
        },
        MuiChip: {
            styleOverrides: {
                root: {
                    borderRadius: 8,
                },
            },
        },
    },
};

export const lightTheme = createTheme({
    ...baseTheme,
    palette: {
        mode: 'light',
        primary: {
            main: colors.primary,
            contrastText: colors.buttonText,
        },
        secondary: {
            main: '#665A6F',
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
        background: {
            default: '#F8F9FA',
            paper: colors.background.light,
        },
        text: {
            primary: colors.onBackground,
            secondary: colors.bodyColor.light,
        },
        divider: '#E9DFE8',
    },
});

export const darkTheme = createTheme({
    ...baseTheme,
    palette: {
        mode: 'dark',
        primary: {
            main: colors.primary,
            contrastText: colors.buttonText,
        },
        secondary: {
            main: '#D0C1DA',
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
        background: {
            default: colors.background.dark,
            paper: '#272329',
        },
        text: {
            primary: '#E7E1E5',
            secondary: colors.bodyColor.dark,
        },
        divider: '#4A454E',
    },
});

export { colors };
