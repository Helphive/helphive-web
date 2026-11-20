import { useMemo, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Alert,
    Box,
    Button,
    FormHelperText,
    IconButton,
    Slider,
    Stack,
    ToggleButton,
    Typography,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { type Dayjs } from 'dayjs';
import LocationPicker from '@/components/location/LocationPicker';
import {
    bookingLocationFields,
    displayText,
    type PickedLocation,
} from '@/features/places/pickedLocation';
import {
    Panel,
    SelectableTileGroup,
    ServiceIcon,
    ShiftRuler,
    StepProgress,
    srOnly,
} from '@/components/ui';
import { useSnackbar } from '@/components/feedback/snackbarContext';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
    selectBookingFormData,
    setFormData,
    setPaymentInfo,
    resetBookingForm,
} from '@/features/booking/bookingSlice';
import { useCreateBookingMutation, useGetUserBookingsQuery } from '@/features/booking/bookingApi';
import { SERVICES } from '@/types';
import { color, font } from '@/theme/tokens';
import { getErrorMessage } from '@/utils/format';
import BookingSummary from './BookingSummary';
import {
    FLOW_STEPS,
    HOUR_LIMITS,
    QUICK_TIMES,
    RATE_LIMITS,
    combineStart,
    getDayOptions,
    isValidDate,
    timeFromLabel,
    usd0,
    validateFlow,
} from './bookingForm';
import { AddIcon, CheckMarkIcon, RemoveIcon } from '@/components/ui/icons';

const OTHER = 'other';

function SectionMark({ done, index }: { done: boolean; index: number }) {
    return (
        <Box
            component="span"
            sx={{
                width: 22,
                height: 22,
                borderRadius: '50%',
                display: 'inline-grid',
                placeItems: 'center',
                flexShrink: 0,
                fontSize: font.size.xs,
                fontWeight: 700,
                bgcolor: done ? color.inkFill : 'transparent',
                color: done ? color.onInk : color.ink500,
                border: done ? 0 : `1.5px solid ${color.lineStrong}`,
            }}
        >
            {done ? <CheckMarkIcon weight="bold" sx={{ fontSize: 14 }} /> : index}
        </Box>
    );
}

function FlowSection({
    id,
    index,
    title,
    done,
    children,
}: {
    id: string;
    index: number;
    title: string;
    done: boolean;
    children: ReactNode;
}) {
    return (
        <Panel
            id={id}
            title={
                <Stack direction="row" spacing={1.25} sx={{ alignItems: 'center' }}>
                    <SectionMark done={done} index={index} />
                    <Box component="span" sx={{ position: 'relative' }}>
                        {title}
                        {done && (
                            <Box component="span" sx={srOnly}>
                                , done
                            </Box>
                        )}
                    </Box>
                </Stack>
            }
            sx={{ scrollMarginTop: 80 }}
        >
            {children}
        </Panel>
    );
}

function FieldLabel({ id, children }: { id: string; children: ReactNode }) {
    return (
        <Typography id={id} variant="caption" component="p" sx={{ mb: 1 }}>
            {children}
        </Typography>
    );
}

export default function BookingFlow() {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const snackbar = useSnackbar();
    const formData = useAppSelector(selectBookingFormData);
    const [createBooking, { isLoading: isCreating }] = useCreateBookingMutation();

    const [date, setDate] = useState<Dayjs | null>(null);
    const [time, setTime] = useState<Dayjs | null>(null);
    const [otherDate, setOtherDate] = useState(false);
    const [otherTime, setOtherTime] = useState(false);
    const [showErrors, setShowErrors] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);

    const days = useMemo(() => getDayOptions(), []);
    const location = formData.location ?? null;
    // The map opens at the customer's last booking when there is no pin yet.
    const { data: pastBookings } = useGetUserBookingsQuery();
    const startPoint = useMemo(() => {
        const all = pastBookings
            ? [...pastBookings.active, ...pastBookings.scheduled, ...pastBookings.history]
            : [];
        const last = all
            .filter((b) => b.latitude && b.longitude)
            .sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0];
        return last ? { latitude: last.latitude, longitude: last.longitude } : null;
    }, [pastBookings]);
    const setLocation = (loc: PickedLocation | null) =>
        dispatch(
            setFormData({
                location: loc,
                address: displayText(loc),
                latitude: loc?.latitude ?? null,
                longitude: loc?.longitude ?? null,
            })
        );

    const errors = validateFlow({
        serviceId: formData.serviceId,
        date,
        time,
        address: displayText(location),
        pinned: !!location,
    });
    // Before the first submit only the "time has passed" message shows, and only once a time exists.
    const visible = (key: keyof typeof errors) =>
        showErrors || (key === 'time' && time && date && errors.time?.includes('passed'))
            ? errors[key]
            : undefined;

    const serviceDone = !errors.service;
    const dateTimeDone = !errors.date && !errors.time;
    // Hours and rate always have valid defaults, so the section counts as done once the shift is set.
    const hoursDone = dateTimeDone;
    const addressDone = !errors.address;
    const steps = [serviceDone, dateTimeDone, hoursDone, addressDone];
    const current = steps.indexOf(false) === -1 ? FLOW_STEPS.length - 1 : steps.indexOf(false);

    const missing = [
        errors.service && 'a service',
        (errors.date || errors.time) && 'a start time',
        errors.address && 'an address',
    ].filter((m): m is string => !!m);

    const start = combineStart(date, time);
    const dateKey = isValidDate(date) ? date.format('YYYY-MM-DD') : null;
    const timeKey = isValidDate(time) ? time.format('HH:mm') : null;
    const inQuickDays = !!dateKey && days.some((d) => d.format('YYYY-MM-DD') === dateKey);
    const showDatePicker = otherDate || (!!date && !inQuickDays);
    const showTimePicker =
        otherTime || (!!timeKey && !(QUICK_TIMES as readonly string[]).includes(timeKey));
    const timeValue = showTimePicker
        ? OTHER
        : timeKey && (QUICK_TIMES as readonly string[]).includes(timeKey)
          ? timeKey
          : null;

    const handleSubmit = async () => {
        if (missing.length > 0 || errors.date || errors.time) {
            setShowErrors(true);
            const target = errors.service
                ? 'flow-service'
                : errors.date || errors.time
                  ? 'flow-when'
                  : 'flow-address';
            document.getElementById(target)?.scrollIntoView({ block: 'start' });
            return;
        }
        if (!formData.serviceId || !date || !time || !start || !location) return;

        try {
            setSubmitError(null);
            const result = await createBooking({
                service: formData.serviceId,
                rate: formData.rate,
                hours: formData.hours,
                startAt: start.toISOString(),
                startDate: date.toISOString(),
                startTime: time.toISOString(),
                ...bookingLocationFields(location),
            }).unwrap();

            dispatch(
                setPaymentInfo({
                    paymentIntentId: result.paymentIntentId,
                    clientSecret: result.clientSecret,
                })
            );

            navigate('/user/payment');
        } catch (err) {
            const message = getErrorMessage(err, 'Could not create the booking. Try again.');
            setSubmitError(message);
            snackbar.error(message);
        }
    };

    const handleClear = () => {
        dispatch(resetBookingForm());
        setDate(null);
        setTime(null);
        setOtherDate(false);
        setOtherTime(false);
        setShowErrors(false);
        setSubmitError(null);
    };

    const endLabel = start ? start.add(formData.hours, 'hour').format('HH:mm') : '';

    return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <StepProgress
                aria-label="Booking steps"
                steps={FLOW_STEPS}
                current={current}
                sx={{ mb: 2.5 }}
            />

            {submitError && (
                <Alert severity="error" sx={{ mb: 2.5 }} onClose={() => setSubmitError(null)}>
                    {submitError}
                </Alert>
            )}

            <Box
                sx={{
                    display: 'grid',
                    gap: { xs: 2.5, md: 3 },
                    gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 1fr) 360px' },
                    alignItems: 'start',
                    // Room for the fixed summary bar on phones.
                    pb: { xs: 11, md: 0 },
                }}
            >
                <Stack spacing={2.5} sx={{ minWidth: 0 }}>
                    <FlowSection id="flow-service" index={1} title="Service" done={serviceDone}>
                        <SelectableTileGroup<number>
                            aria-label="Service"
                            value={formData.serviceId}
                            onChange={(id) => {
                                const service = SERVICES.find((s) => s.id === id);
                                if (service) {
                                    dispatch(
                                        setFormData({ serviceId: id, serviceName: service.name })
                                    );
                                }
                            }}
                            options={SERVICES.map((s) => ({
                                value: s.id,
                                title: s.name,
                                description: s.description,
                                icon: <ServiceIcon serviceId={s.id} size={20} />,
                            }))}
                        />
                        {visible('service') && (
                            <FormHelperText error sx={{ mx: 0 }}>
                                {visible('service')}
                            </FormHelperText>
                        )}
                    </FlowSection>

                    <FlowSection
                        id="flow-when"
                        index={2}
                        title="Date and start time"
                        done={dateTimeDone}
                    >
                        <Stack spacing={2.5}>
                            <Box>
                                <FieldLabel id="flow-date-label">Date</FieldLabel>
                                <Box
                                    role="group"
                                    aria-labelledby="flow-date-label"
                                    sx={{
                                        display: 'grid',
                                        gap: 1,
                                        gridTemplateColumns: {
                                            xs: 'repeat(4, minmax(0, 1fr))',
                                            sm: 'repeat(8, minmax(0, 1fr))',
                                        },
                                    }}
                                >
                                    {days.map((d, i) => {
                                        const selected =
                                            !showDatePicker && dateKey === d.format('YYYY-MM-DD');
                                        return (
                                            <ToggleButton
                                                key={d.format('YYYY-MM-DD')}
                                                value={d.format('YYYY-MM-DD')}
                                                selected={selected}
                                                onChange={() => {
                                                    setDate(d);
                                                    setOtherDate(false);
                                                }}
                                                sx={{
                                                    flexDirection: 'column',
                                                    py: 1,
                                                    lineHeight: 1.25,
                                                    '&.Mui-selected, &.Mui-selected:hover': {
                                                        bgcolor: color.inkFill,
                                                        color: color.onInk,
                                                    },
                                                }}
                                            >
                                                <Box
                                                    component="span"
                                                    sx={{ fontSize: font.size.xs, fontWeight: 600 }}
                                                >
                                                    {i === 0 ? 'Today' : d.format('ddd')}
                                                </Box>{' '}
                                                <Box
                                                    component="span"
                                                    sx={{ fontSize: font.size.xl, fontWeight: 800 }}
                                                >
                                                    {d.format('D')}
                                                </Box>
                                                <Box component="span" sx={srOnly}>
                                                    {d.format(' MMMM')}
                                                </Box>
                                            </ToggleButton>
                                        );
                                    })}
                                    <ToggleButton
                                        value={OTHER}
                                        selected={showDatePicker}
                                        onChange={() => setOtherDate((v) => !v)}
                                        sx={{
                                            gridColumn: { xs: 'span 1', sm: 'auto' },
                                            '&.Mui-selected, &.Mui-selected:hover': {
                                                bgcolor: color.inkFill,
                                                color: color.onInk,
                                            },
                                        }}
                                    >
                                        Other date
                                    </ToggleButton>
                                </Box>
                                {showDatePicker && (
                                    <Box sx={{ mt: 1.5, maxWidth: 260 }}>
                                        <DatePicker
                                            label="Choose a date"
                                            value={date}
                                            onChange={(v) => setDate(v)}
                                            minDate={dayjs()}
                                            slotProps={{
                                                textField: {
                                                    fullWidth: true,
                                                    error: !!visible('date'),
                                                },
                                            }}
                                        />
                                    </Box>
                                )}
                                {visible('date') && (
                                    <FormHelperText error sx={{ mx: 0 }}>
                                        {visible('date')}
                                    </FormHelperText>
                                )}
                            </Box>

                            <Box>
                                <FieldLabel id="flow-time-label">Start time</FieldLabel>
                                <SelectableTileGroup<string>
                                    size="compact"
                                    aria-labelledby="flow-time-label"
                                    value={timeValue}
                                    onChange={(v) => {
                                        if (v === OTHER) {
                                            setOtherTime(true);
                                        } else {
                                            setOtherTime(false);
                                            setTime(timeFromLabel(v));
                                        }
                                    }}
                                    options={[
                                        ...QUICK_TIMES.map((t) => ({ value: t, title: t })),
                                        { value: OTHER, title: 'Other time' },
                                    ]}
                                />
                                {showTimePicker && (
                                    <Box sx={{ mt: 1.5, maxWidth: 260 }}>
                                        <TimePicker
                                            label="Choose a start time"
                                            value={time}
                                            onChange={(v) => setTime(v)}
                                            ampm={false}
                                            slotProps={{
                                                textField: {
                                                    fullWidth: true,
                                                    error: !!visible('time'),
                                                },
                                            }}
                                        />
                                    </Box>
                                )}
                                {visible('time') && (
                                    <FormHelperText error sx={{ mx: 0 }}>
                                        {visible('time')}
                                    </FormHelperText>
                                )}
                            </Box>
                        </Stack>
                    </FlowSection>

                    <FlowSection
                        id="flow-hours"
                        index={3}
                        title="Hours and hourly rate"
                        done={hoursDone}
                    >
                        <Box
                            sx={{
                                display: 'grid',
                                gap: { xs: 2.5, sm: 4 },
                                gridTemplateColumns: { xs: '1fr', sm: '220px minmax(0, 1fr)' },
                            }}
                        >
                            <Box>
                                <FieldLabel id="flow-hours-label">
                                    Hours, {HOUR_LIMITS.min} to {HOUR_LIMITS.max}
                                </FieldLabel>
                                <Box
                                    role="group"
                                    aria-labelledby="flow-hours-label"
                                    sx={{
                                        display: 'grid',
                                        gridTemplateColumns: '44px minmax(0, 1fr) 44px',
                                        alignItems: 'center',
                                        border: `1px solid ${color.lineStrong}`,
                                        borderRadius: '6px',
                                        height: 44,
                                    }}
                                >
                                    <IconButton
                                        aria-label="Decrease hours"
                                        disabled={formData.hours <= HOUR_LIMITS.min}
                                        onClick={() =>
                                            dispatch(setFormData({ hours: formData.hours - 1 }))
                                        }
                                    >
                                        <RemoveIcon />
                                    </IconButton>
                                    <Box
                                        aria-live="polite"
                                        sx={{
                                            textAlign: 'center',
                                            fontWeight: 700,
                                            fontSize: font.size.md,
                                        }}
                                    >
                                        {formData.hours} {formData.hours === 1 ? 'hour' : 'hours'}
                                    </Box>
                                    <IconButton
                                        aria-label="Increase hours"
                                        disabled={formData.hours >= HOUR_LIMITS.max}
                                        onClick={() =>
                                            dispatch(setFormData({ hours: formData.hours + 1 }))
                                        }
                                    >
                                        <AddIcon />
                                    </IconButton>
                                </Box>
                            </Box>
                            <Box sx={{ minWidth: 0 }}>
                                <Stack
                                    direction="row"
                                    sx={{ justifyContent: 'space-between', alignItems: 'baseline' }}
                                >
                                    <FieldLabel id="flow-rate-label">Hourly rate</FieldLabel>
                                    <Box
                                        sx={{
                                            fontSize: font.size['2xl'],
                                            fontWeight: 800,
                                            letterSpacing: font.tracking.head,
                                        }}
                                    >
                                        {usd0(formData.rate)}
                                    </Box>
                                </Stack>
                                <Box sx={{ px: 1.5 }}>
                                    <Slider
                                        aria-labelledby="flow-rate-label"
                                        value={formData.rate}
                                        onChange={(_, value) =>
                                            dispatch(setFormData({ rate: value as number }))
                                        }
                                        min={RATE_LIMITS.min}
                                        max={RATE_LIMITS.max}
                                        step={RATE_LIMITS.step}
                                        marks={[
                                            {
                                                value: RATE_LIMITS.min,
                                                label: usd0(RATE_LIMITS.min),
                                            },
                                            { value: 100, label: usd0(100) },
                                            {
                                                value: RATE_LIMITS.max,
                                                label: usd0(RATE_LIMITS.max),
                                            },
                                        ]}
                                        valueLabelDisplay="auto"
                                        valueLabelFormat={(v) => usd0(v)}
                                        getAriaValueText={(v) => `${v} US dollars per hour`}
                                    />
                                </Box>
                            </Box>
                        </Box>

                        <Box sx={{ mt: 3 }}>
                            {start ? (
                                <>
                                    <ShiftRuler
                                        blocks={[
                                            {
                                                start: start.hour() + start.minute() / 60,
                                                hours: formData.hours,
                                            },
                                        ]}
                                        aria-label={`Shift from ${start.format('HH:mm')} to ${endLabel}`}
                                    />
                                    <Typography variant="caption" component="p" sx={{ mt: 1 }}>
                                        {start.format('HH:mm')} to {endLabel}, {formData.hours}{' '}
                                        {formData.hours === 1 ? 'hour' : 'hours'}
                                    </Typography>
                                </>
                            ) : (
                                <Typography variant="body2" color="text.secondary">
                                    Choose a date and start time to see the shift on the timeline.
                                </Typography>
                            )}
                        </Box>
                    </FlowSection>

                    <FlowSection id="flow-address" index={4} title="Address" done={addressDone}>
                        <LocationPicker
                            value={location}
                            onChange={setLocation}
                            error={visible('address')}
                            startPoint={startPoint}
                        />
                    </FlowSection>

                    <Box>
                        <Button variant="text" size="small" onClick={handleClear}>
                            Clear the form
                        </Button>
                    </Box>
                </Stack>

                <BookingSummary
                    serviceId={formData.serviceId}
                    serviceName={formData.serviceName}
                    start={start}
                    address={formData.address}
                    rate={formData.rate}
                    hours={formData.hours}
                    missing={missing}
                    submitting={isCreating}
                    onSubmit={handleSubmit}
                />
            </Box>
        </LocalizationProvider>
    );
}
