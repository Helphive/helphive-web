import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Typography,
    Card,
    CardContent,
    Button,
    CircularProgress,
    Alert,
    Divider,
} from '@mui/material';
import { CheckCircle } from '@mui/icons-material';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { selectBookingFormData, selectPaymentInfo, resetBookingForm } from '@/features/booking/bookingSlice';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

function CheckoutForm({ onSuccess }: { onSuccess: () => void }) {
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
            setError(submitError.message || 'An error occurred');
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
            setError(confirmError.message || 'Payment failed. Please try again.');
            setIsProcessing(false);
        } else {
            onSuccess();
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
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
                sx={{ mt: 3, py: 1.5 }}
            >
                {isProcessing ? <CircularProgress size={24} color="inherit" /> : 'Pay Now'}
            </Button>
        </form>
    );
}

export default function BookingPayment() {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const formData = useAppSelector(selectBookingFormData);
    const paymentInfo = useAppSelector(selectPaymentInfo);
    const [paymentSuccess, setPaymentSuccess] = useState(false);

    useEffect(() => {
        if (!paymentInfo.clientSecret) {
            navigate('/user');
        }
    }, [paymentInfo.clientSecret, navigate]);

    const handlePaymentSuccess = () => {
        setPaymentSuccess(true);
        dispatch(resetBookingForm());
    };

    if (paymentSuccess) {
        return (
            <Box sx={{ textAlign: 'center', py: 8, maxWidth: 600, mx: 'auto' }}>
                <CheckCircle sx={{ fontSize: 80, color: 'success.main', mb: 3 }} />
                <Typography variant="h4" fontWeight={700} sx={{ mb: 2 }}>
                    Payment Successful!
                </Typography>
                <Typography color="text.secondary" sx={{ mb: 4 }}>
                    Your booking has been confirmed. A provider will be assigned shortly.
                </Typography>
                <Button
                    variant="contained"
                    size="large"
                    onClick={() => navigate('/user')}
                    sx={{ px: 6 }}
                >
                    View My Bookings
                </Button>
            </Box>
        );
    }

    if (!paymentInfo.clientSecret) {
        return null;
    }

    const total = formData.rate * formData.hours;
    const platformFee = total * 0.05;

    return (
        <Box>
            <Typography variant="h4" fontWeight={700} sx={{ mb: 4 }}>
                Complete Payment
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 4, maxWidth: 900 }}>
                {/* Order Summary */}
                <Card sx={{ flex: 1, minWidth: 0 }}>
                    <CardContent>
                        <Typography variant="h6" fontWeight={600} sx={{ mb: 3 }}>
                            Order Summary
                        </Typography>

                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                            <Typography color="text.secondary">Service</Typography>
                            <Typography fontWeight={500}>{formData.serviceName}</Typography>
                        </Box>

                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                            <Typography color="text.secondary">Hourly Rate</Typography>
                            <Typography>£{formData.rate}</Typography>
                        </Box>

                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                            <Typography color="text.secondary">Hours</Typography>
                            <Typography>{formData.hours}</Typography>
                        </Box>

                        <Divider sx={{ my: 2 }} />

                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                            <Typography color="text.secondary">Subtotal</Typography>
                            <Typography>£{total.toFixed(2)}</Typography>
                        </Box>

                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                            <Typography color="text.secondary">Platform Fee (5%)</Typography>
                            <Typography>£{platformFee.toFixed(2)}</Typography>
                        </Box>

                        <Divider sx={{ my: 2 }} />

                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="h6" fontWeight={600}>
                                Total
                            </Typography>
                            <Typography variant="h6" fontWeight={600} color="primary">
                                £{(total + platformFee).toFixed(2)}
                            </Typography>
                        </Box>
                    </CardContent>
                </Card>

                {/* Payment Form */}
                <Card sx={{ flex: 1, minWidth: 0 }}>
                    <CardContent>
                        <Typography variant="h6" fontWeight={600} sx={{ mb: 3 }}>
                            Payment Details
                        </Typography>

                        <Elements
                            stripe={stripePromise}
                            options={{
                                clientSecret: paymentInfo.clientSecret,
                                appearance: {
                                    theme: 'stripe',
                                    variables: {
                                        colorPrimary: '#FF5740',
                                        borderRadius: '8px',
                                    },
                                },
                            }}
                        >
                            <CheckoutForm onSuccess={handlePaymentSuccess} />
                        </Elements>
                    </CardContent>
                </Card>
            </Box>
        </Box>
    );
}
