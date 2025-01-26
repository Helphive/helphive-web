import React, { useState, useEffect, useCallback } from 'react';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';

const SelectLocationModal = ({ visible, onClose, onSelectLocation }) => {
    const [selectedLocation, setSelectedLocation] = useState(null);
    const [currentLocation, setCurrentLocation] = useState(null);
    const [errorMessage, setErrorMessage] = useState(null);  // To display errors

    const mapStyles = {
        height: "80vh",
        width: "100%",
    };

    const defaultCenter = currentLocation || {
        lat: 31.5497,
        lng: 74.3436,
    };

    const mapRef = React.useRef();

    // Get the user's current location when the modal is visible
    useEffect(() => {
        if (visible && navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    setCurrentLocation({ lat: latitude, lng: longitude });
                },
                () => alert('Unable to retrieve your location')
            );
        }
    }, [visible]);

    const handleMapClick = useCallback((event) => {
        const { latLng } = event;
        const lat = latLng.lat();
        const lng = latLng.lng();
        console.log(lat);
        console.log(lng);
        setSelectedLocation({ lat, lng });
        setErrorMessage(null);  // Reset error if a valid location is selected
    }, []);

    const handleSelectLocation = () => {
        if (selectedLocation) {
            // Validate the coordinates before passing them
            if (!selectedLocation.lat || !selectedLocation.lng) {
                setErrorMessage("Invalid coordinates selected.");
            } else {
                setErrorMessage(null);
                console.log(selectedLocation)
                onSelectLocation({latitude: selectedLocation.lat, longitude: selectedLocation.lng }); // Pass coordinates to parent
                onClose();
            }
        } else {
            setErrorMessage("Please select a location on the map.");
        }
    };

    if (!visible) {
        return null;
    }

    return (
        <div>
            <style>
                {`
                    .modal-overlay {
                        position: fixed;
                        top: 0;
                        left: 0;
                        right: 0;
                        bottom: 0;
                        background: rgba(0, 0, 0, 0.5);
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        z-index: 1000;
                    }

                    .modal-content {
                        background: #fff;
                        border-radius: 8px;
                        padding: 20px;
                        width: 90%;
                        max-width: 600px;
                        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                    }

                    .modal-actions {
                        margin-top: 10px;
                        display: flex;
                        justify-content: space-between;
                    }

                    .primary-button {
                        background-color: #007bff;
                        color: white;
                        padding: 10px 15px;
                        border: none;
                        border-radius: 4px;
                        cursor: pointer;
                    }

                    .primary-button:hover {
                        background-color: #0056b3;
                    }

                    .secondary-button {
                        background-color: #f8f9fa;
                        color: #333;
                        padding: 10px 15px;
                        border: none;
                        border-radius: 4px;
                        cursor: pointer;
                    }

                    .secondary-button:hover {
                        background-color: #e2e6ea;
                    }

                    .error-message {
                        color: red;
                        font-size: 14px;
                        margin-top: 10px;
                    }
                `}
            </style>
            <div className="modal-overlay">
                <div className="modal-content">
                    <LoadScript googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
                        <GoogleMap
                            mapContainerStyle={mapStyles}
                            zoom={13}
                            center={defaultCenter}
                            onClick={handleMapClick}
                            onLoad={(map) => (mapRef.current = map)}
                        >
                            {selectedLocation && (
                                <Marker position={selectedLocation} />
                            )}
                        </GoogleMap>
                    </LoadScript>
                    {errorMessage && <div className="error-message">{errorMessage}</div>}
                    <div className="modal-actions">
                        <button className="primary-button" onClick={handleSelectLocation}>
                            Select Location
                        </button>
                        <button className="secondary-button" onClick={onClose}>
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SelectLocationModal;
