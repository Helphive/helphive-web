import React, { useEffect, useState } from "react";
import { useAuthCheck } from "./Hooks/useAuthCheck";
import { deleteRefreshToken, getRefreshToken } from "../secureStore/secureStoreUtility";
import { logOut, selectCurrentRefreshToken, setCredentials } from "../Auth/AuthSlice";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

const Loader = () => (
    <div className="loader">
        <div className="spinner"></div>
    </div>
);

const withAuthCheck = (WrappedComponent) => {
    const WithAuthCheck = (props) => {
        const { userDetails, refetch } = useAuthCheck();
        const [isTokenChecked, setIsTokenChecked] = useState(false);
        const [isLoading, setIsLoading] = useState(true);
    
        const dispatch = useDispatch();
        const navigate = useNavigate();
        const refreshToken = useSelector(selectCurrentRefreshToken);
    
        useEffect(() => {
            const checkRefreshToken = async () => {
                try {
                    const storedRefreshToken = await getRefreshToken();
                    if (storedRefreshToken) {
                        dispatch(setCredentials({ refreshToken: storedRefreshToken }));
                        setIsTokenChecked(true);
                    } else {
                        await deleteRefreshToken();
                        dispatch(logOut());
                        navigate("/login");
                    }
                } catch (error) {
                    console.error("Error refreshing token:", error);
                    await deleteRefreshToken();
                    dispatch(logOut());
                    navigate("/login");
                } finally {
                    setIsLoading(false);
                }
            };
    
            if (!refreshToken && !isTokenChecked) {
                checkRefreshToken();
            } else {
                setIsTokenChecked(true);
            }
        }, [dispatch, navigate, refreshToken]);
    
        useEffect(() => {
            if (!refreshToken && isTokenChecked) {
                navigate("/login");
            }
        }, [refreshToken, isTokenChecked, navigate]);
    
        useEffect(() => {
            refetch().then(() => setIsLoading(false));
        }, [refetch]);
    
        if (isLoading) {
            return (
                <div className="h-full w-full flex justify-center items-center">
                    <Loader />
                </div>
            );
        }
    
        return <WrappedComponent {...props} userDetails={userDetails} />;
    };

    return WithAuthCheck;
};

export default withAuthCheck;
