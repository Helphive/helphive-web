import { useEffect, useMemo, useRef, useState, type ChangeEvent } from 'react';
import { useForm } from 'react-hook-form';
import {
    Avatar,
    Box,
    Button,
    CircularProgress,
    Stack,
    TextField,
    Typography,
    type TextFieldProps,
} from '@mui/material';
import { PhotoCameraOutlined } from '@mui/icons-material';
import dayjs from 'dayjs';
import {
    useGetUserInfoQuery,
    useUpdateProfileMutation,
    type UserInfoResponse,
} from '@/features/auth/authApi';
import { updateUser } from '@/features/auth/authSlice';
import { useAppDispatch } from '@/store/hooks';
import { useSnackbar } from '@/components/feedback/snackbarContext';
import {
    DataList,
    DataRow,
    DetailSkeleton,
    ErrorState,
    PageHeader,
    Panel,
    StatusPill,
    type Tone,
} from '@/components/ui';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { getErrorMessage } from '@/utils/format';
import { getInitials, getProfileImageUrl } from '@/utils/profileImage';

// Mirrors the backend validator for names (validateUpdateProfileFields).
const NAME_REGEX = /^[a-zA-Z\xC0-￿]+([ \-']{0,1}[a-zA-Z\xC0-￿]+){0,2}[.]{0,1}$/;
const PHONE_REGEX = /^\+?[0-9][0-9 ()-]{6,19}$/;
const MAX_PHOTO_BYTES = 5 * 1024 * 1024;
const PHOTO_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

type FieldName = 'firstName' | 'lastName' | 'phone' | 'street' | 'city' | 'state' | 'country';
type FormValues = Record<FieldName, string>;

const PROVIDER_STATUS: Record<string, { label: string; tone: Tone }> = {
    approved: { label: 'Approved', tone: 'green' },
    pending: { label: 'In review', tone: 'amber' },
    rejected: { label: 'Not approved', tone: 'red' },
};

// The backend stores address parts in lower case.
const titleCase = (value?: string) =>
    (value ?? '').replace(/\b\p{L}/gu, (c) => c.toUpperCase()).trim();

const toForm = (info?: UserInfoResponse): FormValues => ({
    firstName: info?.user.firstName ?? info?.firstName ?? '',
    lastName: info?.user.lastName ?? info?.lastName ?? '',
    phone: info?.user.phone ?? '',
    street: titleCase(info?.user.street),
    city: titleCase(info?.user.city),
    state: titleCase(info?.user.state),
    country: titleCase(info?.user.country),
});

export default function ProfilePage({ area }: { area: 'user' | 'provider' }) {
    useDocumentTitle('Profile');
    const dispatch = useAppDispatch();
    const snackbar = useSnackbar();
    const { data, isLoading, error, refetch } = useGetUserInfoQuery();
    const [updateProfile, { isLoading: isSaving }] = useUpdateProfileMutation();

    const saved = useMemo(() => toForm(data), [data]);
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, dirtyFields, isDirty },
    } = useForm<FormValues>({ values: saved });

    const [photo, setPhoto] = useState<File | null>(null);
    const [photoError, setPhotoError] = useState('');
    const photoInput = useRef<HTMLInputElement>(null);
    const photoPreview = useMemo(() => (photo ? URL.createObjectURL(photo) : undefined), [photo]);
    useEffect(
        () => () => {
            if (photoPreview) URL.revokeObjectURL(photoPreview);
        },
        [photoPreview]
    );

    // Keep the shell (avatar, account menu name) in step with the server copy.
    useEffect(() => {
        if (!data) return;
        dispatch(
            updateUser({
                firstName: data.user.firstName,
                lastName: data.user.lastName,
                phone: data.user.phone,
                profile: data.user.profile,
            })
        );
    }, [data, dispatch]);

    if (isLoading) return <DetailSkeleton label="Loading your profile" />;
    if (error || !data) {
        return (
            <>
                <PageHeader title="Profile" />
                <ErrorState
                    title="Could not load your profile"
                    message={getErrorMessage(error, 'Check your connection and try again.')}
                    onRetry={refetch}
                />
            </>
        );
    }

    const user = data.user;
    const avatarSrc = photoPreview ?? getProfileImageUrl(user.profile);
    const providerStatus = data.status ? PROVIDER_STATUS[data.status] : undefined;

    // A field that already has a value cannot be blanked: the backend ignores empty values.
    const keepIfSet = (name: FieldName, label: string) => (value: string) =>
        !saved[name] || value.trim() !== '' || `${label} cannot be removed, only changed`;

    const onPhoto = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        e.target.value = '';
        if (!file) return;
        if (!PHOTO_TYPES.includes(file.type)) {
            setPhotoError('Choose a JPG, PNG or WebP image.');
            return;
        }
        if (file.size > MAX_PHOTO_BYTES) {
            setPhotoError('Choose an image smaller than 5 MB.');
            return;
        }
        setPhotoError('');
        setPhoto(file);
    };

    const onSubmit = async (values: FormValues) => {
        const body = new FormData();
        (Object.keys(dirtyFields) as FieldName[]).forEach((name) => {
            const value = values[name].trim();
            if (value) body.append(name, value);
        });
        if (photo) body.append('profile', photo);
        try {
            await updateProfile(body).unwrap();
            setPhoto(null);
            snackbar.success('Profile saved');
        } catch (err) {
            snackbar.error(getErrorMessage(err, 'Could not save your profile'));
        }
    };

    const discard = () => {
        reset(saved);
        setPhoto(null);
        setPhotoError('');
    };

    const field = (name: FieldName, label: string, extra: Partial<TextFieldProps> = {}) => (
        <TextField
            label={label}
            fullWidth
            error={!!errors[name]}
            helperText={errors[name]?.message}
            disabled={isSaving}
            {...extra}
            {...register(name, {
                validate: keepIfSet(name, label),
                maxLength: { value: 100, message: `${label} must be 100 characters or fewer` },
            })}
        />
    );

    const canSave = isDirty || !!photo;

    return (
        <>
            <PageHeader
                title="Profile"
                subtitle="Your name, contact details and photo, as customers and providers see them."
            />
            <Box
                sx={{
                    display: 'grid',
                    gap: { xs: 2.5, md: 3 },
                    gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 1fr) 320px' },
                    alignItems: 'start',
                }}
            >
                <Box
                    component="form"
                    onSubmit={handleSubmit(onSubmit)}
                    noValidate
                    sx={{ minWidth: 0 }}
                >
                    <Panel
                        title="Personal details"
                        flush
                        footer={
                            <>
                                <Typography variant="caption">
                                    {canSave ? 'You have unsaved changes.' : 'All changes saved.'}
                                </Typography>
                                <Stack direction="row" spacing={1}>
                                    <Button onClick={discard} disabled={!canSave || isSaving}>
                                        Discard
                                    </Button>
                                    <Button
                                        type="submit"
                                        variant="contained"
                                        disabled={!canSave || isSaving}
                                        startIcon={
                                            isSaving ? <CircularProgress size={16} /> : undefined
                                        }
                                    >
                                        Save changes
                                    </Button>
                                </Stack>
                            </>
                        }
                    >
                        <Stack
                            direction="row"
                            spacing={2}
                            sx={{
                                alignItems: 'center',
                                px: { xs: 2, sm: 2.5 },
                                py: 2.5,
                                borderBottom: 1,
                                borderColor: 'divider',
                            }}
                        >
                            <Avatar
                                src={avatarSrc}
                                alt=""
                                sx={{ width: 64, height: 64, fontSize: 20 }}
                            >
                                {getInitials(user.firstName, user.lastName)}
                            </Avatar>
                            <Box sx={{ minWidth: 0 }}>
                                <input
                                    ref={photoInput}
                                    type="file"
                                    accept={PHOTO_TYPES.join(',')}
                                    hidden
                                    onChange={onPhoto}
                                />
                                <Button
                                    variant="outlined"
                                    size="small"
                                    startIcon={<PhotoCameraOutlined />}
                                    onClick={() => photoInput.current?.click()}
                                    disabled={isSaving}
                                >
                                    {user.profile || photo ? 'Change photo' : 'Add photo'}
                                </Button>
                                <Typography
                                    variant="caption"
                                    component="p"
                                    role={photoError ? 'alert' : undefined}
                                    sx={{ mt: 0.75, color: photoError ? 'error.main' : undefined }}
                                >
                                    {photoError ||
                                        (photo
                                            ? `${photo.name} will be uploaded when you save.`
                                            : 'JPG, PNG or WebP, up to 5 MB.')}
                                </Typography>
                            </Box>
                        </Stack>

                        <Box
                            sx={{
                                display: 'grid',
                                gap: 2.5,
                                gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                                px: { xs: 2, sm: 2.5 },
                                py: 2.5,
                            }}
                        >
                            <TextField
                                label="First name"
                                required
                                fullWidth
                                autoComplete="given-name"
                                error={!!errors.firstName}
                                helperText={errors.firstName?.message}
                                disabled={isSaving}
                                {...register('firstName', {
                                    required: 'Enter your first name',
                                    pattern: {
                                        value: NAME_REGEX,
                                        message: 'Use letters only, for example Amara',
                                    },
                                    minLength: { value: 2, message: 'Use at least 2 letters' },
                                    maxLength: { value: 50, message: 'Use 50 characters or fewer' },
                                })}
                            />
                            <TextField
                                label="Last name"
                                required
                                fullWidth
                                autoComplete="family-name"
                                error={!!errors.lastName}
                                helperText={errors.lastName?.message}
                                disabled={isSaving}
                                {...register('lastName', {
                                    required: 'Enter your last name',
                                    pattern: {
                                        value: NAME_REGEX,
                                        message: 'Use letters only, for example Okafor',
                                    },
                                    minLength: { value: 2, message: 'Use at least 2 letters' },
                                    maxLength: { value: 50, message: 'Use 50 characters or fewer' },
                                })}
                            />
                            <TextField
                                label="Email"
                                value={user.email}
                                fullWidth
                                disabled
                                helperText="Contact support to change your email."
                            />
                            <TextField
                                label="Phone number"
                                type="tel"
                                fullWidth
                                autoComplete="tel"
                                placeholder="+1 212 555 0100"
                                error={!!errors.phone}
                                helperText={errors.phone?.message}
                                disabled={isSaving}
                                {...register('phone', {
                                    validate: {
                                        kept: keepIfSet('phone', 'Phone number'),
                                        format: (v) =>
                                            !v.trim() ||
                                            PHONE_REGEX.test(v.trim()) ||
                                            'Enter a phone number, for example +1 212 555 0100',
                                    },
                                })}
                            />
                        </Box>

                        <Box sx={{ px: { xs: 2, sm: 2.5 }, pb: 2.5 }}>
                            <Typography variant="subtitle2" component="h3" sx={{ mb: 1.5 }}>
                                Address
                            </Typography>
                            <Box
                                sx={{
                                    display: 'grid',
                                    gap: 2.5,
                                    gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                                }}
                            >
                                <Box sx={{ gridColumn: '1 / -1' }}>
                                    {field('street', 'Street address', {
                                        autoComplete: 'street-address',
                                    })}
                                </Box>
                                {field('city', 'City', { autoComplete: 'address-level2' })}
                                {field('state', 'State', { autoComplete: 'address-level1' })}
                                {field('country', 'Country', { autoComplete: 'country-name' })}
                            </Box>
                        </Box>
                    </Panel>
                </Box>

                <Panel title="Account">
                    <DataList variant="stacked">
                        <DataRow label="Email" value={user.email} />
                        <DataRow
                            label="Account type"
                            value={area === 'provider' ? 'Provider' : 'Customer'}
                        />
                        {area === 'provider' && providerStatus && (
                            <DataRow
                                label="Provider status"
                                value={
                                    <StatusPill tone={providerStatus.tone}>
                                        {providerStatus.label}
                                    </StatusPill>
                                }
                            />
                        )}
                        {!!user.rating && <DataRow label="Rating" value={user.rating.toFixed(1)} />}
                        {user.createdAt && (
                            <DataRow
                                label="Member since"
                                value={dayjs(user.createdAt).format('MMMM YYYY')}
                            />
                        )}
                    </DataList>
                </Panel>
            </Box>
        </>
    );
}
