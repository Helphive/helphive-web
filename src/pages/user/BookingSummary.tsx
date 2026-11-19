import { Box, Button, CircularProgress, Stack, Typography } from '@mui/material';
import { LockOutlined } from '@mui/icons-material';
import type { Dayjs } from 'dayjs';
import { DataList, DataRow, Money, Panel, ServiceIcon } from '@/components/ui';
import { color, font, hairline } from '@/theme/tokens';
import { PLATFORM_FEE_RATE } from '@/utils/format';
import { usd0 } from './bookingForm';

interface BookingSummaryProps {
    serviceId: number | null;
    serviceName: string;
    start: Dayjs | null;
    address: string;
    rate: number;
    hours: number;
    /** What the customer still has to provide, in plain words. Empty when ready. */
    missing: string[];
    submitting: boolean;
    onSubmit: () => void;
}

const NOT_SET = (
    <Box component="span" sx={{ color: color.ink500, fontWeight: 500 }}>
        Not chosen yet
    </Box>
);

const ACTION_ID = 'booking-summary-action-hint';

function ActionButton({
    submitting,
    onSubmit,
    describedBy,
    fullWidth = true,
}: {
    submitting: boolean;
    onSubmit: () => void;
    describedBy?: string;
    fullWidth?: boolean;
}) {
    return (
        <Button
            variant="contained"
            size="large"
            fullWidth={fullWidth}
            onClick={onSubmit}
            disabled={submitting}
            aria-describedby={describedBy}
            startIcon={submitting ? <CircularProgress size={16} color="inherit" /> : undefined}
        >
            {submitting ? 'Creating booking' : 'Proceed to payment'}
        </Button>
    );
}

/** The booking summary: a panel in the page flow, plus a bar fixed to the bottom on phones. */
export default function BookingSummary({
    serviceId,
    serviceName,
    start,
    address,
    rate,
    hours,
    missing,
    submitting,
    onSubmit,
}: BookingSummaryProps) {
    const total = rate * hours;
    const hint = missing.length > 0 ? `Still needed: ${missing.join(', ')}.` : null;

    return (
        <>
            <Panel
                title="Booking summary"
                aria-label="Booking summary"
                sx={{ position: { md: 'sticky' }, top: { md: 24 } }}
            >
                <Stack spacing={2.5}>
                    <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                        <ServiceIcon serviceId={serviceId ?? undefined} variant="tile" />
                        <Typography variant="subtitle2" component="p">
                            {serviceName || 'No service chosen'}
                        </Typography>
                    </Stack>

                    <DataList
                        sx={{
                            '& > div': { py: 0.75 },
                        }}
                    >
                        <DataRow
                            label="Date"
                            value={start ? start.format('ddd D MMM YYYY') : NOT_SET}
                        />
                        <DataRow label="Start" value={start ? start.format('HH:mm') : NOT_SET} />
                        <DataRow label="Address" value={address || NOT_SET} />
                        <DataRow label="Rate" value={`${usd0(rate)}/hr`} />
                        <DataRow label="Hours" value={hours} />
                    </DataList>

                    <Box
                        sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'baseline',
                            borderTop: hairline,
                            pt: 2,
                        }}
                    >
                        <Typography variant="subtitle2" component="span">
                            Total
                        </Typography>
                        <Money amount={total} size="xl" />
                    </Box>

                    <Box sx={{ display: { xs: 'none', md: 'block' } }}>
                        <ActionButton
                            submitting={submitting}
                            onSubmit={onSubmit}
                            describedBy={hint ? ACTION_ID : undefined}
                        />
                        {hint && (
                            <Typography
                                id={ACTION_ID}
                                variant="caption"
                                component="p"
                                sx={{ mt: 1 }}
                            >
                                {hint}
                            </Typography>
                        )}
                    </Box>
                    <Stack
                        direction="row"
                        spacing={1}
                        sx={{ alignItems: 'flex-start', color: color.ink500 }}
                    >
                        <LockOutlined sx={{ fontSize: 16, mt: '2px' }} aria-hidden="true" />
                        <Typography variant="caption">
                            You pay on the next step with Stripe. A {PLATFORM_FEE_RATE * 100}%
                            platform fee is added there. The booking stays scheduled until a
                            provider accepts it.
                        </Typography>
                    </Stack>
                </Stack>
            </Panel>

            <Box
                className="no-print"
                sx={(theme) => ({
                    display: { xs: 'flex', md: 'none' },
                    position: 'fixed',
                    left: 0,
                    right: 0,
                    bottom: 0,
                    zIndex: theme.zIndex.appBar,
                    alignItems: 'center',
                    gap: 2,
                    px: 2,
                    pt: 1.5,
                    pb: 'max(12px, env(safe-area-inset-bottom))',
                    bgcolor: color.surface,
                    borderTop: hairline,
                })}
            >
                <Box sx={{ minWidth: 0, flex: 1 }}>
                    <Box
                        sx={{
                            fontSize: font.size.xl,
                            fontWeight: 800,
                            letterSpacing: font.tracking.head,
                            lineHeight: 1.2,
                        }}
                    >
                        <Money amount={total} />
                    </Box>
                    <Typography
                        id={`${ACTION_ID}-bar`}
                        variant="caption"
                        sx={{
                            display: 'block',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                        }}
                    >
                        {missing.length > 0
                            ? `Still needed: ${missing[0]}${missing.length > 1 ? ` and ${missing.length - 1} more` : ''}`
                            : `${hours} ${hours === 1 ? 'hour' : 'hours'} at ${usd0(rate)}/hr`}
                    </Typography>
                </Box>
                <ActionButton
                    fullWidth={false}
                    submitting={submitting}
                    onSubmit={onSubmit}
                    describedBy={`${ACTION_ID}-bar`}
                />
            </Box>
        </>
    );
}
