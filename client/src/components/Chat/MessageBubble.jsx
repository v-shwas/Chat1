import React from "react";

const MessageBubble = ({ message, isSent }) => {
  const time = new Date(message.createdAt).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div
      style={{
        ...styles.wrapper,
        justifyContent: isSent ? "flex-end" : "flex-start",
        animation: isSent
          ? "slideInRight 0.3s ease forwards"
          : "slideInLeft 0.3s ease forwards",
      }}
    >
      <div
        style={{
          ...styles.bubble,
          ...(isSent ? styles.sent : styles.received),
        }}
      >
        <p style={styles.text}>{message.message}</p>
        <span style={styles.time}>{time}</span>
      </div>
    </div>
  );
};

const styles = {
  wrapper: {
    display: "flex",
    marginBottom: "8px",
    padding: "0 4px",
  },
  bubble: {
    maxWidth: "70%",
    padding: "10px 14px 6px",
    borderRadius: "var(--radius-lg)",
    position: "relative",
  },
  sent: {
    background: "var(--accent-gradient)",
    color: "white",
    borderBottomRightRadius: "4px",
    boxShadow: "0 2px 12px rgba(108, 99, 255, 0.3)",
  },
  received: {
    background: "var(--bg-tertiary)",
    color: "var(--text-primary)",
    borderBottomLeftRadius: "4px",
    border: "1px solid var(--border-color)",
  },
  text: {
    fontSize: "14px",
    lineHeight: "1.5",
    margin: 0,
    wordBreak: "break-word",
  },
  time: {
    display: "block",
    fontSize: "10px",
    opacity: 0.7,
    marginTop: "4px",
    textAlign: "right",
  },
};

export default MessageBubble;
