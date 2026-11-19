import { useState } from 'react';
import { Avatar, Box, CircularProgress, FormControlLabel, Stack, Switch } from '@mui/material';
import { Star } from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { selectCurrentUser, updateUser } from '@/features/auth/authSlice';
import { useUpdateProviderAvailabilityMutation } from '@/features/provider/providerApi';
import { useSnackbar } from '@/components/feedback/snackbarContext';
import { Panel, SelectableTileGroup, ServiceIcon } from '@/components/ui';
import { SERVICES } from '@/types';
import { getErrorMessage } from '@/utils/format';
import { getInitials, getProfileImageUrl } from '@/utils/profileImage';
import { color, font } from '@/theme/tokens';
import type { Coordinates } from '../useProviderLocation';

// Normalizes selectedJobTypes to number[].
function normalizeJobTypes(
    jobTypes: number[] | { id: number; name: string; _id?: string }[] | undefined
): number[] {
    if (!jobTypes || jobTypes.length === 0) return [];
    if (typeof jobTypes[0] === 'number') return jobTypes as number[];
    return (jobTypes as { id: number }[]).map((jt) => jt.id);
}

const SERVICE_OPTIONS = SERVICES.map((s) => ({
    value: s.id,
    title: s.name,
    icon: <ServiceIcon serviceId={s.id} />,
}));

/** Who is working, whether they are online and which services they offer. */
export default function AvailabilityPanel({ location }: { location: Coordinates | null }) {
    const dispatch = useAppDispatch();
    const snackbar = useSnackbar();
    const user = useAppSelector(selectCurrentUser);

    const [isAvailable, setIsAvailable] = useState(user?.isProviderAvailable || false);
    const [selectedJobTypes, setSelectedJobTypes] = useState<number[]>(
        normalizeJobTypes(user?.selectedJobTypes)
    );
    const [updateAvailability, { isLoading }] = useUpdateProviderAvailabilityMutation();

    const syncAvailability = async (available: boolean, jobTypes: number[]) => {
        try {
            await updateAvailability({
                isProviderAvailable: available,
                selectedJobTypes: jobTypes,
                currentLocation: location
                    ? { latitude: location.lat, longitude: location.lng }
                    : undefined,
            }).unwrap();

            dispatch(updateUser({ isProviderAvailable: available, selectedJobTypes: jobTypes }));
        } catch (err) {
            // Revert on error
            setIsAvailable(user?.isProviderAvailable || false);
            setSelectedJobTypes(normalizeJobTypes(user?.selectedJobTypes));
            snackbar.error(getErrorMessage(err, 'Could not update your availability'));
        }
    };

    const handleAvailabilityChange = async (available: boolean) => {
        setIsAvailable(available);
        await syncAvailability(available, selectedJobTypes);
    };

    const handleJobTypesChange = async (jobTypes: number[]) => {
        if (isLoading) return; // one update at a time
        setSelectedJobTypes(jobTypes);
        await syncAvailability(isAvailable, jobTypes);
    };

    const name = [user?.firstName, user?.lastName].filter(Boolean).join(' ');

    return (
        <Panel aria-label="Availability">
            <Box
                sx={{
                    display: 'grid',
                    gap: 2.5,
                    gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 1fr) minmax(0, 1.4fr)' },
                    alignItems: 'start',
                }}
            >
                <Stack spacing={2}>
                    <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                        <Avatar
                            src={getProfileImageUrl(user?.profile)}
                            alt=""
                            sx={{ width: 44, height: 44 }}
                        >
                            {getInitials(user?.firstName, user?.lastName)}
                        </Avatar>
                        <Box sx={{ minWidth: 0 }}>
                            <Box
                                sx={{
                                    fontWeight: 700,
                                    fontSize: font.size.md,
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                }}
                            >
                                {name || 'Your account'}
                            </Box>
                            {!!user?.rating && (
                                <Stack
                                    direction="row"
                                    spacing={0.5}
                                    sx={{
                                        alignItems: 'center',
                                        fontSize: font.size.xs,
                                        fontWeight: 600,
                                        color: color.ink600,
                                    }}
                                >
                                    <Star sx={{ fontSize: 14, color: color.amber500 }} />
                                    <span>{user.rating.toFixed(1)} rating</span>
                                </Stack>
                            )}
                        </Box>
                    </Stack>

                    <Box>
                        <FormControlLabel
                            sx={{ m: 0, gap: 1.25, alignItems: 'center' }}
                            control={
                                <Switch
                                    checked={isAvailable}
                                    onChange={(e) =>
                                        void handleAvailabilityChange(e.target.checked)
                                    }
                                    disabled={isLoading}
                                />
                            }
                            label={
                                <Box component="span" sx={{ fontWeight: 700 }}>
                                    {isAvailable ? 'Online' : 'Offline'}
                                </Box>
                            }
                        />
                        <Stack
                            direction="row"
                            spacing={1}
                            aria-live="polite"
                            sx={{
                                alignItems: 'center',
                                mt: 0.5,
                                fontSize: font.size.xs,
                                fontWeight: 600,
                                color: color.ink500,
                            }}
                        >
                            {isLoading && <CircularProgress size={12} aria-label="Saving" />}
                            <span>
                                {isLoading
                                    ? 'Saving your availability'
                                    : isAvailable
                                      ? 'Visible for new orders near you'
                                      : 'Switch on to be visible for new orders'}
                            </span>
                        </Stack>
                    </Box>
                </Stack>

                <Box>
                    <Box
                        id="services-label"
                        sx={{ fontSize: font.size.xs, fontWeight: 600, color: color.ink500, mb: 1 }}
                    >
                        Services you provide
                    </Box>
                    <SelectableTileGroup
                        type="checkbox"
                        size="compact"
                        aria-labelledby="services-label"
                        options={SERVICE_OPTIONS}
                        value={selectedJobTypes}
                        onChange={(next) => void handleJobTypesChange(next)}
                    />
                    {selectedJobTypes.length === 0 && (
                        <Box
                            sx={{
                                mt: 1,
                                fontSize: font.size.xs,
                                fontWeight: 600,
                                color: color.ink500,
                            }}
                        >
                            Select at least one service to see matching orders.
                        </Box>
                    )}
                </Box>
            </Box>
        </Panel>
    );
}
