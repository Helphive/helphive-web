import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Box, Tab, Tabs } from '@mui/material';
import { PageHeader } from '@/components/ui';
import TabLabel from '@/components/common/TabLabel';
import { useAppSelector } from '@/store/hooks';
import { selectCurrentUser } from '@/features/auth/authSlice';
import { useGetUserBookingsQuery } from '@/features/booking/bookingApi';
import { useBucketedBookings } from '@/hooks/useBucketedBookings';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { getErrorMessage } from '@/utils/format';
import BookingFlow from './BookingFlow';
import BookingsList, { type ListTab } from './BookingsList';

type TabKey = 'book' | ListTab;

const TAB_KEYS: TabKey[] = ['book', 'active', 'scheduled', 'history'];

const LIST_LABELS: Record<ListTab, string> = {
    active: 'Active',
    scheduled: 'Scheduled',
    history: 'History',
};

export default function UserDashboard() {
    const user = useAppSelector(selectCurrentUser);
    const [params, setParams] = useSearchParams();
    const requested = params.get('tab') as TabKey | null;
    const activeTab: TabKey = requested && TAB_KEYS.includes(requested) ? requested : 'book';

    const { data: bookingsData, isLoading, error: loadError, refetch } = useGetUserBookingsQuery();

    const allBookings = useMemo(
        () =>
            bookingsData
                ? [...bookingsData.active, ...bookingsData.scheduled, ...bookingsData.history]
                : undefined,
        [bookingsData]
    );
    const buckets = useBucketedBookings(allBookings);

    useDocumentTitle(activeTab === 'book' ? 'Book a service' : 'Bookings');

    const selectTab = (tab: TabKey) => {
        setParams(tab === 'book' ? {} : { tab }, { replace: true });
    };
    const countOf = (tab: ListTab) => (isLoading || loadError ? undefined : buckets[tab].length);

    return (
        <>
            <PageHeader
                title={activeTab === 'book' ? 'Book a service' : 'Your bookings'}
                subtitle={
                    activeTab === 'book'
                        ? `${user?.firstName ? `${user.firstName}, ` : ''}choose a service and set the shift. You review the price before you pay.`
                        : 'Track bookings from request to completion.'
                }
            />

            <Tabs
                value={activeTab}
                onChange={(_, v: TabKey) => selectTab(v)}
                variant="scrollable"
                scrollButtons="auto"
                allowScrollButtonsMobile
                aria-label="Bookings"
                sx={{ mb: 3, borderBottom: '1px solid', borderColor: 'divider' }}
            >
                <Tab
                    value="book"
                    label="Book a service"
                    id="bookings-tab-book"
                    aria-controls="bookings-panel"
                />
                {(Object.keys(LIST_LABELS) as ListTab[]).map((tab) => (
                    <Tab
                        key={tab}
                        value={tab}
                        id={`bookings-tab-${tab}`}
                        aria-controls="bookings-panel"
                        label={<TabLabel label={LIST_LABELS[tab]} count={countOf(tab)} />}
                    />
                ))}
            </Tabs>

            <Box id="bookings-panel" role="tabpanel" aria-labelledby={`bookings-tab-${activeTab}`}>
                {/* Stays mounted so the chosen date and time survive a visit to another tab. */}
                <Box
                    hidden={activeTab !== 'book'}
                    sx={{ display: activeTab === 'book' ? 'block' : 'none' }}
                >
                    <BookingFlow />
                </Box>
                {activeTab !== 'book' && (
                    <BookingsList
                        tab={activeTab}
                        bookings={buckets[activeTab]}
                        loading={isLoading}
                        error={
                            loadError
                                ? getErrorMessage(loadError, 'Check your connection and try again.')
                                : null
                        }
                        onRetry={() => void refetch()}
                        onBook={() => selectTab('book')}
                    />
                )}
            </Box>
        </>
    );
}
