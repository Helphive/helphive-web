import React from "react";

const TermsAgreementModal = ({ modalVisible, setModalVisible, setConfirmation }) => {
    if (!modalVisible) return null; // Conditional rendering

    return (
        <div className="modal" style={{ display: modalVisible ? 'block' : 'none', backgroundColor: 'rgba(0, 0, 0, 0.5)', position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1000 }}>
            <div
                className="modal-content"
                style={{
                    backgroundColor: '#ffffff', // Set a default background color
                    padding: '20px',
                    borderRadius: '8px',
                    position: 'absolute',
                    bottom: '0',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '90%',
                    maxWidth: '500px',
                }}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h2 style={{ color: '#333', fontSize: '24px', fontWeight: '600' }}>
                        User Agreement
                    </h2>
                    <button style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '20px' }} onClick={() => setModalVisible(false)}>
                        &times;
                    </button>
                </div>
                <p style={{ color: '#555' }}>
                    I agree that the data related to the account that I have entered will be further verified by HelpHive through services provided by third parties.
                </p>
                <button
                    onClick={() => {
                        setConfirmation(true);
                        setModalVisible(false);
                    }}
                    style={{
                        marginTop: '24px',
                        padding: '10px',
                        backgroundColor: '#007bff', // Default primary color
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        width: '100%',
                        cursor: 'pointer',
                    }}
                >
                    Agree
                </button>
                <button
                    onClick={() => {
                        setConfirmation(false);
                        setModalVisible(false);
                    }}
                    style={{
                        marginTop: '8px',
                        padding: '10px',
                        backgroundColor: 'transparent',
                        color: '#007bff', // Default primary color
                        border: '2px solid #007bff',
                        borderRadius: '5px',
                        width: '100%',
                        cursor: 'pointer',
                    }}
                >
                    Cancel
                </button>
            </div>
        </div>
    );
};

export default TermsAgreementModal;
