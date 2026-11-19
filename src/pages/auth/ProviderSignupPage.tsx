import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useProviderSignupMutation } from '@/features/auth/authApi';
import { AuthLinkLine } from './authForm';
import SignupForm from './SignupForm';

export default function ProviderSignupPage() {
    useDocumentTitle('Become a provider');
    const [signup, { isLoading }] = useProviderSignupMutation();

    return (
        <SignupForm
            title="Become a provider"
            subtitle="Join HelpHive and start earning."
            submitLabel="Create provider account"
            busyLabel="Creating account"
            onRegister={(payload) => signup(payload).unwrap()}
            isLoading={isLoading}
            successTitle="Check your email"
            successMessage="After you verify it, sign in to complete provider onboarding."
            links={
                <>
                    <AuthLinkLine text="Already have an account?" to="/login" linkText="Sign in" />
                    <AuthLinkLine
                        text="Want to book services instead?"
                        to="/signup"
                        linkText="Sign up as a customer"
                    />
                </>
            }
        />
    );
}
