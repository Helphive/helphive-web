import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { setPushNavigator } from './pushSession';

/** Lets a clicked notification move the open tab to its page through the router, without a reload. */
export default function PushRouteBridge() {
    const navigate = useNavigate();
    useEffect(() => {
        setPushNavigator((path) => navigate(path));
        return () => setPushNavigator(null);
    }, [navigate]);
    return null;
}
