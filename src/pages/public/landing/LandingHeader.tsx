import { useRef, useState, type MouseEvent } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Box, Button, Divider, IconButton, Menu, MenuItem } from '@mui/material';
import { Logo } from '@/components/ui';
import { color, font, layout } from '@/theme/tokens';
import { HEADER_HEIGHT, NAV_LINKS, sectionGutter } from './constants';
import { handleHashClick, scrollToSection, useActiveSection, useScrolled } from './motion';
import { CloseIcon, MenuIcon } from '@/components/ui/icons';

const SECTION_IDS = NAV_LINKS.map((link) => link.href.slice(1));

export default function LandingHeader() {
    const [anchor, setAnchor] = useState<HTMLElement | null>(null);
    const open = Boolean(anchor);
    const close = () => setAnchor(null);
    // Section picked from the phone menu; scrolled to once the menu has closed and released its scroll lock.
    const pending = useRef<string | null>(null);
    const scrolled = useScrolled();
    const active = useActiveSection(SECTION_IDS);

    return (
        <Box
            component="header"
            sx={{
                position: 'sticky',
                top: 0,
                zIndex: (theme) => theme.zIndex.appBar,
                // Transparent over the hero; a surface and hairline once the page scrolls.
                bgcolor: scrolled ? color.surface : 'transparent',
                boxShadow: scrolled ? `0 1px 0 ${color.line}` : 'none',
                transition: 'background-color 200ms ease, box-shadow 200ms ease',
                '@media (prefers-reduced-motion: reduce)': { transition: 'none' },
            }}
        >
            <Box
                sx={{
                    maxWidth: layout.contentMaxWidth,
                    mx: 'auto',
                    px: sectionGutter,
                    height: HEADER_HEIGHT,
                    display: 'flex',
                    alignItems: 'center',
                    gap: { xs: 1.5, md: 3 },
                }}
            >
                <Logo to="/" size={36} />
                <Box
                    component="nav"
                    aria-label="Main"
                    sx={{ display: { xs: 'none', md: 'flex' }, gap: 0.25, flex: 1 }}
                >
                    {NAV_LINKS.map((link) => {
                        const current = active === link.href.slice(1);
                        return (
                            <Button
                                key={link.href}
                                component="a"
                                href={link.href}
                                aria-current={current ? 'location' : undefined}
                                onClick={(event: MouseEvent<HTMLElement>) =>
                                    handleHashClick(event, link.href)
                                }
                                sx={{
                                    position: 'relative',
                                    px: 1.25,
                                    color: current ? color.ink900 : color.ink600,
                                    fontWeight: current ? font.weight.bold : font.weight.semibold,
                                    '&:hover': { color: color.ink900, bgcolor: 'transparent' },
                                    // Active marker: a short coral bar under the label.
                                    '&::after': {
                                        content: '""',
                                        position: 'absolute',
                                        left: 10,
                                        right: 10,
                                        bottom: 2,
                                        height: 2,
                                        borderRadius: 1,
                                        bgcolor: color.coral500,
                                        transform: current ? 'scaleX(1)' : 'scaleX(0)',
                                        transition: 'transform 200ms ease',
                                    },
                                    '@media (prefers-reduced-motion: reduce)': {
                                        '&::after': { transition: 'none' },
                                    },
                                }}
                            >
                                {link.label}
                            </Button>
                        );
                    })}
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
                            bgcolor: color.surface,
                            border: `1px solid ${color.lineStrong}`,
                            borderRadius: 1,
                        }}
                    >
                        {open ? <CloseIcon /> : <MenuIcon />}
                    </IconButton>
                </Box>
            </Box>
            <Menu
                id="landing-menu"
                anchorEl={anchor}
                open={open}
                onClose={close}
                TransitionProps={{
                    onExited: () => {
                        if (pending.current) scrollToSection(pending.current);
                        pending.current = null;
                    },
                }}
                slotProps={{ paper: { sx: { minWidth: 220, mt: 1 } } }}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
                {NAV_LINKS.map((link) => (
                    <MenuItem
                        key={link.href}
                        component="a"
                        href={link.href}
                        selected={active === link.href.slice(1)}
                        onClick={(event: MouseEvent<HTMLElement>) => {
                            event.preventDefault();
                            pending.current = link.href.slice(1);
                            close();
                        }}
                    >
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
