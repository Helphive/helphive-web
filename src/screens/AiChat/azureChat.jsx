import React, { useState, useRef, useEffect } from "react";
import { useAzureChatMutation } from "../../Auth/authApiSlice";
import Header from "../HomeScreen/Header/UserHead";
import { AlignHorizontalCenter, BorderColor } from "@mui/icons-material";

const AzureChatPage = () => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([
    {
      role: "system",
      content:
        "The Helphive chat page connects users with a context-aware AI assistant tailored to provide expert advice on service needs. For example, if a user asks, I want to build a room in my backyard. How many workers do I need, and for how long? the assistant might respond, You’ll need 3–4 skilled workers (carpenter, mason, laborers) for about 7–10 days, along with materials like bricks, cement, and roofing supplies. Permits may also be required. Similarly, inquiries like How many people are needed to deep clean my 3-bedroom apartment? will yield tailored responses such as 2–3 professionals for 4–6 hours, with necessary equipment provided. This ensures users get precise advice aligned with Helphive’s service offerings, simplifying decision-making and connecting them with the right providers.",
    },
  ]);
  const [isBotTyping, setIsBotTyping] = useState(false);
  const chatContainerRef = useRef(null);
  const [azureChat, { isLoading, error }] = useAzureChatMutation();

  const commonQueries = [
    "How many workers are needed for a 2-floor building?",
    "What is the cost of deep cleaning a 3-bedroom apartment?",
    "What are the available services in my area?",
    "How do I get started with Helphive services?",
    "Can I get a quote for repairing a plumbing issue?",
  ];

  const handleSendMessage = async () => {
    if (!message.trim()) return;

    const newMessages = [
      ...messages,
      {
        role: "user",
        content: message,
      },
    ];
    setMessages(newMessages);
    setMessage("");

    try {
      setIsBotTyping(true);

      const response = await azureChat({ messages: newMessages }).unwrap();
      if (response && response.message) {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: response.message,
          },
        ]);
      }
      setIsBotTyping(false);
    } catch (err) {
      setIsBotTyping(false);
      console.error("Error communicating with Azure Chat:", err);
    }
  };

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, isBotTyping]);

  return (
    <div style={styles.pageContainer}>
      <Header />

      <div style={styles.mainContainer}>
        <div style={styles.sidebar}>
          <h3 style={styles.sidebarHeader}>Common Queries</h3>
          <ul style={styles.queryList}>
            {commonQueries.map((query, idx) => (
              <li
                key={idx}
                style={styles.queryItem}
                onClick={() => setMessage(query)}
              >
                {query}
              </li>
            ))}
          </ul>
        </div>

        <div style={styles.chatSection}>
          <h2 style={styles.header}>Helphive Chat Assistant</h2>

          <div ref={chatContainerRef} style={styles.chatContainer}>
            {messages
              .filter((msg) => msg.role !== "system")
              .map((msg, idx) => (
                <div
                  key={idx}
                  style={msg.role === "user" ? styles.userMessage : styles.botMessage}
                >
                  <strong>{msg.role === "user" ? "You" : "Assistant"}:</strong>{" "}
                  {msg.content}
                </div>
              ))}
            {isBotTyping && (
              <div style={styles.botMessage}>
                <strong>Assistant:</strong> <span style={styles.typingIndicator}>...</span>
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
              disabled={isBotTyping || isLoading}
            />
            <button
              onClick={handleSendMessage}
              style={styles.sendButton}
              disabled={isBotTyping || isLoading}
            >
              {isBotTyping || isLoading ? "Sending..." : "Send"}
            </button>
          </div>

          {error && <div style={styles.error}>Error: {error.message}</div>}
        </div>
      </div>
    </div>
  );
};

const styles = {
  pageContainer: {
    display: "flex",
    flexDirection: "column",
    fontFamily: "'Roboto', sans-serif",
    height: "100vh",
  },
  mainContainer: {
    display: "flex",
    flex: 1,
    marginTop: "80px",
  },
  sidebar: {
    width: "25%",
    backgroundColor: "#f1f1f1",
    padding: "20px",
    borderRight: "1px solid #ccc",
  },
  sidebarHeader: {
    fontSize: "18px",
    marginBottom: "15px",
  },
  queryList: {
    listStyleType: "none",
    padding: 0,
  },
  queryItem: {
    padding: "10px",
    borderBottom: "1px solid #ddd",
    cursor: "pointer",
    fontSize: "16px",
    color: "orange",
  },
  chatSection: {
    width: "75%",
    padding: "20px",
    display: "flex",
    flexDirection: "column",
  },
  header: {
    textAlign: "center",
    marginBottom: "20px",
    color: "#333",
  },
  chatContainer: {
    flex: 1,
    border: "1px solid #ccc",
    borderRadius: "8px",
    padding: "10px",
    overflowY: "auto",
    backgroundColor: "#f9f9f9",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  userMessage: {
    alignSelf: "flex-end",
    backgroundColor: "orange",
    padding: "10px",
    borderRadius: "20px",
    border: "2px solid black",
    maxWidth: "75%",
    wordWrap: "break-word",
  },
  botMessage: {
    alignSelf: "flex-start",
    backgroundColor: "transparent",
    padding: "10px",
    borderRadius: "20px",
    border: "2px solid black",
    maxWidth: "75%",
    wordWrap: "break-word",
  },
  inputContainer: {
    display: "flex",
    gap: "10px",
    marginTop: "20px",
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
    backgroundColor: "orange",
    color: "#fff",
    cursor: "pointer",
    fontSize: "16px",
  },
  error: {
    color: "red",
    marginTop: "10px",
  },
  pageContainer: {
    display: "flex",
    flexDirection: "column",
    fontFamily: "'Roboto', sans-serif",
    height: "100vh",
    background: "linear-gradient(135deg, #FF6F00, #FFB300, #FF3D00)",
    backgroundSize: "cover",
    backgroundPosition: "center",
  },
};

export default AzureChatPage;
