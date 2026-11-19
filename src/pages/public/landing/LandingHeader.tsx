import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Box, Button, Divider, IconButton, Menu, MenuItem } from '@mui/material';
import { Close, Menu as MenuIcon } from '@mui/icons-material';
import { Logo } from '@/components/ui';
import { color, hairline, layout } from '@/theme/tokens';
import { NAV_LINKS, sectionGutter } from './constants';

export default function LandingHeader() {
    const [anchor, setAnchor] = useState<HTMLElement | null>(null);
    const open = Boolean(anchor);
    const close = () => setAnchor(null);

    return (
        <Box
            component="header"
            sx={{
                position: 'sticky',
                top: 0,
                zIndex: (theme) => theme.zIndex.appBar,
                bgcolor: color.surface,
                borderBottom: hairline,
            }}
        >
            <Box
                sx={{
                    maxWidth: layout.contentMaxWidth,
                    mx: 'auto',
                    px: sectionGutter,
                    height: 68,
                    display: 'flex',
                    alignItems: 'center',
                    gap: { xs: 1.5, md: 4 },
                }}
            >
                <Logo to="/" size={36} />
                <Box
                    component="nav"
                    aria-label="Main"
                    sx={{ display: { xs: 'none', md: 'flex' }, gap: 0.5, flex: 1 }}
                >
                    {NAV_LINKS.map((link) => (
                        <Button
                            key={link.href}
                            component="a"
                            href={link.href}
                            sx={{ color: color.ink600, '&:hover': { color: color.ink900 } }}
                        >
                            {link.label}
                        </Button>
                    ))}
                </Box>
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        ml: { xs: 'auto', md: 0 },
                    }}
                >
                    <Button
                        component={RouterLink}
                        to="/login"
                        sx={{ display: { xs: 'none', sm: 'inline-flex' } }}
                    >
                        Log in
                    </Button>
                    <Button component={RouterLink} to="/signup" variant="contained">
                        Book now
                    </Button>
                    <IconButton
                        aria-label={open ? 'Close menu' : 'Open menu'}
                        aria-haspopup="menu"
                        aria-expanded={open}
                        aria-controls="landing-menu"
                        onClick={(event) => (open ? close() : setAnchor(event.currentTarget))}
                        sx={{
                            display: { xs: 'inline-flex', md: 'none' },
                            width: 40,
                            height: 40,
                            border: `1px solid ${color.lineStrong}`,
                            borderRadius: 1,
                        }}
                    >
                        {open ? <Close /> : <MenuIcon />}
                    </IconButton>
                </Box>
            </Box>
            <Menu
                id="landing-menu"
                anchorEl={anchor}
                open={open}
                onClose={close}
                slotProps={{ paper: { sx: { minWidth: 220, mt: 1 } } }}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
                {NAV_LINKS.map((link) => (
                    <MenuItem key={link.href} component="a" href={link.href} onClick={close}>
                        {link.label}
                    </MenuItem>
                ))}
                <Divider />
                <MenuItem component={RouterLink} to="/login" onClick={close}>
                    Log in
                </MenuItem>
                <MenuItem component={RouterLink} to="/signup" onClick={close}>
                    Book now
                </MenuItem>
            </Menu>
        </Box>
    );
}
