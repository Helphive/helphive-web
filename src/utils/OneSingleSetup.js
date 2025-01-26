// src/utils/OneSignalSetup.js

export const initializeOneSignal = () => {
    // Replace with your OneSignal App ID
    const oneSignalAppId = process.env.REACT_APP_ONESIGNAL_APP_ID;

    // Initialize OneSignal
    window.OneSignal = window.OneSignal || [];
    OneSignal.push(() => {
        OneSignal.init({ appId: oneSignalAppId });
        OneSignal.setLogLevel(6); // Set verbose logging level
    });

    // Request permission for notifications
    OneSignal.push(() => {
        OneSignal.registerForPushNotifications();
    });
};
