import { useNavigate } from 'react-router-dom';
import { useLoginMutation } from '@/features/auth/authApi';
import { setCredentials } from '@/features/auth/authSlice';
import { useAppDispatch } from '@/store/hooks';
import { authErrorMessage } from './authRules';

type StatusMessages = Parameters<typeof authErrorMessage>[1];

/**
 * The one sign-in path for the auth pages: calls the login endpoint, stores the session and
 * goes home. Resolves to null on success, or to the message to show when it fails.
 */
export function useSessionSignIn() {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const [login, { isLoading }] = useLoginMutation();

    const signIn = async (
        credentials: { email: string; password: string },
        messages: StatusMessages
    ): Promise<string | null> => {
        try {
            const result = await login(credentials).unwrap();
            dispatch(
                setCredentials({
                    user: result.user,
                    accessToken: result.accessToken,
                    refreshToken: result.refreshToken,
                })
            );
            navigate('/home');
            return null;
        } catch (err) {
            return authErrorMessage(err, messages);
        }
    };

    return { signIn, isLoading };
}
