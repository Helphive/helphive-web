// src/Components/ProtectedRoute.js
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';

const ProtectedRoute = ({ children }) => {
    const isAuthenticated = useSelector((state) => state.auth.isAuthenticated); // Check if the user is authenticated
    const location = useLocation(); // Get the current location

    // If the user is not authenticated, redirect to login page and preserve the current location
    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // If authenticated, render the child component
    return children;
};

export default ProtectedRoute;
