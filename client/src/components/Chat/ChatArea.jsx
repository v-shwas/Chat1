import React, { useState, useEffect, useRef } from "react";
import useChatStore from "../../store/useChatStore";
import useAuthStore from "../../store/useAuthStore";
import useSocketStore from "../../store/useSocketStore";
import MessageBubble from "./MessageBubble";

const ChatArea = () => {
  const {
    selectedUser,
    messages,
    isMessagesLoading,
    sendMessage,
    subscribeToMessages,
    unsubscribeFromMessages,
  } = useChatStore();
  const { authUser } = useAuthStore();
  const { socket, onlineUsers } = useSocketStore();
  const [text, setText] = useState("");
  const messagesEndRef = useRef(null);

  // Subscribe to real-time messages
  useEffect(() => {
    if (selectedUser && socket) {
      subscribeToMessages(socket);
    }
    return () => {
      unsubscribeFromMessages(socket);
    };
  }, [selectedUser, socket]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    await sendMessage({ message: text.trim() });
    setText("");
  };

  // Empty state when no user is selected
  if (!selectedUser) {
    return (
      <div style={styles.emptyWrapper}>
        <div style={styles.emptyContent} className="animate-fade-in-up">
          <div style={styles.emptyIconOuter}>
            <div style={styles.emptyIcon}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </div>
          </div>
          <h2 style={styles.emptyTitle}>Welcome to ChatFlow</h2>
          <p style={styles.emptySubtitle}>
            Select a conversation from the sidebar to start messaging
          </p>
        </div>
      </div>
    );
  }

  const isOnline = onlineUsers.includes(selectedUser._id);

  return (
    <div style={styles.chatContainer}>
      {/* Chat Header */}
      <div style={styles.chatHeader}>
        <div style={styles.chatHeaderLeft}>
          <div style={styles.headerAvatarContainer}>
            <img
              src={
                selectedUser.profilePic ||
                `https://api.dicebear.com/7.x/initials/svg?seed=${selectedUser.fullname}`
              }
              alt={selectedUser.fullname}
              style={styles.headerAvatar}
            />
            <span
              style={{
                ...styles.headerStatusDot,
                background: isOnline ? "var(--success)" : "var(--text-muted)",
                boxShadow: isOnline
                  ? "0 0 8px rgba(16, 185, 129, 0.6)"
                  : "none",
              }}
            />
          </div>
          <div>
            <h3 style={styles.headerName}>{selectedUser.fullname}</h3>
            <span style={{
              ...styles.headerStatus,
              color: isOnline ? "var(--success)" : "var(--text-muted)",
            }}>
              {isOnline ? "Online" : "Offline"}
            </span>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div style={styles.messagesArea}>
        {isMessagesLoading ? (
          <div style={styles.loadingMessages}>
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                style={{
                  ...styles.msgSkeleton,
                  alignSelf: i % 2 === 0 ? "flex-end" : "flex-start",
                  width: `${Math.random() * 30 + 20}%`,
                }}
              />
            ))}
          </div>
        ) : messages.length === 0 ? (
          <div style={styles.noMessages}>
            <p style={styles.noMessagesText}>
              No messages yet. Say hello! 👋
            </p>
          </div>
        ) : (
          messages.map((msg) => (
            <MessageBubble
              key={msg._id}
              message={msg}
              isSent={msg.senderId === authUser?._id}
            />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <form onSubmit={handleSend} style={styles.inputArea}>
        <div style={styles.inputContainer}>
          <input
            type="text"
            placeholder="Type a message..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            style={styles.messageInput}
          />
          <button
            type="submit"
            disabled={!text.trim()}
            style={{
              ...styles.sendBtn,
              opacity: text.trim() ? 1 : 0.5,
              cursor: text.trim() ? "pointer" : "not-allowed",
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </div>
      </form>
    </div>
  );
};

const styles = {
  // Empty state
  emptyWrapper: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "var(--bg-primary)",
  },
  emptyContent: {
    textAlign: "center",
    padding: "40px",
  },
  emptyIconOuter: {
    display: "flex",
    justifyContent: "center",
    marginBottom: "24px",
  },
  emptyIcon: {
    width: "96px",
    height: "96px",
    borderRadius: "var(--radius-xl)",
    background: "var(--bg-glass)",
    border: "1px solid var(--border-color)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "var(--accent-primary)",
  },
  emptyTitle: {
    fontSize: "24px",
    fontWeight: "700",
    color: "var(--text-primary)",
    marginBottom: "8px",
  },
  emptySubtitle: {
    fontSize: "15px",
    color: "var(--text-muted)",
    maxWidth: "320px",
    margin: "0 auto",
    lineHeight: "1.5",
  },

  // Chat container
  chatContainer: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    background: "var(--bg-primary)",
    overflow: "hidden",
  },

  // Header
  chatHeader: {
    height: "68px",
    minHeight: "68px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 24px",
    background: "var(--bg-secondary)",
    borderBottom: "1px solid var(--border-color)",
  },
  chatHeaderLeft: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
  },
  headerAvatarContainer: {
    position: "relative",
  },
  headerAvatar: {
    width: "40px",
    height: "40px",
    borderRadius: "var(--radius-full)",
    objectFit: "cover",
    border: "2px solid var(--border-color)",
  },
  headerStatusDot: {
    position: "absolute",
    bottom: "1px",
    right: "1px",
    width: "10px",
    height: "10px",
    borderRadius: "var(--radius-full)",
    border: "2px solid var(--bg-secondary)",
  },
  headerName: {
    fontSize: "15px",
    fontWeight: "600",
    color: "var(--text-primary)",
    margin: 0,
  },
  headerStatus: {
    fontSize: "12px",
    fontWeight: "500",
  },

  // Messages
  messagesArea: {
    flex: 1,
    overflowY: "auto",
    padding: "20px 24px",
    display: "flex",
    flexDirection: "column",
  },
  loadingMessages: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    padding: "20px",
  },
  msgSkeleton: {
    height: "40px",
    borderRadius: "var(--radius-md)",
    background: "linear-gradient(90deg, var(--bg-glass) 25%, rgba(255,255,255,0.06) 50%, var(--bg-glass) 75%)",
    backgroundSize: "200% 100%",
    animation: "shimmer 1.5s infinite",
  },
  noMessages: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  noMessagesText: {
    fontSize: "15px",
    color: "var(--text-muted)",
  },

  // Input
  inputArea: {
    padding: "16px 24px",
    borderTop: "1px solid var(--border-color)",
    background: "var(--bg-secondary)",
  },
  inputContainer: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "4px 4px 4px 16px",
    borderRadius: "var(--radius-lg)",
    border: "1px solid var(--border-color)",
    background: "var(--bg-glass)",
    transition: "border-color var(--transition-fast)",
  },
  messageInput: {
    flex: 1,
    border: "none",
    background: "transparent",
    color: "var(--text-primary)",
    fontSize: "14px",
    fontFamily: "inherit",
    outline: "none",
    padding: "10px 0",
  },
  sendBtn: {
    width: "42px",
    height: "42px",
    borderRadius: "var(--radius-md)",
    border: "none",
    background: "var(--accent-gradient)",
    color: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    transition: "transform var(--transition-fast), box-shadow var(--transition-fast)",
    boxShadow: "var(--accent-glow)",
    flexShrink: 0,
  },
};

export default ChatArea;
