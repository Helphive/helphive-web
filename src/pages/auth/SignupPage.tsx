import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useSignupMutation } from '@/features/auth/authApi';
import { AuthLinkLine } from './authForm';
import DemoAccounts from './DemoAccounts';
import SignupForm from './SignupForm';

export default function SignupPage() {
    useDocumentTitle('Create account');
    const [signup, { isLoading }] = useSignupMutation();

    return (
        <SignupForm
            title="Create your account"
            subtitle="Sign up to book hospitality services."
            submitLabel="Create account"
            busyLabel="Creating account"
            onRegister={(payload) => signup(payload).unwrap()}
            isLoading={isLoading}
            successTitle="Check your email"
            successMessage="Verify your email address, then sign in to continue."
            alternative={<DemoAccounts context="signup" lead="user" disabled={isLoading} />}
            links={
                <>
                    <AuthLinkLine text="Already have an account?" to="/login" linkText="Sign in" />
                    <AuthLinkLine
                        text="Want to work shifts instead?"
                        to="/provider-signup"
                        linkText="Sign up as a provider"
                    />
                </>
            }
        />
    );
}
