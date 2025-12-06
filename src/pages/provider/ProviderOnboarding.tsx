import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Typography,
    Card,
    CardContent,
    TextField,
    Button,
    Checkbox,
    FormControlLabel,
    CircularProgress,
    Alert,
    Avatar,
    IconButton,
    Stepper,
    Step,
    StepLabel,
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import {
    CloudUpload,
    Person,
    Description,
    Badge,
    CheckCircle,
} from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import { useRequestProviderAccountMutation } from '@/features/provider/providerApi';
import { useAppSelector } from '@/store/hooks';
import { selectCurrentUser } from '@/features/auth/authSlice';
import { SERVICES } from '@/types';

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

const steps = ['Personal Info', 'Documents', 'Services'];

export default function ProviderOnboarding() {
    const navigate = useNavigate();
    const user = useAppSelector(selectCurrentUser);
    const [activeStep, setActiveStep] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    // File states
    const [idDocument, setIdDocument] = useState<File | null>(null);
    const [dbsDocument, setDbsDocument] = useState<File | null>(null);
    const [resume, setResume] = useState<File | null>(null);
    const [profilePhoto, setProfilePhoto] = useState<File | null>(null);
    const [profilePreview, setProfilePreview] = useState<string | null>(null);

    // Service selections
    const [selectedServices, setSelectedServices] = useState<number[]>([]);

    const [submitApplication, { isLoading }] = useRequestProviderAccountMutation();

    const {
        register,
        handleSubmit,
        formState: { errors },
        getValues,
        setValue,
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

    const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setProfilePhoto(file);
            setProfilePreview(URL.createObjectURL(file));
        }
    };

    const handleNext = () => {
        if (activeStep === 0) {
            // Validate personal info
            const values = getValues();
            if (!values.firstName || !values.lastName || !values.email || !values.phone) {
                setError('Please fill in all required fields');
                return;
            }
        } else if (activeStep === 1) {
            // Validate documents
            if (!idDocument || !dbsDocument || !resume || !profilePhoto) {
                setError('Please upload all required documents');
                return;
            }
        }
        setError(null);
        setActiveStep((prev) => prev + 1);
    };

    const handleBack = () => {
        setActiveStep((prev) => prev - 1);
    };

    const onSubmit = async (data: OnboardingFormData) => {
        if (selectedServices.length === 0) {
            setError('Please select at least one service type');
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

        if (idDocument) formData.append('id', idDocument);
        if (dbsDocument) formData.append('dbs', dbsDocument);
        if (resume) formData.append('resume', resume);
        if (profilePhoto) formData.append('profile', profilePhoto);

        formData.append('publicAreaAttendant', String(selectedServices.includes(1)));
        formData.append('roomAttendant', String(selectedServices.includes(2)));
        formData.append('linenPorter', String(selectedServices.includes(3)));

        try {
            setError(null);
            await submitApplication(formData).unwrap();
            setSuccess(true);
        } catch (err) {
            const error = err as { data?: { message?: string } };
            setError(error.data?.message || 'Failed to submit application. Please try again.');
        }
    };

    if (success) {
        return (
            <Box
                sx={{
                    minHeight: '100vh',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: 'background.default',
                    p: 3,
                }}
            >
                <Card sx={{ maxWidth: 500, textAlign: 'center' }}>
                    <CardContent sx={{ py: 6 }}>
                        <CheckCircle sx={{ fontSize: 80, color: 'success.main', mb: 3 }} />
                        <Typography variant="h4" fontWeight={700} sx={{ mb: 2 }}>
                            Application Submitted!
                        </Typography>
                        <Typography color="text.secondary" sx={{ mb: 4 }}>
                            Your provider application has been submitted for review. We'll notify
                            you once it's been processed.
                        </Typography>
                        <Button
                            variant="contained"
                            size="large"
                            onClick={() => navigate('/provider/pending')}
                            sx={{ px: 6 }}
                        >
                            Continue
                        </Button>
                    </CardContent>
                </Card>
            </Box>
        );
    }

    return (
        <Box
            sx={{
                minHeight: '100vh',
                bgcolor: 'background.default',
                py: 4,
            }}
        >
            <Box sx={{ maxWidth: 800, mx: 'auto', px: 3 }}>
                <Typography variant="h4" fontWeight={700} textAlign="center" sx={{ mb: 2 }}>
                    Complete Your Profile
                </Typography>
                <Typography color="text.secondary" textAlign="center" sx={{ mb: 4 }}>
                    Submit your documents to start accepting jobs on HelpHive
                </Typography>

                <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
                    {steps.map((label) => (
                        <Step key={label}>
                            <StepLabel>{label}</StepLabel>
                        </Step>
                    ))}
                </Stepper>

                {error && (
                    <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
                        {error}
                    </Alert>
                )}

                <Card>
                    <CardContent sx={{ p: 4 }}>
                        <form onSubmit={handleSubmit(onSubmit)}>
                            {/* Step 1: Personal Info */}
                            {activeStep === 0 && (
                                <Box>
                                    <Typography variant="h6" fontWeight={600} sx={{ mb: 3 }}>
                                        Personal Information
                                    </Typography>
                                    <Grid container spacing={3}>
                                        <Grid size={{ xs: 12, sm: 6 }}>
                                            <TextField
                                                fullWidth
                                                label="First Name"
                                                {...register('firstName', {
                                                    required: 'First name is required',
                                                })}
                                                error={!!errors.firstName}
                                                helperText={errors.firstName?.message}
                                            />
                                        </Grid>
                                        <Grid size={{ xs: 12, sm: 6 }}>
                                            <TextField
                                                fullWidth
                                                label="Last Name"
                                                {...register('lastName', {
                                                    required: 'Last name is required',
                                                })}
                                                error={!!errors.lastName}
                                                helperText={errors.lastName?.message}
                                            />
                                        </Grid>
                                        <Grid size={{ xs: 12, sm: 6 }}>
                                            <TextField
                                                fullWidth
                                                label="Email"
                                                type="email"
                                                {...register('email', {
                                                    required: 'Email is required',
                                                })}
                                                error={!!errors.email}
                                                helperText={errors.email?.message}
                                                slotProps={{
                                                    input: {
                                                        readOnly: true,
                                                    },
                                                }}
                                                sx={{
                                                    '& .MuiInputBase-input': {
                                                        bgcolor: 'action.hover',
                                                    },
                                                }}
                                            />
                                        </Grid>
                                        <Grid size={{ xs: 12, sm: 6 }}>
                                            <TextField
                                                fullWidth
                                                label="Phone"
                                                {...register('phone', {
                                                    required: 'Phone is required',
                                                })}
                                                error={!!errors.phone}
                                                helperText={errors.phone?.message}
                                            />
                                        </Grid>
                                        <Grid size={{ xs: 12, sm: 6 }}>
                                            <TextField fullWidth label="Country" {...register('country')} />
                                        </Grid>
                                        <Grid size={{ xs: 12, sm: 6 }}>
                                            <TextField fullWidth label="State/County" {...register('state')} />
                                        </Grid>
                                        <Grid size={{ xs: 12, sm: 6 }}>
                                            <TextField fullWidth label="City" {...register('city')} />
                                        </Grid>
                                        <Grid size={{ xs: 12, sm: 6 }}>
                                            <TextField fullWidth label="Street Address" {...register('street')} />
                                        </Grid>
                                    </Grid>
                                </Box>
                            )}

                            {/* Step 2: Documents */}
                            {activeStep === 1 && (
                                <Box>
                                    <Typography variant="h6" fontWeight={600} sx={{ mb: 3 }}>
                                        Required Documents
                                    </Typography>

                                    {/* Profile Photo */}
                                    <Box sx={{ textAlign: 'center', mb: 4 }}>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            id="profile-upload"
                                            hidden
                                            onChange={handleProfileChange}
                                        />
                                        <label htmlFor="profile-upload">
                                            <IconButton component="span">
                                                <Avatar
                                                    src={profilePreview || undefined}
                                                    sx={{
                                                        width: 120,
                                                        height: 120,
                                                        bgcolor: 'primary.main',
                                                    }}
                                                >
                                                    {!profilePreview && <Person sx={{ fontSize: 48 }} />}
                                                </Avatar>
                                            </IconButton>
                                        </label>
                                        <Typography variant="body2" color="text.secondary">
                                            Upload Profile Photo *
                                        </Typography>
                                    </Box>

                                    <Grid container spacing={3}>
                                        {/* ID Document */}
                                        <Grid size={{ xs: 12, sm: 6 }}>
                                            <Card
                                                variant="outlined"
                                                sx={{
                                                    p: 3,
                                                    textAlign: 'center',
                                                    borderStyle: 'dashed',
                                                    cursor: 'pointer',
                                                    borderColor: idDocument ? 'success.main' : 'divider',
                                                }}
                                                component="label"
                                            >
                                                <input
                                                    type="file"
                                                    accept="image/*,.pdf"
                                                    hidden
                                                    onChange={(e) => setIdDocument(e.target.files?.[0] || null)}
                                                />
                                                {idDocument ? (
                                                    <CheckCircle color="success" sx={{ fontSize: 40 }} />
                                                ) : (
                                                    <Badge sx={{ fontSize: 40, color: 'text.secondary' }} />
                                                )}
                                                <Typography sx={{ mt: 1 }}>
                                                    {idDocument ? idDocument.name : 'ID Document *'}
                                                </Typography>
                                            </Card>
                                        </Grid>

                                        {/* DBS Document */}
                                        <Grid size={{ xs: 12, sm: 6 }}>
                                            <Card
                                                variant="outlined"
                                                sx={{
                                                    p: 3,
                                                    textAlign: 'center',
                                                    borderStyle: 'dashed',
                                                    cursor: 'pointer',
                                                    borderColor: dbsDocument ? 'success.main' : 'divider',
                                                }}
                                                component="label"
                                            >
                                                <input
                                                    type="file"
                                                    accept="image/*,.pdf"
                                                    hidden
                                                    onChange={(e) => setDbsDocument(e.target.files?.[0] || null)}
                                                />
                                                {dbsDocument ? (
                                                    <CheckCircle color="success" sx={{ fontSize: 40 }} />
                                                ) : (
                                                    <Description sx={{ fontSize: 40, color: 'text.secondary' }} />
                                                )}
                                                <Typography sx={{ mt: 1 }}>
                                                    {dbsDocument ? dbsDocument.name : 'DBS Certificate *'}
                                                </Typography>
                                            </Card>
                                        </Grid>

                                        {/* Resume */}
                                        <Grid size={{ xs: 12 }}>
                                            <Card
                                                variant="outlined"
                                                sx={{
                                                    p: 3,
                                                    textAlign: 'center',
                                                    borderStyle: 'dashed',
                                                    cursor: 'pointer',
                                                    borderColor: resume ? 'success.main' : 'divider',
                                                }}
                                                component="label"
                                            >
                                                <input
                                                    type="file"
                                                    accept=".pdf,.doc,.docx"
                                                    hidden
                                                    onChange={(e) => setResume(e.target.files?.[0] || null)}
                                                />
                                                {resume ? (
                                                    <CheckCircle color="success" sx={{ fontSize: 40 }} />
                                                ) : (
                                                    <CloudUpload sx={{ fontSize: 40, color: 'text.secondary' }} />
                                                )}
                                                <Typography sx={{ mt: 1 }}>
                                                    {resume ? resume.name : 'Upload Resume/CV *'}
                                                </Typography>
                                            </Card>
                                        </Grid>
                                    </Grid>
                                </Box>
                            )}

                            {/* Step 3: Services */}
                            {activeStep === 2 && (
                                <Box>
                                    <Typography variant="h6" fontWeight={600} sx={{ mb: 3 }}>
                                        Select Your Services
                                    </Typography>
                                    <Typography color="text.secondary" sx={{ mb: 3 }}>
                                        Choose the services you're qualified to provide:
                                    </Typography>

                                    {SERVICES.map((service) => (
                                        <FormControlLabel
                                            key={service.id}
                                            control={
                                                <Checkbox
                                                    checked={selectedServices.includes(service.id)}
                                                    onChange={() => {
                                                        setSelectedServices((prev) =>
                                                            prev.includes(service.id)
                                                                ? prev.filter((id) => id !== service.id)
                                                                : [...prev, service.id]
                                                        );
                                                    }}
                                                />
                                            }
                                            label={
                                                <Box>
                                                    <Typography fontWeight={500}>{service.name}</Typography>
                                                    <Typography variant="body2" color="text.secondary">
                                                        {service.description}
                                                    </Typography>
                                                </Box>
                                            }
                                            sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}
                                        />
                                    ))}
                                </Box>
                            )}

                            {/* Navigation Buttons */}
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
                                <Button
                                    onClick={handleBack}
                                    disabled={activeStep === 0}
                                    sx={{ visibility: activeStep === 0 ? 'hidden' : 'visible' }}
                                >
                                    Back
                                </Button>
                                {activeStep < steps.length - 1 ? (
                                    <Button variant="contained" onClick={handleNext}>
                                        Continue
                                    </Button>
                                ) : (
                                    <Button
                                        type="submit"
                                        variant="contained"
                                        disabled={isLoading}
                                        sx={{ px: 4 }}
                                    >
                                        {isLoading ? (
                                            <CircularProgress size={24} color="inherit" />
                                        ) : (
                                            'Submit Application'
                                        )}
                                    </Button>
                                )}
                            </Box>
                        </form>
                    </CardContent>
                </Card>
            </Box>
        </Box>
    );
}
