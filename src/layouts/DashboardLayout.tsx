import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
    Box,
    AppBar,
    Toolbar,
    Typography,
    IconButton,
    Drawer,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Avatar,
    Menu,
    MenuItem,
    Divider,
    useTheme,
    useMediaQuery,
    BottomNavigation,
    BottomNavigationAction,
    Paper,
    Container,
} from '@mui/material';
import {
    Menu as MenuIcon,
    Home as HomeIcon,
    CalendarMonth as BookingsIcon,
    Work as OrdersIcon,
    AccountBalanceWallet as EarningsIcon,
    Person as ProfileIcon,
    Logout as LogoutIcon,
    DarkMode as DarkModeIcon,
    LightMode as LightModeIcon,
} from '@mui/icons-material';
import { useTheme as useAppTheme } from '@/theme/ThemeContext';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { selectCurrentUser, logout } from '@/features/auth/authSlice';
import { useLogoutMutation } from '@/features/auth/authApi';

interface DashboardLayoutProps {
    userType: 'user' | 'provider';
}

const DRAWER_WIDTH = 260;

const userNavItems = [
    { label: 'Home', icon: <HomeIcon />, path: '/user' },
    { label: 'Bookings', icon: <BookingsIcon />, path: '/user/bookings' },
    { label: 'Profile', icon: <ProfileIcon />, path: '/user/profile' },
];

const providerNavItems = [
    { label: 'Home', icon: <HomeIcon />, path: '/provider' },
    { label: 'Available Orders', icon: <OrdersIcon />, path: '/provider/orders' },
    { label: 'My Orders', icon: <BookingsIcon />, path: '/provider/my-orders' },
    { label: 'Earnings', icon: <EarningsIcon />, path: '/provider/earnings' },
];

export default function DashboardLayout({ userType }: DashboardLayoutProps) {
    const theme = useTheme();
    const { mode, toggleTheme } = useAppTheme();
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useAppDispatch();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    const user = useAppSelector(selectCurrentUser);
    const [logoutApi] = useLogoutMutation();

    const [drawerOpen, setDrawerOpen] = useState(false);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

    const navItems = userType === 'user' ? userNavItems : providerNavItems;

    const handleLogout = async () => {
        try {
            const refreshToken = localStorage.getItem('helphive-auth');
            if (refreshToken) {
                const parsed = JSON.parse(refreshToken);
                await logoutApi({ refreshToken: parsed.refreshToken }).unwrap();
            }
        } catch {
            // Ignore logout errors
        } finally {
            dispatch(logout());
            navigate('/login');
        }
    };

    const getCurrentNavIndex = () => {
        const index = navItems.findIndex((item) => location.pathname === item.path);
        return index >= 0 ? index : 0;
    };

    const drawer = (
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Toolbar sx={{ justifyContent: 'center', py: 2, gap: 1 }}>
                <Box
                    component="img"
                    src="/logo.png"
                    alt="HelpHive"
                    sx={{ height: 36 }}
                />
                <Typography variant="h5" fontWeight={700} color="primary">
                    HelpHive
                </Typography>
            </Toolbar>
            <Divider />
            <List sx={{ flex: 1, px: 2, py: 2 }}>
                {navItems.map((item) => (
                    <ListItem key={item.path} disablePadding sx={{ mb: 1 }}>
                        <ListItemButton
                            selected={location.pathname === item.path}
                            onClick={() => {
                                navigate(item.path);
                                setDrawerOpen(false);
                            }}
                            sx={{
                                borderRadius: 2,
                                '&.Mui-selected': {
                                    bgcolor: 'primary.main',
                                    color: 'white',
                                    '&:hover': {
                                        bgcolor: 'primary.dark',
                                    },
                                    '& .MuiListItemIcon-root': {
                                        color: 'white',
                                    },
                                },
                            }}
                        >
                            <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
                            <ListItemText primary={item.label} />
                        </ListItemButton>
                    </ListItem>
                ))}
            </List>
            <Divider />
            <List sx={{ px: 2, py: 2 }}>
                <ListItem disablePadding>
                    <ListItemButton onClick={toggleTheme} sx={{ borderRadius: 2 }}>
                        <ListItemIcon sx={{ minWidth: 40 }}>
                            {mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
                        </ListItemIcon>
                        <ListItemText primary={mode === 'dark' ? 'Light Mode' : 'Dark Mode'} />
                    </ListItemButton>
                </ListItem>
                <ListItem disablePadding sx={{ mt: 1 }}>
                    <ListItemButton
                        onClick={handleLogout}
                        sx={{ borderRadius: 2, color: 'error.main' }}
                    >
                        <ListItemIcon sx={{ minWidth: 40, color: 'error.main' }}>
                            <LogoutIcon />
                        </ListItemIcon>
                        <ListItemText primary="Logout" />
                    </ListItemButton>
                </ListItem>
            </List>
        </Box>
    );

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh' }}>
            {/* App Bar */}
            <AppBar
                position="fixed"
                elevation={0}
                sx={{
                    width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
                    ml: { md: `${DRAWER_WIDTH}px` },
                    bgcolor: 'background.paper',
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                }}
            >
                <Toolbar>
                    {isMobile && (
                        <IconButton
                            edge="start"
                            onClick={() => setDrawerOpen(true)}
                            sx={{ mr: 2 }}
                        >
                            <MenuIcon />
                        </IconButton>
                    )}
                    <Box sx={{ flex: 1 }} />
                    <IconButton onClick={(e) => setAnchorEl(e.currentTarget)}>
                        <Avatar
                            src={user?.profile}
                            sx={{ width: 36, height: 36, bgcolor: 'primary.main' }}
                        >
                            {user?.firstName?.[0]}
                        </Avatar>
                    </IconButton>
                    <Menu
                        anchorEl={anchorEl}
                        open={Boolean(anchorEl)}
                        onClose={() => setAnchorEl(null)}
                        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                    >
                        <MenuItem disabled>
                            <Typography variant="body2">
                                {user?.firstName} {user?.lastName}
                            </Typography>
                        </MenuItem>
                        <Divider />
                        <MenuItem onClick={toggleTheme}>
                            {mode === 'dark' ? <LightModeIcon sx={{ mr: 1 }} /> : <DarkModeIcon sx={{ mr: 1 }} />}
                            {mode === 'dark' ? 'Light Mode' : 'Dark Mode'}
                        </MenuItem>
                        <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
                            <LogoutIcon sx={{ mr: 1 }} />
                            Logout
                        </MenuItem>
                    </Menu>
                </Toolbar>
            </AppBar>

            {/* Side Drawer - Desktop */}
            {!isMobile && (
                <Drawer
                    variant="permanent"
                    sx={{
                        width: DRAWER_WIDTH,
                        flexShrink: 0,
                        '& .MuiDrawer-paper': {
                            width: DRAWER_WIDTH,
                            boxSizing: 'border-box',
                            borderRight: '1px solid',
                            borderColor: 'divider',
                        },
                    }}
                >
                    {drawer}
                </Drawer>
            )}

            {/* Side Drawer - Mobile */}
            <Drawer
                variant="temporary"
                open={drawerOpen}
                onClose={() => setDrawerOpen(false)}
                ModalProps={{ keepMounted: true }}
                sx={{
                    display: { xs: 'block', md: 'none' },
                    '& .MuiDrawer-paper': {
                        width: DRAWER_WIDTH,
                        boxSizing: 'border-box',
                    },
                }}
            >
                {drawer}
            </Drawer>

            {/* Main Content */}
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
                    minHeight: '100vh',
                    bgcolor: 'background.default',
                    pb: { xs: 8, md: 0 },
                }}
            >
                <Toolbar />
                <Container maxWidth="xl" sx={{ py: { xs: 2, sm: 3 }, px: { xs: 2, sm: 3 } }}>
                    <Outlet />
                </Container>
            </Box>

            {/* Bottom Navigation - Mobile */}
            {isMobile && (
                <Paper
                    sx={{
                        position: 'fixed',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        zIndex: 1000,
                    }}
                    elevation={3}
                >
                    <BottomNavigation
                        value={getCurrentNavIndex()}
                        onChange={(_, newValue) => {
                            navigate(navItems[newValue].path);
                        }}
                        showLabels
                    >
                        {navItems.map((item) => (
                            <BottomNavigationAction
                                key={item.path}
                                label={item.label}
                                icon={item.icon}
                            />
                        ))}
                    </BottomNavigation>
                </Paper>
            )}
        </Box>
    );
}
