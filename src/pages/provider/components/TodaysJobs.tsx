import { Link as RouterLink } from 'react-router-dom';
import { Box, Button, Link, Stack } from '@mui/material';
import dayjs from 'dayjs';
import type { Booking, DisplayStatus } from '@/types';
import { formatMoney, getDisplayStatus, getErrorMessage, pluralHours } from '@/utils/format';
import { color, font, hairline, hoverRow } from '@/theme/tokens';
import {
    BookingStatusPill,
    EmptyState,
    ErrorState,
    ListSkeleton,
    Panel,
    ShiftRuler,
    type ShiftBlock,
} from '@/components/ui';
import { orderEarnings, timeRange, venueName } from '../orderUtils';
import { LocationIcon, TimeIcon, TodayIcon } from '@/components/ui/icons';

type Tone = NonNullable<ShiftBlock['tone']>;

// Coral marks the job in focus (under way), ink the others, soft the finished.
const TONE_BY_STATUS: Partial<Record<DisplayStatus, Tone>> = {
    in_progress: 'coral',
    awaiting_start_approval: 'coral',
    completed: 'soft',
};

const BAR_COLOR: Record<Tone, string> = {
    coral: color.coral500,
    ink: color.ink900,
    soft: color.coral100,
};

const toneOf = (b: Booking): Tone => TONE_BY_STATUS[getDisplayStatus(b)] ?? 'ink';

interface TodaysJobsProps {
    jobs: Booking[];
    loading: boolean;
    error?: unknown;
    onRetry: () => void;
}

export default function TodaysJobs({ jobs, loading, error, onRetry }: TodaysJobsProps) {
    if (loading) return <ListSkeleton rows={2} label="Loading today's jobs" />;

    const hours = jobs.reduce((sum, j) => sum + (j.hours || 0), 0);
    const summary = jobs.length
        ? `${jobs.length} ${jobs.length === 1 ? 'job' : 'jobs'}, ${pluralHours(hours)}`
        : undefined;

    return (
        <Panel
            title="Today's jobs"
            actions={
                summary ?? (
                    <Link component={RouterLink} to="/provider/my-orders" underline="hover">
                        My orders
                    </Link>
                )
            }
            flush
        >
            {error ? (
                <ErrorState
                    bare
                    title="Could not load your jobs"
                    message={getErrorMessage(error, 'Check your connection and try again.')}
                    onRetry={onRetry}
                />
            ) : jobs.length === 0 ? (
                <EmptyState
                    bare
                    icon={<TodayIcon />}
                    title="No jobs today"
                    description="Jobs you accept for today appear here with their times."
                    action={
                        <Button component={RouterLink} to="/provider/orders" variant="outlined">
                            Browse available orders
                        </Button>
                    }
                />
            ) : (
                <>
                    <Box sx={{ px: { xs: 2, sm: 2.5 }, pt: 0.5, pb: 2.5 }}>
                        <ShiftRuler
                            now={dayjs()}
                            blocks={jobs.map((j) => ({
                                key: j._id,
                                start: j.startDate,
                                hours: j.hours || 1,
                                label: venueName(j.address),
                                tone: toneOf(j),
                            }))}
                        />
                    </Box>
                    <Box
                        component="ul"
                        aria-label="Today's jobs"
                        sx={{ listStyle: 'none', m: 0, p: 0 }}
                    >
                        {jobs.map((job) => (
                            <Box component="li" key={job._id} sx={{ borderTop: hairline }}>
                                <JobRow job={job} />
                            </Box>
                        ))}
                    </Box>
                </>
            )}
        </Panel>
    );
}

function JobRow({ job }: { job: Booking }) {
    return (
        <Box
            component={RouterLink}
            to={`/provider/my-orders/${job._id}`}
            sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '4px minmax(0, 1fr)', sm: '4px minmax(0, 1fr) auto' },
                columnGap: 2,
                rowGap: 1,
                alignItems: 'center',
                px: { xs: 2, sm: 2.5 },
                py: 2,
                color: 'inherit',
                textDecoration: 'none',
                '&:hover': hoverRow,
            }}
        >
            <Box
                aria-hidden="true"
                sx={{
                    alignSelf: 'stretch',
                    borderRadius: '2px',
                    bgcolor: BAR_COLOR[toneOf(job)],
                    gridRow: { xs: 'span 2', sm: 'auto' },
                }}
            />
            <Box sx={{ minWidth: 0 }}>
                <Box sx={{ fontWeight: 700, fontSize: font.size.md }}>
                    {job.service?.name || 'Service'}
                </Box>
                <Stack
                    direction="row"
                    sx={{
                        flexWrap: 'wrap',
                        columnGap: 2,
                        rowGap: 0.25,
                        mt: 0.25,
                        fontSize: font.size.sm,
                        color: color.ink600,
                        '& svg': { fontSize: 16, color: color.ink500 },
                        '& > span': {
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 0.625,
                            minWidth: 0,
                        },
                    }}
                >
                    <span>
                        <TimeIcon weight="bold" />
                        {timeRange(job)}, {job.hours} h
                    </span>
                    <span>
                        <LocationIcon weight="bold" />
                        {job.address}
                    </span>
                </Stack>
            </Box>
            <Stack
                direction={{ xs: 'row', sm: 'column' }}
                spacing={{ xs: 1.5, sm: 0.75 }}
                sx={{
                    alignItems: { xs: 'center', sm: 'flex-end' },
                    gridColumn: { xs: 2, sm: 'auto' },
                }}
            >
                <BookingStatusPill status={getDisplayStatus(job)} />
                <Box
                    sx={{
                        fontWeight: 800,
                        fontSize: font.size.lg,
                        letterSpacing: font.tracking.head,
                    }}
                >
                    {formatMoney(orderEarnings(job))}
                </Box>
            </Stack>
        </Box>
    );
}
