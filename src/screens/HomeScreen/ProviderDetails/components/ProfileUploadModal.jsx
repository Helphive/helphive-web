import React, { useState } from "react";

const ProfileUploadPage: React.FC = () => {
    // Specify the type for document as File | null
    const [document, setDocument] = useState<File | null>(null);
    const [isOpen, setIsOpen] = useState(true); // Modal open state
    const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB limit

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            if (file.size > MAX_FILE_SIZE_BYTES) {
                console.log("File size exceeds 10MB limit."); // Replace alert with console log
            } else {
                setDocument(file);
                console.log("File selected:", file.name); // Log file selection
            }
        }
    };

    const handleUpload = () => {
        if (document) {
            console.log("Document uploaded:", document.name); // Log upload action
            setIsOpen(false); // Close modal after upload
        } else {
            console.log("No document selected for upload."); // Log if no document is selected
        }
    };

    return (
        <>
            {isOpen && (
                <div className="modal" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)', zIndex: 1000 }}>
                    <div className="modal-content" style={{ padding: '20px', backgroundColor: '#fff', borderRadius: '8px', width: '90%', maxWidth: '500px' }}>
                        <span className="close" onClick={() => setIsOpen(false)} style={{ cursor: 'pointer', fontSize: '20px', float: 'right' }}>&times;</span>
                        <h2 style={{ color: '#333', fontSize: '24px', fontWeight: '600' }}>
                            Upload Document
                        </h2>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            style={{ margin: '10px 0', padding: '10px', borderRadius: '5px', border: '1px solid #ccc', width: '100%' }}
                        />
                        <button onClick={handleUpload} style={{ marginTop: '20px', padding: '10px 15px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '5px', width: '100%' }}>
                            Upload
                        </button>
                    </div>
                </div>
            )}
        </>
    );
};

export default ProfileUploadPage;
