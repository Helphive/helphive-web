import { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { Alert, Box, Button, CircularProgress, Stack, Typography } from '@mui/material';
import { CheckCircle, LockOutlined } from '@mui/icons-material';
import { loadStripe, type Appearance } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import {
    DataList,
    DataRow,
    EmptyState,
    ErrorState,
    Money,
    PageHeader,
    Panel,
    ServiceIcon,
} from '@/components/ui';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import {
    selectBookingFormData,
    selectPaymentInfo,
    resetBookingForm,
} from '@/features/booking/bookingSlice';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { color, font, layout, shadow } from '@/theme/tokens';
import { PLATFORM_FEE_RATE } from '@/utils/format';

const stripeKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
const stripePromise = stripeKey ? loadStripe(stripeKey) : null;

// Stripe renders inside an iframe, so it gets the design tokens through its appearance API.
const appearance: Appearance = {
    theme: 'flat',
    variables: {
        colorPrimary: color.coral600,
        colorText: color.ink900,
        colorTextSecondary: color.ink600,
        colorTextPlaceholder: color.ink500,
        colorBackground: color.surface,
        colorDanger: color.red700,
        fontFamily:
            '"Plus Jakarta Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        fontSizeBase: '14px',
        borderRadius: '6px',
        spacingUnit: '4px',
    },
    rules: {
        '.Input': {
            border: `1px solid ${color.lineStrong}`,
            boxShadow: 'none',
            padding: '12px',
        },
        '.Input:focus': {
            border: `1px solid ${color.ink900}`,
            boxShadow: shadow.focusField,
        },
        '.Input--invalid': { border: `1px solid ${color.red700}`, boxShadow: 'none' },
        '.Label': { fontWeight: '600', color: color.ink700 },
        '.Tab, .Block': { border: `1px solid ${color.line}`, boxShadow: 'none' },
        '.Tab--selected': { border: `1px solid ${color.ink900}`, boxShadow: 'none' },
    },
};

const fonts = [
    {
        cssSrc: 'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap',
    },
];

function CheckoutForm({ total, onSuccess }: { total: number; onSuccess: () => void }) {
    const stripe = useStripe();
    const elements = useElements();
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!stripe || !elements) {
            return;
        }

        setIsProcessing(true);
        setError(null);

        const { error: submitError } = await elements.submit();
        if (submitError) {
            setError(submitError.message || 'Check your card details and try again.');
            setIsProcessing(false);
            return;
        }

        const { error: confirmError } = await stripe.confirmPayment({
            elements,
            confirmParams: {
                return_url: `${window.location.origin}/user`,
            },
            redirect: 'if_required',
        });

        if (confirmError) {
            setError(confirmError.message || 'The payment did not go through. Try again.');
            setIsProcessing(false);
        } else {
            onSuccess();
        }
    };

    return (
        <form onSubmit={handleSubmit} aria-busy={isProcessing}>
            {error && (
                <Alert severity="error" sx={{ mb: 2.5 }}>
                    {error}
                </Alert>
            )}
            <PaymentElement />
            <Button
                type="submit"
                variant="contained"
                fullWidth
                size="large"
                disabled={!stripe || isProcessing}
                startIcon={
                    isProcessing ? <CircularProgress size={16} color="inherit" /> : undefined
                }
                sx={{ mt: 3 }}
            >
                {isProcessing ? (
                    'Processing payment'
                ) : (
                    <>
                        Pay <Money amount={total} />
                    </>
                )}
            </Button>
            <Box role="status" sx={{ mt: 1.5, minHeight: 20 }}>
                {isProcessing ? (
                    <Typography variant="caption">
                        Confirming with your bank. Keep this page open.
                    </Typography>
                ) : (
                    <Stack
                        direction="row"
                        spacing={0.75}
                        sx={{ alignItems: 'center', color: color.ink500 }}
                    >
                        <LockOutlined sx={{ fontSize: 14 }} aria-hidden="true" />
                        <Typography variant="caption">
                            Payments are processed securely by Stripe.
                        </Typography>
                    </Stack>
                )}
            </Box>
        </form>
    );
}

export default function BookingPayment() {
    useDocumentTitle('Payment');
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const formData = useAppSelector(selectBookingFormData);
    const paymentInfo = useAppSelector(selectPaymentInfo);
    const [paid, setPaid] = useState<{ serviceName: string; total: number } | null>(null);

    const subtotal = formData.rate * formData.hours;
    const platformFee = subtotal * PLATFORM_FEE_RATE;
    const total = subtotal + platformFee;

    const handlePaymentSuccess = () => {
        setPaid({ serviceName: formData.serviceName, total });
        dispatch(resetBookingForm());
    };

    if (paid) {
        return (
            <Box sx={{ maxWidth: layout.narrowMaxWidth, mx: 'auto' }}>
                <PageHeader title="Payment received" />
                <Panel>
                    <Stack spacing={2} sx={{ alignItems: 'center', textAlign: 'center', py: 3 }}>
                        <CheckCircle
                            sx={{ fontSize: 48, color: color.green700 }}
                            aria-hidden="true"
                        />
                        <Typography variant="h5" component="p" role="status">
                            Your booking is confirmed
                        </Typography>
                        <Typography color="text.secondary" sx={{ maxWidth: '46ch' }}>
                            We charged <Money amount={paid.total} />
                            {paid.serviceName ? ` for your ${paid.serviceName} booking` : ''}. It
                            stays scheduled until a provider accepts it.
                        </Typography>
                        <Button
                            variant="contained"
                            size="large"
                            onClick={() => navigate('/user?tab=scheduled')}
                        >
                            View my bookings
                        </Button>
                    </Stack>
                </Panel>
            </Box>
        );
    }

    if (!paymentInfo.clientSecret) {
        return (
            <Box sx={{ maxWidth: layout.narrowMaxWidth, mx: 'auto' }}>
                <PageHeader title="Payment" />
                <EmptyState
                    title="There is nothing to pay for yet"
                    description="Start a booking and you will reach payment once the shift is set. Bookings you already created are under Scheduled."
                    action={
                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                            <Button variant="contained" component={RouterLink} to="/user">
                                Book a service
                            </Button>
                            <Button
                                variant="outlined"
                                component={RouterLink}
                                to="/user?tab=scheduled"
                            >
                                View scheduled bookings
                            </Button>
                        </Stack>
                    }
                />
            </Box>
        );
    }

    if (!stripePromise) {
        return (
            <>
                <PageHeader title="Payment" backTo="/user" backLabel="Back to bookings" />
                <ErrorState
                    title="Card payments are unavailable"
                    message="Payment is not set up for this site right now. Your booking is saved; try again later or contact support."
                    action={
                        <Button component={RouterLink} to="/user?tab=scheduled" variant="text">
                            View scheduled bookings
                        </Button>
                    }
                />
            </>
        );
    }

    return (
        <>
            <PageHeader
                title="Complete payment"
                subtitle="Review the order, then pay securely by card."
                backTo="/user"
                backLabel="Back to bookings"
            />

            <Box
                sx={{
                    display: 'grid',
                    gap: { xs: 2.5, md: 3 },
                    gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 1fr) 360px' },
                    alignItems: 'start',
                }}
            >
                <Panel title="Payment details" sx={{ order: { xs: 2, md: 1 } }}>
                    <Elements
                        stripe={stripePromise}
                        options={{
                            clientSecret: paymentInfo.clientSecret,
                            appearance,
                            fonts,
                        }}
                    >
                        <CheckoutForm total={total} onSuccess={handlePaymentSuccess} />
                    </Elements>
                </Panel>

                <Panel
                    title="Order summary"
                    sx={{
                        order: { xs: 1, md: 2 },
                        position: { md: 'sticky' },
                        top: { md: 24 },
                    }}
                >
                    <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', mb: 2 }}>
                        <ServiceIcon serviceId={formData.serviceId ?? undefined} variant="tile" />
                        <Typography variant="subtitle2" component="p">
                            {formData.serviceName || 'Booking'}
                        </Typography>
                    </Stack>
                    <DataList sx={{ '& > div': { py: 0.75 } }}>
                        <DataRow label="Hourly rate" value={<Money amount={formData.rate} />} />
                        <DataRow label="Hours" value={formData.hours} />
                        <DataRow label="Subtotal" value={<Money amount={subtotal} />} />
                        <DataRow
                            label={`Platform fee (${PLATFORM_FEE_RATE * 100}%)`}
                            value={<Money amount={platformFee} />}
                        />
                    </DataList>
                    <Box
                        sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'baseline',
                            mt: 1.5,
                            pt: 2,
                            borderTop: '1px solid',
                            borderColor: 'divider',
                        }}
                    >
                        <Box component="span" sx={{ fontWeight: 700, fontSize: font.size.md }}>
                            Total
                        </Box>
                        <Money amount={total} size="xl" />
                    </Box>
                </Panel>
            </Box>
        </>
    );
}
