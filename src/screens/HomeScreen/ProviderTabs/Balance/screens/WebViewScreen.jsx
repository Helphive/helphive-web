import React from "react";
import { useNavigate, useLocation } from "react-router-dom"; // React Router for navigation

const WebViewScreen = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { url, title } = location.state || {}; // Assuming data passed via location.state

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      {/* Header */}
      <div style={styles.header}>
        <button style={styles.backButton} onClick={() => navigate(-1)}>
          &#x2190; {/* Left arrow symbol */}
        </button>
        <h1 style={styles.title}>{title}</h1>
      </div>
      
      {/* WebView */}
      <div style={styles.webViewContainer}>
        {url && (
          <iframe
            src={url}
            style={styles.webView}
            title={title}
          />
        )}
      </div>
    </div>
  );
};

const styles = {
  header: {
    display: "flex",
    alignItems: "center",
    padding: "10px 20px",
    backgroundColor: "#333",
    color: "white",
  },
  backButton: {
    background: "none",
    border: "none",
    fontSize: "24px",
    color: "white",
    cursor: "pointer",
  },
  title: {
    marginLeft: "10px",
    fontSize: "20px",
    fontWeight: "bold",
    flex: 1,
  },
  webViewContainer: {
    flex: 1,
    padding: 0,
    margin: 0,
  },
  webView: {
    width: "100%",
    height: "100%",
    border: "none",
  },
};

export default WebViewScreen;
