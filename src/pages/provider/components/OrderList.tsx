import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
    Box,
    Button,
    Link,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
    useMediaQuery,
    useTheme,
} from '@mui/material';
import { CalendarTodayOutlined, LocationOnOutlined, ScheduleOutlined } from '@mui/icons-material';
import dayjs from 'dayjs';
import type { Booking } from '@/types';
import { formatMoney, getDisplayStatus, pluralHours } from '@/utils/format';
import { color, font, hairline } from '@/theme/tokens';
import { BookingStatusPill, ServiceIcon, srOnly } from '@/components/ui';
import { orderEarnings } from '../orderUtils';

interface OrderListProps {
    orders: Booking[];
    getLink: (bookingId: string) => string;
    /** Show each order's status. Open orders are all "scheduled", so they show a View button instead. */
    showStatus?: boolean;
    /** Accessible name for the table or list. */
    label: string;
}

function Meta({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
    return (
        <Stack
            direction="row"
            spacing={0.75}
            sx={{
                alignItems: 'center',
                minWidth: 0,
                color: color.ink600,
                fontSize: font.size.sm,
                '& svg': { fontSize: 16, color: color.ink500, flexShrink: 0 },
            }}
        >
            {icon}
            <Box
                component="span"
                sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
            >
                {children}
            </Box>
        </Stack>
    );
}

/** Phones and tablets: one stacked row per order, the whole row is the link. */
function StackedRows({ orders, getLink, showStatus, label }: OrderListProps) {
    return (
        <Box component="ul" aria-label={label} sx={{ listStyle: 'none', m: 0, p: 0 }}>
            {orders.map((order, i) => {
                const start = dayjs(order.startDate);
                return (
                    <Box component="li" key={order._id} sx={{ borderTop: i === 0 ? 0 : hairline }}>
                        <Box
                            component={RouterLink}
                            to={getLink(order._id)}
                            sx={{
                                display: 'grid',
                                gridTemplateColumns: 'auto minmax(0, 1fr) auto',
                                columnGap: 1.5,
                                alignItems: 'start',
                                px: { xs: 2, sm: 2.5 },
                                py: 2,
                                color: 'inherit',
                                textDecoration: 'none',
                                '&:hover': { bgcolor: color.subtle },
                            }}
                        >
                            <ServiceIcon serviceId={order.service?.id} variant="tile" size={36} />
                            <Box sx={{ minWidth: 0 }}>
                                <Typography variant="subtitle2" noWrap>
                                    {order.service?.name || 'Service'}
                                </Typography>
                                <Stack spacing={0.5} sx={{ mt: 0.5 }}>
                                    <Meta icon={<CalendarTodayOutlined />}>
                                        {start.format('ddd D MMM')}, {start.format('HH:mm')}
                                    </Meta>
                                    <Meta icon={<ScheduleOutlined />}>
                                        {pluralHours(order.hours)} at {formatMoney(order.rate)}/hr
                                    </Meta>
                                    <Meta icon={<LocationOnOutlined />}>{order.address}</Meta>
                                </Stack>
                            </Box>
                            <Stack spacing={0.75} sx={{ alignItems: 'flex-end' }}>
                                <Box
                                    sx={{
                                        fontSize: font.size.lg,
                                        fontWeight: 800,
                                        letterSpacing: font.tracking.head,
                                    }}
                                >
                                    {formatMoney(orderEarnings(order))}
                                </Box>
                                <Box sx={{ fontSize: font.size.xs, color: color.ink500 }}>
                                    You earn
                                </Box>
                                {showStatus && (
                                    <BookingStatusPill status={getDisplayStatus(order)} />
                                )}
                            </Stack>
                        </Box>
                    </Box>
                );
            })}
        </Box>
    );
}

/** Wide screens: a real table with the columns in the order date, hours, rate, total. */
function OrderTable({ orders, getLink, showStatus, label }: OrderListProps) {
    const navigate = useNavigate();
    return (
        <TableContainer>
            <Table aria-label={label}>
                <TableHead>
                    <TableRow>
                        <TableCell>Service</TableCell>
                        <TableCell>When</TableCell>
                        <TableCell align="right">Hours</TableCell>
                        <TableCell align="right">Rate</TableCell>
                        <TableCell align="right">You earn</TableCell>
                        <TableCell>Address</TableCell>
                        <TableCell align={showStatus ? 'left' : 'right'}>
                            {showStatus ? (
                                'Status'
                            ) : (
                                <Box component="span" sx={srOnly}>
                                    Actions
                                </Box>
                            )}
                        </TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {orders.map((order) => {
                        const start = dayjs(order.startDate);
                        const to = getLink(order._id);
                        return (
                            <TableRow
                                key={order._id}
                                hover
                                onClick={() => navigate(to)}
                                sx={{ cursor: 'pointer' }}
                            >
                                <TableCell>
                                    <Stack
                                        direction="row"
                                        spacing={1.25}
                                        sx={{ alignItems: 'center' }}
                                    >
                                        <ServiceIcon serviceId={order.service?.id} />
                                        <Link
                                            component={RouterLink}
                                            to={to}
                                            color="inherit"
                                            underline="hover"
                                            onClick={(e) => e.stopPropagation()}
                                            sx={{ fontWeight: 700, whiteSpace: 'nowrap' }}
                                        >
                                            {order.service?.name || 'Service'}
                                        </Link>
                                    </Stack>
                                </TableCell>
                                <TableCell sx={{ whiteSpace: 'nowrap' }}>
                                    {start.format('ddd D MMM')}, {start.format('HH:mm')}
                                </TableCell>
                                <TableCell align="right">{order.hours}</TableCell>
                                <TableCell align="right">{formatMoney(order.rate)}/hr</TableCell>
                                <TableCell align="right" sx={{ fontWeight: 700 }}>
                                    {formatMoney(orderEarnings(order))}
                                </TableCell>
                                <TableCell
                                    sx={{
                                        maxWidth: 220,
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap',
                                    }}
                                    title={order.address}
                                >
                                    {order.address}
                                </TableCell>
                                <TableCell align={showStatus ? 'left' : 'right'}>
                                    {showStatus ? (
                                        <BookingStatusPill status={getDisplayStatus(order)} />
                                    ) : (
                                        <Button
                                            component={RouterLink}
                                            to={to}
                                            size="small"
                                            variant="outlined"
                                            onClick={(e) => e.stopPropagation()}
                                            aria-label={`View ${order.service?.name ?? 'order'} on ${start.format('D MMM')}`}
                                        >
                                            View
                                        </Button>
                                    )}
                                </TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </TableContainer>
    );
}

/** Orders as a table at lg and up, stacked rows below. Render inside a flush Panel. */
export default function OrderList(props: OrderListProps) {
    const theme = useTheme();
    const wide = useMediaQuery(theme.breakpoints.up('lg'));
    return wide ? <OrderTable {...props} /> : <StackedRows {...props} />;
}
