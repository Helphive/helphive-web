import React from "react";

type Props = {
    modalVisible: boolean;
    setModalVisible: React.Dispatch<React.SetStateAction<boolean>>;
    setDocument: React.Dispatch<React.SetStateAction<File | null>>;
};

const UploadModal: React.FC<Props> = ({ modalVisible, setModalVisible, setDocument }) => {
    const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB limit

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            if (file.size > MAX_FILE_SIZE_BYTES) {
                alert("File size exceeds 10MB limit.");
            } else {
                setDocument(file);
                alert(`File selected: ${file.name}`);
                setModalVisible(false); // Close modal after file selection
            }
        }
    };

    return (
        <div
            style={{
                display: modalVisible ? "block" : "none",
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: "rgba(0, 0, 0, 0.5)",
                justifyContent: "center",
                alignItems: "center",
                zIndex: 1000,
            }}
        >
            <div
                style={{
                    backgroundColor: "#fff",
                    padding: "20px",
                    borderRadius: "8px",
                    textAlign: "center",
                }}
            >
                <h2>Upload Document</h2>
                <input
                    type="file"
                    accept=".pdf"
                    onChange={handleFileChange}
                    style={{ margin: "10px 0", padding: "10px", borderRadius: "5px" }}
                />
                <br />
                <button onClick={() => setModalVisible(false)} style={{ marginTop: "20px" }}>
                    Cancel
                </button>
            </div>
        </div>
    );
};

export default UploadModal;
