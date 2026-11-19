import { Suspense, useState } from 'react';
import { Link as RouterLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
    AppBar,
    Avatar,
    Badge,
    Box,
    BottomNavigation,
    BottomNavigationAction,
    ButtonBase,
    Divider,
    IconButton,
    ListItemIcon,
    Menu,
    MenuItem,
    Toolbar,
    Typography,
    useMediaQuery,
    useTheme,
} from '@mui/material';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { selectCurrentUser, logout } from '@/features/auth/authSlice';
import { useLogoutMutation } from '@/features/auth/authApi';
import { isDemoEmail } from '@/features/auth/demoAccounts';
import NotificationBell from '@/features/notifications/NotificationBell';
import { useGetUnreadCountQuery } from '@/features/notifications/notificationsApi';
import { signOutChat } from '@/features/chat/chatBridge';
import '@/features/chat/chatPrewarm';
import { useChatUnread, useUnreadTitle } from '@/features/chat/chatUnread';
import MessagesButton from '@/features/chat/MessagesButton';
import { Count, ErrorBoundary, Logo, PageSkeleton } from '@/components/ui';
import { getInitials, getProfileImageUrl } from '@/utils/profileImage';
import { color, font, hairline, layout, radius } from '@/theme/tokens';
import {
    AvailableOrdersIcon,
    BookingsIcon,
    ChatIcon,
    EarningsIcon,
    ExpandIcon,
    HomeIcon,
    InfoIcon,
    LogoutIcon,
    NotificationsIcon,
    OrdersIcon,
    ProfileIcon,
    type AppIcon,
} from '@/components/ui/icons';

interface DashboardLayoutProps {
    userType: 'user' | 'provider';
}

interface NavItem {
    label: string;
    // Bottom-navigation label (phones).
    short: string;
    /** Regular weight; the active item switches to fill. */
    Icon: AppIcon;
    path: string;
    countsUnread?: boolean;
    /** Shows the unread chat count; on phones Messages is a top-bar button instead. */
    chat?: boolean;
}

const userNavItems: NavItem[] = [
    { label: 'Bookings', short: 'Bookings', Icon: BookingsIcon, path: '/user' },
    {
        label: 'Notifications',
        short: 'Inbox',
        Icon: NotificationsIcon,
        path: '/user/notifications',
        countsUnread: true,
    },
    { label: 'Messages', short: 'Messages', Icon: ChatIcon, path: '/user/messages', chat: true },
];

const providerNavItems: NavItem[] = [
    { label: 'Home', short: 'Home', Icon: HomeIcon, path: '/provider' },
    {
        label: 'Available orders',
        short: 'Available',
        Icon: AvailableOrdersIcon,
        path: '/provider/orders',
    },
    { label: 'My orders', short: 'My orders', Icon: OrdersIcon, path: '/provider/my-orders' },
    {
        label: 'Earnings',
        short: 'Earnings',
        Icon: EarningsIcon,
        path: '/provider/earnings',
    },
    {
        label: 'Messages',
        short: 'Messages',
        Icon: ChatIcon,
        path: '/provider/messages',
        chat: true,
    },
    {
        label: 'Notifications',
        short: 'Inbox',
        Icon: NotificationsIcon,
        path: '/provider/notifications',
        countsUnread: true,
    },
];

// A nav item is active on its own path and nested pages. Home is exact, plus the customer
// booking flow pages that live under it.
const HOME_CHILDREN = ['booking', 'payment'];
const isActivePath = (pathname: string, itemPath: string, homePath: string) => {
    const under = (p: string) => pathname === p || pathname.startsWith(`${p}/`);
    if (itemPath !== homePath) return under(itemPath);
    return pathname === homePath || HOME_CHILDREN.some((c) => under(`${homePath}/${c}`));
};

function SkipLink() {
    return (
        <Box
            component="a"
            href="#main"
            sx={{
                position: 'absolute',
                left: 8,
                top: -48,
                zIndex: 2000,
                px: 2,
                py: 1,
                borderRadius: `${radius.sm}px`,
                bgcolor: color.ink900,
                color: color.surface,
                fontWeight: 700,
                fontSize: font.size.md,
                textDecoration: 'none',
                '&:focus': { top: 8 },
            }}
        >
            Skip to content
        </Box>
    );
}

// Persistent strip under the top bar while a shared demo account is signed in.
function DemoNotice({ email }: { email?: string | null }) {
    if (!isDemoEmail(email)) return null;
    return (
        <Box
            role="note"
            aria-label="Demo account"
            className="no-print"
            sx={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: { md: 'center' },
                gap: 1,
                px: { xs: `${layout.gutter.xs}px`, sm: `${layout.gutter.sm}px` },
                py: 1,
                bgcolor: color.amber50,
                borderBottom: `1px solid ${color.amber200}`,
                color: color.amber700,
                fontSize: font.size.sm,
                fontWeight: 600,
                lineHeight: 1.45,
            }}
        >
            <InfoIcon sx={{ fontSize: 18, mt: '1px' }} />
            <span>
                You're using a shared demo account. Anyone can sign in to it, so don't enter real
                personal or payment details.
            </span>
        </Box>
    );
}

function useAccount(userType: 'user' | 'provider') {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const user = useAppSelector(selectCurrentUser);
    const [logoutApi] = useLogoutMutation();

    const handleLogout = async () => {
        try {
            // Chat signs out first (chat contract, sign-out order), then the server session.
            await signOutChat();
            const stored = localStorage.getItem('helphive-auth');
            if (stored) {
                const parsed = JSON.parse(stored);
                await logoutApi({ refreshToken: parsed.refreshToken }).unwrap();
            }
        } catch {
            // Ignore logout errors
        } finally {
            dispatch(logout());
            navigate('/login');
        }
    };

    const name = [user?.firstName, user?.lastName].filter(Boolean).join(' ') || 'Your account';
    return {
        user,
        name,
        initials: getInitials(user?.firstName, user?.lastName),
        avatarSrc: getProfileImageUrl(user?.profile),
        profilePath: `/${userType}/profile`,
        handleLogout,
    };
}

type Account = ReturnType<typeof useAccount>;

function AccountMenu({
    account,
    anchorEl,
    onClose,
    placement = 'below',
}: {
    account: Account;
    anchorEl: HTMLElement | null;
    onClose: () => void;
    placement?: 'below' | 'above';
}) {
    const navigate = useNavigate();
    const above = placement === 'above';
    return (
        <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={onClose}
            anchorOrigin={{
                horizontal: above ? 'left' : 'right',
                vertical: above ? 'top' : 'bottom',
            }}
            transformOrigin={{
                horizontal: above ? 'left' : 'right',
                vertical: above ? 'bottom' : 'top',
            }}
            slotProps={{ paper: { sx: { minWidth: 240, mt: above ? -1 : 0.5 } } }}
        >
            {/* role="group" keeps the menu's children valid; the name is in the button too. */}
            <Box
                component="li"
                role="group"
                aria-label={account.name}
                sx={{ px: 1.5, pt: 1, pb: 1.25 }}
            >
                <Typography variant="subtitle2" noWrap>
                    {account.name}
                </Typography>
                {account.user?.email && (
                    <Typography variant="caption" component="p" noWrap>
                        {account.user.email}
                    </Typography>
                )}
            </Box>
            <Divider sx={{ my: 0.5 }} />
            <MenuItem
                onClick={() => {
                    onClose();
                    navigate(account.profilePath);
                }}
            >
                <ListItemIcon>
                    <ProfileIcon />
                </ListItemIcon>
                Profile
            </MenuItem>
            <MenuItem
                onClick={() => {
                    onClose();
                    account.handleLogout();
                }}
            >
                <ListItemIcon>
                    <LogoutIcon />
                </ListItemIcon>
                Log out
            </MenuItem>
        </Menu>
    );
}

function AccountButton({ account }: { account: Account }) {
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
    return (
        <>
            <IconButton
                onClick={(e) => setAnchorEl(e.currentTarget)}
                aria-label={`Account menu for ${account.name}`}
                aria-haspopup="menu"
                aria-expanded={Boolean(anchorEl)}
                sx={{ borderRadius: '50%' }}
            >
                <Avatar src={account.avatarSrc} alt="" aria-hidden sx={{ width: 32, height: 32 }}>
                    {account.initials}
                </Avatar>
            </IconButton>
            <AccountMenu account={account} anchorEl={anchorEl} onClose={() => setAnchorEl(null)} />
        </>
    );
}

function Content({ maxWidth }: { maxWidth: number }) {
    const location = useLocation();
    return (
        <Box
            className="print-container"
            sx={{
                maxWidth,
                mx: 'auto',
                px: {
                    xs: `${layout.gutter.xs}px`,
                    sm: `${layout.gutter.sm}px`,
                    md: `${layout.gutter.md}px`,
                },
                py: { xs: 2.5, md: 4 },
            }}
        >
            <ErrorBoundary resetKey={location.pathname}>
                <Suspense fallback={<PageSkeleton />}>
                    <Outlet />
                </Suspense>
            </ErrorBoundary>
        </Box>
    );
}

/* ---------- Customer: top bar with section tabs ---------- */

function CustomerShell({ account, chatUnread }: { account: Account; chatUnread: number | null }) {
    const { pathname } = useLocation();
    const navItems = userNavItems.filter((item) => !item.chat || chatUnread !== null);
    const homePath = navItems[0].path;
    return (
        <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
            <SkipLink />
            <AppBar position="sticky" className="no-print">
                <Toolbar
                    sx={{
                        gap: { xs: 1, sm: 3 },
                        px: { xs: 2, sm: 3 },
                        maxWidth: layout.contentMaxWidth + 2 * layout.gutter.md,
                        width: '100%',
                        mx: 'auto',
                    }}
                    disableGutters
                >
                    <Logo to={homePath} wordmark="desktop" />
                    <Box
                        component="nav"
                        aria-label="Main"
                        sx={{
                            display: 'flex',
                            gap: 0.5,
                            flex: 1,
                            alignSelf: 'stretch',
                            overflowX: 'auto',
                            scrollbarWidth: 'none',
                        }}
                    >
                        {navItems.map((item) => {
                            const active = isActivePath(pathname, item.path, homePath);
                            return (
                                <Box
                                    key={item.path}
                                    component={RouterLink}
                                    to={item.path}
                                    aria-current={active ? 'page' : undefined}
                                    sx={{
                                        // Phones reach Messages from the top-bar button.
                                        display: item.chat ? { xs: 'none', sm: 'flex' } : 'flex',
                                        alignItems: 'center',
                                        px: 1.5,
                                        fontSize: font.size.md,
                                        fontWeight: 600,
                                        color: active ? color.ink900 : color.ink600,
                                        textDecoration: 'none',
                                        whiteSpace: 'nowrap',
                                        borderBottom: '2px solid',
                                        borderColor: active ? color.ink900 : 'transparent',
                                        borderTop: '2px solid transparent',
                                        '&:hover': { color: color.ink900 },
                                        '&:focus-visible': { outlineOffset: -2 },
                                    }}
                                >
                                    {item.label}
                                    {item.chat && !!chatUnread && (
                                        <Box sx={{ ml: 0.75 }}>
                                            <Count
                                                value={chatUnread}
                                                label={`${chatUnread} unread`}
                                            />
                                        </Box>
                                    )}
                                </Box>
                            );
                        })}
                    </Box>
                    {chatUnread !== null && (
                        <MessagesButton
                            to="/user/messages"
                            unread={chatUnread}
                            sx={{ display: { sm: 'none' } }}
                        />
                    )}
                    <NotificationBell area="user" />
                    <AccountButton account={account} />
                </Toolbar>
            </AppBar>
            <Box
                component="main"
                id="main"
                tabIndex={-1}
                className="print-main"
                sx={{ outline: 0 }}
            >
                <DemoNotice email={account.user?.email} />
                <Content maxWidth={layout.contentMaxWidth + 2 * layout.gutter.md} />
            </Box>
        </Box>
    );
}

/* ---------- Provider: sidebar on desktop, bottom navigation on phones ---------- */

function SideNav({
    account,
    unread,
    chatUnread,
}: {
    account: Account;
    unread: number;
    chatUnread: number | null;
}) {
    const { pathname } = useLocation();
    const homePath = providerNavItems[0].path;
    const sideItems = providerNavItems.filter((item) => !item.chat || chatUnread !== null);
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
    return (
        <Box
            component="aside"
            className="no-print"
            sx={{
                position: 'sticky',
                top: 0,
                height: '100vh',
                width: layout.sidebarWidth,
                flexShrink: 0,
                bgcolor: color.subtle,
                borderRight: hairline,
                display: 'flex',
                flexDirection: 'column',
                gap: 3,
                px: 1.5,
                pt: 2,
                pb: 1.5,
            }}
        >
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    pl: 1,
                }}
            >
                <Logo to={homePath} />
                <NotificationBell area="provider" />
            </Box>
            <Box component="nav" aria-label="Provider" sx={{ display: 'grid', gap: '2px' }}>
                {sideItems.map((item) => {
                    const active = isActivePath(pathname, item.path, homePath);
                    return (
                        <Box
                            key={item.path}
                            component={RouterLink}
                            to={item.path}
                            aria-current={active ? 'page' : undefined}
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1.5,
                                height: 38,
                                px: 1.5,
                                borderRadius: `${radius.sm}px`,
                                fontSize: font.size.md,
                                fontWeight: 600,
                                textDecoration: 'none',
                                color: active ? color.ink900 : color.ink600,
                                bgcolor: active ? color.surface : 'transparent',
                                boxShadow: active ? `inset 0 0 0 1px ${color.line}` : 'none',
                                '& svg': {
                                    fontSize: 20,
                                    color: active ? color.coral600 : 'inherit',
                                },
                                '&:hover': {
                                    bgcolor: active ? color.surface : color.canvas,
                                    color: color.ink900,
                                },
                            }}
                        >
                            <item.Icon weight={active ? 'fill' : 'regular'} />
                            {item.label}
                            {item.countsUnread && unread > 0 && (
                                <Box sx={{ ml: 'auto' }}>
                                    <Count value={unread} label={`${unread} unread`} />
                                </Box>
                            )}
                            {item.chat && !!chatUnread && (
                                <Box sx={{ ml: 'auto' }}>
                                    <Count value={chatUnread} label={`${chatUnread} unread`} />
                                </Box>
                            )}
                        </Box>
                    );
                })}
            </Box>
            <ButtonBase
                onClick={(e) => setAnchorEl(e.currentTarget)}
                aria-haspopup="menu"
                aria-expanded={Boolean(anchorEl)}
                sx={{
                    mt: 'auto',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    p: 1.5,
                    borderTop: hairline,
                    borderRadius: `${radius.sm}px`,
                    textAlign: 'left',
                    justifyContent: 'flex-start',
                    '&:hover': { bgcolor: color.canvas },
                }}
            >
                <Avatar src={account.avatarSrc} alt="" aria-hidden sx={{ width: 32, height: 32 }}>
                    {account.initials}
                </Avatar>
                <Box sx={{ minWidth: 0, flex: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 700 }} noWrap>
                        {account.name}
                    </Typography>
                    <Typography variant="caption" component="p" noWrap>
                        Provider account
                    </Typography>
                </Box>
                <ExpandIcon sx={{ fontSize: 18, color: color.ink500 }} />
            </ButtonBase>
            <AccountMenu
                account={account}
                anchorEl={anchorEl}
                onClose={() => setAnchorEl(null)}
                placement="above"
            />
        </Box>
    );
}

function ProviderShell({ account, chatUnread }: { account: Account; chatUnread: number | null }) {
    const theme = useTheme();
    const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
    const { pathname } = useLocation();
    const navigate = useNavigate();
    const { data: countData } = useGetUnreadCountQuery();
    const unread = countData?.unreadCount ?? 0;
    const homePath = providerNavItems[0].path;
    const phoneNavItems = providerNavItems.filter((item) => !item.chat);
    const navIndex = phoneNavItems.findIndex((item) => isActivePath(pathname, item.path, homePath));

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
            <SkipLink />
            {isDesktop && <SideNav account={account} unread={unread} chatUnread={chatUnread} />}
            <Box sx={{ flex: 1, minWidth: 0 }}>
                {!isDesktop && (
                    <AppBar position="sticky" className="no-print">
                        <Toolbar disableGutters sx={{ px: 2, gap: 1 }}>
                            <Logo to={homePath} />
                            <Box sx={{ flex: 1 }} />
                            {chatUnread !== null && (
                                <MessagesButton to="/provider/messages" unread={chatUnread} />
                            )}
                            <NotificationBell area="provider" />
                            <AccountButton account={account} />
                        </Toolbar>
                    </AppBar>
                )}
                <Box
                    component="main"
                    id="main"
                    tabIndex={-1}
                    className="print-main"
                    sx={{ outline: 0, pb: { xs: `${layout.bottomNavHeight}px`, md: 0 } }}
                >
                    <DemoNotice email={account.user?.email} />
                    <Content maxWidth={layout.contentMaxWidth + 2 * layout.gutter.md} />
                </Box>
            </Box>
            {!isDesktop && (
                <Box
                    component="nav"
                    aria-label="Provider"
                    className="no-print"
                    sx={{
                        position: 'fixed',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        zIndex: theme.zIndex.appBar,
                        borderTop: hairline,
                        backdropFilter: 'blur(8px)',
                        pb: 'env(safe-area-inset-bottom)',
                        bgcolor: 'rgba(255, 255, 255, 0.96)',
                    }}
                >
                    <BottomNavigation value={navIndex} showLabels sx={{ bgcolor: 'transparent' }}>
                        {phoneNavItems.map((item, index) => {
                            const icon = (
                                <item.Icon weight={index === navIndex ? 'fill' : 'regular'} />
                            );
                            return (
                                <BottomNavigationAction
                                    key={item.path}
                                    label={item.short}
                                    aria-current={index === navIndex ? 'page' : undefined}
                                    onClick={() => navigate(item.path)}
                                    icon={
                                        item.countsUnread && unread > 0 ? (
                                            <Badge badgeContent={unread} color="primary" max={99}>
                                                {icon}
                                            </Badge>
                                        ) : (
                                            icon
                                        )
                                    }
                                />
                            );
                        })}
                    </BottomNavigation>
                </Box>
            )}
        </Box>
    );
}

export default function DashboardLayout({ userType }: DashboardLayoutProps) {
    const account = useAccount(userType);
    // null: chat is not configured (503), so there is no Messages entry.
    const chatUnread = useChatUnread();
    useUnreadTitle(chatUnread);
    return userType === 'provider' ? (
        <ProviderShell account={account} chatUnread={chatUnread} />
    ) : (
        <CustomerShell account={account} chatUnread={chatUnread} />
    );
}
