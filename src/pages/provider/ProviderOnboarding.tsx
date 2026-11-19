import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert, Box, Button, CircularProgress, Stack, TextField } from '@mui/material';
import {
    BadgeOutlined,
    CheckCircleOutline,
    DescriptionOutlined,
    PersonOutline,
    UploadFileOutlined,
} from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import { useRequestProviderAccountMutation } from '@/features/provider/providerApi';
import { useAppSelector } from '@/store/hooks';
import { selectCurrentUser } from '@/features/auth/authSlice';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import {
    DataList,
    DataRow,
    PageHeader,
    Panel,
    SelectableTileGroup,
    ServiceIcon,
    StepProgress,
} from '@/components/ui';
import { SERVICES } from '@/types';
import { getErrorMessage } from '@/utils/format';
import { color, font, radius } from '@/theme/tokens';
import DocumentUploadRow from './components/DocumentUploadRow';
import OnboardingFrame from './components/OnboardingFrame';
import StatusScreen from './components/StatusScreen';

interface OnboardingFormData {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    country: string;
    state: string;
    city: string;
    street: string;
}

type DocKey = 'profile' | 'id' | 'dbs' | 'resume';

interface DocConfig {
    key: DocKey;
    title: string;
    description: string;
    accept: string;
    formats: string;
    icon: React.ReactNode;
    missing: string;
    previewImage?: boolean;
}

const STEPS = [
    { label: 'Information', short: 'Info' },
    { label: 'Documents', short: 'Docs' },
    { label: 'Services', short: 'Services' },
];
const LAST_STEP = STEPS.length - 1;

const DOCS: DocConfig[] = [
    {
        key: 'profile',
        title: 'Profile photo',
        description: 'A clear photo of your face. Customers see it on your profile. Accepted:',
        accept: 'image/*',
        formats: 'a JPG, PNG or other image',
        icon: <PersonOutline />,
        missing: 'Add a profile photo',
        previewImage: true,
    },
    {
        key: 'id',
        title: 'ID document',
        description: 'A passport, driving licence or national ID card. Accepted:',
        accept: 'image/*,.pdf',
        formats: 'an image or a PDF',
        icon: <BadgeOutlined />,
        missing: 'Upload your ID document',
    },
    {
        key: 'dbs',
        title: 'DBS certificate',
        description: 'Your Disclosure and Barring Service check certificate. Accepted:',
        accept: 'image/*,.pdf',
        formats: 'an image or a PDF',
        icon: <DescriptionOutlined />,
        missing: 'Upload your DBS certificate',
    },
    {
        key: 'resume',
        title: 'Resume or CV',
        description: 'Your recent work experience. Accepted:',
        accept: '.pdf,.doc,.docx',
        formats: 'a PDF, DOC or DOCX file',
        icon: <UploadFileOutlined />,
        missing: 'Upload your resume or CV',
    },
];

const SERVICE_OPTIONS = SERVICES.map((s) => ({
    value: s.id,
    title: s.name,
    description: s.description,
    icon: <ServiceIcon serviceId={s.id} />,
}));

type Files = Record<DocKey, File | null>;
type DocErrors = Partial<Record<DocKey, string>>;

export default function ProviderOnboarding() {
    useDocumentTitle('Become a provider');
    const navigate = useNavigate();
    const user = useAppSelector(selectCurrentUser);
    const [activeStep, setActiveStep] = useState(0);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const [files, setFiles] = useState<Files>({ profile: null, id: null, dbs: null, resume: null });
    const [docErrors, setDocErrors] = useState<DocErrors>({});
    const [selectedServices, setSelectedServices] = useState<number[]>([]);
    const [serviceError, setServiceError] = useState<string | null>(null);

    const [submitApplication, { isLoading }] = useRequestProviderAccountMutation();

    const {
        register,
        handleSubmit,
        formState: { errors },
        getValues,
        setValue,
        trigger,
    } = useForm<OnboardingFormData>();

    // Pre-fill form with user data
    useEffect(() => {
        if (user) {
            if (user.firstName) setValue('firstName', user.firstName);
            if (user.lastName) setValue('lastName', user.lastName);
            if (user.email) setValue('email', user.email);
            if (user.phone) setValue('phone', user.phone);
        }
    }, [user, setValue]);

    // Each step starts at the top with its own heading in view.
    useEffect(() => {
        window.scrollTo({ top: 0 });
    }, [activeStep]);

    const setFile = (key: DocKey, file: File | null) => {
        setFiles((prev) => ({ ...prev, [key]: file }));
        setDocErrors((prev) => ({ ...prev, [key]: undefined }));
    };

    const validateDocuments = () => {
        const next: DocErrors = {};
        for (const doc of DOCS) {
            if (!files[doc.key]) next[doc.key] = doc.missing;
        }
        setDocErrors(next);
        const first = DOCS.find((d) => next[d.key]);
        if (first) document.getElementById(`doc-${first.key}-choose`)?.focus();
        return !first;
    };

    const handleNext = async () => {
        if (activeStep === 0) {
            const valid = await trigger(['firstName', 'lastName', 'email', 'phone'], {
                shouldFocus: true,
            });
            if (!valid) return;
        } else if (activeStep === 1 && !validateDocuments()) {
            return;
        }
        setActiveStep((prev) => prev + 1);
    };

    const onSubmit = async (data: OnboardingFormData) => {
        if (selectedServices.length === 0) {
            setServiceError('Select at least one service you can provide');
            return;
        }

        const formData = new FormData();
        formData.append('firstName', data.firstName);
        formData.append('lastName', data.lastName);
        formData.append('email', data.email);
        formData.append('phone', data.phone);
        formData.append('country', data.country || 'UK');
        formData.append('state', data.state || '');
        formData.append('city', data.city || '');
        formData.append('street', data.street || '');

        if (files.id) formData.append('id', files.id);
        if (files.dbs) formData.append('dbs', files.dbs);
        if (files.resume) formData.append('resume', files.resume);
        if (files.profile) formData.append('profile', files.profile);

        formData.append('publicAreaAttendant', String(selectedServices.includes(1)));
        formData.append('roomAttendant', String(selectedServices.includes(2)));
        formData.append('linenPorter', String(selectedServices.includes(3)));

        try {
            setSubmitError(null);
            await submitApplication(formData).unwrap();
            setSuccess(true);
        } catch (err) {
            setSubmitError(
                getErrorMessage(
                    err,
                    'Could not submit your application. Check your connection and try again.'
                )
            );
        }
    };

    // Enter in a text field moves to the next step; only the last step submits.
    const handleFormSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (activeStep < LAST_STEP) {
            void handleNext();
            return;
        }
        void handleSubmit(onSubmit)();
    };

    if (success) {
        return (
            <StatusScreen
                tone="green"
                statusLabel="Submitted"
                icon={<CheckCircleOutline />}
                title="Application submitted"
                description="Thank you. Your provider application is with our team for review."
                next={[
                    'Our team reviews your documents, usually within 1-2 business days.',
                    'We notify you once a decision has been made.',
                    'When you are approved, you can start accepting orders.',
                ]}
                actions={
                    <Button variant="contained" onClick={() => navigate('/provider/pending')}>
                        Continue
                    </Button>
                }
            />
        );
    }

    const values = getValues();
    const address = [values.street, values.city, values.state, values.country || 'UK']
        .filter(Boolean)
        .join(', ');

    return (
        <OnboardingFrame>
            <PageHeader
                title="Become a provider"
                subtitle="Add your details and documents so we can review your application."
            />
            <StepProgress
                aria-label="Application steps"
                steps={STEPS}
                current={activeStep}
                sx={{ mb: 3 }}
            />

            <Box component="form" onSubmit={handleFormSubmit} noValidate>
                <Panel
                    title={
                        activeStep === 0
                            ? 'Your information'
                            : activeStep === 1
                              ? 'Your documents'
                              : 'Your services'
                    }
                    subtitle={
                        activeStep === 0
                            ? 'Confirm who you are and where you are based.'
                            : activeStep === 1
                              ? 'All four are required. We only use them to verify your application.'
                              : 'Choose the work you are qualified to do, then review your application.'
                    }
                    footer={
                        <>
                            {activeStep > 0 ? (
                                <Button
                                    variant="outlined"
                                    onClick={() => setActiveStep((prev) => prev - 1)}
                                    disabled={isLoading}
                                >
                                    Back
                                </Button>
                            ) : (
                                <span />
                            )}
                            {activeStep < LAST_STEP ? (
                                <Button variant="contained" onClick={() => void handleNext()}>
                                    Continue
                                </Button>
                            ) : (
                                <Button
                                    type="submit"
                                    variant="contained"
                                    disabled={isLoading}
                                    startIcon={
                                        isLoading ? (
                                            <CircularProgress size={16} color="inherit" />
                                        ) : undefined
                                    }
                                >
                                    Submit application
                                </Button>
                            )}
                        </>
                    }
                >
                    {activeStep === 0 && (
                        <Box
                            sx={{
                                display: 'grid',
                                gap: 2.5,
                                gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' },
                            }}
                        >
                            <TextField
                                label="First name"
                                required
                                autoComplete="given-name"
                                {...register('firstName', { required: 'Enter your first name' })}
                                error={!!errors.firstName}
                                helperText={errors.firstName?.message}
                            />
                            <TextField
                                label="Last name"
                                required
                                autoComplete="family-name"
                                {...register('lastName', { required: 'Enter your last name' })}
                                error={!!errors.lastName}
                                helperText={errors.lastName?.message}
                            />
                            <TextField
                                label="Email"
                                type="email"
                                required
                                {...register('email', {
                                    required: 'Your account has no email address. Contact support.',
                                })}
                                error={!!errors.email}
                                helperText={errors.email?.message ?? 'This is your account email.'}
                                slotProps={{ input: { readOnly: true } }}
                            />
                            <TextField
                                label="Phone"
                                type="tel"
                                required
                                autoComplete="tel"
                                {...register('phone', {
                                    required: 'Enter your phone number',
                                    validate: (v) =>
                                        v.replace(/\D/g, '').length >= 7 ||
                                        'Enter a phone number with at least 7 digits',
                                })}
                                error={!!errors.phone}
                                helperText={errors.phone?.message}
                            />
                            <TextField
                                label="Country"
                                placeholder="UK"
                                autoComplete="country-name"
                                {...register('country')}
                                helperText="Defaults to UK if left empty"
                            />
                            <TextField
                                label="State or county"
                                autoComplete="address-level1"
                                {...register('state')}
                            />
                            <TextField
                                label="City"
                                autoComplete="address-level2"
                                {...register('city')}
                            />
                            <TextField
                                label="Street address"
                                autoComplete="street-address"
                                {...register('street')}
                            />
                        </Box>
                    )}

                    {activeStep === 1 && (
                        <Stack spacing={2}>
                            {DOCS.map((doc) => (
                                <DocumentUploadRow
                                    key={doc.key}
                                    id={`doc-${doc.key}`}
                                    title={doc.title}
                                    description={doc.description}
                                    accept={doc.accept}
                                    formats={doc.formats}
                                    icon={doc.icon}
                                    previewImage={doc.previewImage}
                                    file={files[doc.key]}
                                    error={docErrors[doc.key]}
                                    onChange={(file) => setFile(doc.key, file)}
                                    onInvalid={(message) =>
                                        setDocErrors((prev) => ({ ...prev, [doc.key]: message }))
                                    }
                                />
                            ))}
                        </Stack>
                    )}

                    {activeStep === 2 && (
                        <Stack spacing={3}>
                            <Box>
                                <Box
                                    id="onboarding-services"
                                    sx={{ fontWeight: 700, fontSize: font.size.md, mb: 1 }}
                                >
                                    Services you can provide
                                </Box>
                                <SelectableTileGroup
                                    type="checkbox"
                                    aria-labelledby="onboarding-services"
                                    options={SERVICE_OPTIONS}
                                    value={selectedServices}
                                    onChange={(next) => {
                                        setSelectedServices(next);
                                        setServiceError(null);
                                    }}
                                />
                                {serviceError && (
                                    <Box
                                        role="alert"
                                        sx={{
                                            mt: 1,
                                            fontSize: font.size.sm,
                                            fontWeight: 600,
                                            color: color.red700,
                                        }}
                                    >
                                        {serviceError}
                                    </Box>
                                )}
                            </Box>

                            <Box
                                sx={{
                                    border: '1px solid',
                                    borderColor: color.line,
                                    borderRadius: `${radius.md}px`,
                                    overflow: 'hidden',
                                }}
                            >
                                <Box
                                    sx={{
                                        px: 2,
                                        py: 1.25,
                                        bgcolor: color.subtle,
                                        borderBottom: '1px solid',
                                        borderColor: color.line,
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        gap: 1,
                                    }}
                                >
                                    <Box
                                        component="h3"
                                        sx={{ m: 0, fontSize: font.size.md, fontWeight: 700 }}
                                    >
                                        Review your application
                                    </Box>
                                    <Stack direction="row" spacing={0.5}>
                                        <Button size="small" onClick={() => setActiveStep(0)}>
                                            Edit details
                                        </Button>
                                        <Button size="small" onClick={() => setActiveStep(1)}>
                                            Edit documents
                                        </Button>
                                    </Stack>
                                </Box>
                                <Box sx={{ p: 2 }}>
                                    <DataList variant="stacked" columns={2}>
                                        <DataRow
                                            label="Name"
                                            value={`${values.firstName ?? ''} ${values.lastName ?? ''}`.trim()}
                                        />
                                        <DataRow label="Email" value={values.email} />
                                        <DataRow label="Phone" value={values.phone} />
                                        <DataRow label="Address" value={address} />
                                        <DataRow
                                            wide
                                            label="Documents"
                                            value={DOCS.map(
                                                (d) =>
                                                    `${d.title}: ${files[d.key]?.name ?? 'Missing'}`
                                            ).join(' · ')}
                                        />
                                        <DataRow
                                            wide
                                            label="Services"
                                            value={
                                                selectedServices.length
                                                    ? SERVICES.filter((s) =>
                                                          selectedServices.includes(s.id)
                                                      )
                                                          .map((s) => s.name)
                                                          .join(', ')
                                                    : 'None selected yet'
                                            }
                                        />
                                    </DataList>
                                </Box>
                            </Box>
                        </Stack>
                    )}
                </Panel>

                {submitError && (
                    <Alert severity="error" sx={{ mt: 2.5 }} onClose={() => setSubmitError(null)}>
                        {submitError}
                    </Alert>
                )}
            </Box>
        </OnboardingFrame>
    );
}
