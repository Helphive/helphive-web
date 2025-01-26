import React, { useState, useRef } from "react";
import { useGenerativeChatMutation } from "../../Auth/authApiSlice";

const GenerativeChatPage = () => {
  const [message, setMessage] = useState("");
  const [responses, setResponses] = useState([]);
  const [isBotTyping, setIsBotTyping] = useState(false);
  const chatContainerRef = useRef(null);
  const [generativeChat, { isLoading, error }] = useGenerativeChatMutation();

  const handleSendMessage = async () => {
    if (!message.trim()) return;

    setResponses((prev) => [
      ...prev,
      { user: message, bot: null },
    ]);
    setMessage("");

    try {
      setIsBotTyping(true);

      const response = await generativeChat({ message }).unwrap();

      if (response && response.message) {
        setTimeout(() => {
          setResponses((prev) => [
            ...prev.slice(0, prev.length - 1),
            { user: message, bot: response.message },
          ]);
          setIsBotTyping(false);
        }, 1000);
      } else {
        console.error("Invalid response format:", response);
      }
    } catch (err) {
      setIsBotTyping(false);
      console.error("Error sending message:", err);
    }
  };

  React.useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [responses]);

  return (
    <div style={styles.container}>
      <h2>Generative Chat</h2>
      <div ref={chatContainerRef} style={styles.chatContainer}>
        {responses.length === 0 ? (
          <p>No messages yet. Start the conversation!</p>
        ) : (
          responses.map((res, idx) => (
            <div key={idx} style={styles.messageContainer}>
              {res.user && (
                <div style={styles.userMessage}>
                  <strong>You:</strong> {res.user}
                </div>
              )}
              {res.bot && (
                <div style={styles.botMessage}>
                  <strong>Bot:</strong> {res.bot}
                </div>
              )}
            </div>
          ))
        )}
        {isBotTyping && (
          <div style={styles.botMessage}>
            <strong>System:</strong> <span style={styles.typing}>...</span>
          </div>
        )}
      </div>
      <div style={styles.inputContainer}>
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your message..."
          style={styles.input}
        />
        <button
          onClick={handleSendMessage}
          disabled={isLoading}
          style={styles.sendButton}
        >
          {isLoading ? "Sending..." : "Send"}
        </button>
      </div>
      {error && (
        <div style={styles.error}>
          <strong>Error:</strong> {error.message}
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    padding: "20px",
    maxWidth: "600px",
    margin: "0 auto",
    fontFamily: "'Roboto', sans-serif",
  },
  chatContainer: {
    border: "1px solid #ccc",
    borderRadius: "8px",
    padding: "10px",
    marginBottom: "10px",
    height: "300px",
    overflowY: "auto",
    backgroundColor: "#f9f9f9",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  messageContainer: {
    marginBottom: "10px",
  },
  userMessage: {
    backgroundColor: "#d1e7dd",
    padding: "8px",
    borderRadius: "5px",
    color: "#000",
    maxWidth: "75%",
    alignSelf: "flex-start",
  },
  botMessage: {
    backgroundColor: "#f8d7da",
    padding: "8px",
    borderRadius: "5px",
    color: "#721c24",
    maxWidth: "75%",
    alignSelf: "flex-end",
  },
  typing: {
    animation: "typing 1.5s infinite",
  },
  inputContainer: {
    display: "flex",
    gap: "10px",
  },
  input: {
    flex: 1,
    padding: "10px",
    borderRadius: "4px",
    border: "1px solid #ccc",
    fontSize: "16px",
  },
  sendButton: {
    padding: "10px 20px",
    border: "none",
    borderRadius: "4px",
    backgroundColor: "#007bff",
    color: "#fff",
    cursor: "pointer",
    fontSize: "16px",
  },
  error: {
    color: "red",
    marginTop: "10px",
  },
};

export default GenerativeChatPage;
