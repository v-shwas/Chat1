import React, { useState, useRef } from "react";
import useChatStore from "../../store/useChatStore";

const EMOJI_LIST = ["👍", "❤️", "😂", "😮", "😢", "🔥"];

const MessageBubble = ({ message, isSent, senderName }) => {
  const [showMenu, setShowMenu] = useState(false);
  const [showEmojis, setShowEmojis] = useState(false);
  const menuRef = useRef(null);
  const { setReplyingTo, reactToMessage, deleteMessage } = useChatStore();

  const time = new Date(message.createdAt).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  const handleContextMenu = (e) => {
    e.preventDefault();
    setShowMenu(!showMenu);
    setShowEmojis(false);
  };

  const handleReply = () => {
    setReplyingTo(message);
    setShowMenu(false);
  };

  const handleDelete = () => {
    deleteMessage(message._id);
    setShowMenu(false);
  };

  const handleReact = (emoji) => {
    reactToMessage(message._id, emoji);
    setShowEmojis(false);
    setShowMenu(false);
  };

  // Deleted message
  if (message.isDeleted) {
    return (
      <div style={{
        ...styles.wrapper,
        justifyContent: isSent ? "flex-end" : "flex-start",
      }}>
        <div style={styles.deletedBubble}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="15" y1="9" x2="9" y2="15" />
            <line x1="9" y1="9" x2="15" y2="15" />
          </svg>
          <span style={styles.deletedText}>This message was deleted</span>
        </div>
      </div>
    );
  }

  // Audio message
  const isAudio = message.messageType === "audio" && message.image;

  // Render status ticks
  const renderStatus = () => {
    if (!isSent) return null;
    const s = message.status || "sent";
    return (
      <span style={{
        ...styles.statusTick,
        color: s === "read" ? "var(--accent-cyan)" : "var(--text-muted)",
      }}>
        {s === "sent" ? "✓" : "✓✓"}
      </span>
    );
  };

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
      <div style={styles.messageGroup} onContextMenu={handleContextMenu}>
        {/* Sender Label */}
        <div style={{
          ...styles.senderRow,
          justifyContent: isSent ? "flex-end" : "flex-start",
        }}>
          {!isSent && (
            <span style={styles.senderAvatar}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </span>
          )}
          <span style={{
            ...styles.senderName,
            color: isSent ? "var(--accent-purple-light)" : "var(--text-muted)",
          }}>
            {isSent ? "OPERATOR PRIME" : "CORE INTELLIGENCE"}
          </span>
          {isSent && (
            <span style={styles.senderAvatarSent}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </span>
          )}
        </div>

        {/* Reply Preview */}
        {message.replyTo && (
          <div style={styles.replyPreview}>
            <div style={styles.replyBar} />
            <p style={styles.replyText}>
              {message.replyTo.message?.substring(0, 80) || "Message"}
              {message.replyTo.message?.length > 80 ? "..." : ""}
            </p>
          </div>
        )}

        {/* Message Bubble */}
        <div
          style={{
            ...styles.bubble,
            ...(isSent ? styles.sent : styles.received),
          }}
        >
          {/* Image */}
          {message.messageType === "image" && message.image && (
            <img src={message.image} alt="Shared" style={styles.msgImage} />
          )}

          {/* File */}
          {message.messageType === "file" && message.image && (
            <a href={message.image} download={message.fileName} style={styles.fileLink}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
              <span>{message.fileName || "Download file"}</span>
            </a>
          )}

          {/* Audio */}
          {isAudio && (
            <div style={styles.audioWrapper}>
              <audio controls src={message.image} style={styles.audioPlayer} />
            </div>
          )}

          {/* Text */}
          {message.message && (
            <p style={styles.text}>{message.message}</p>
          )}

          <div style={styles.timeRow}>
            <span style={{
              ...styles.time,
              color: isSent ? "rgba(179, 136, 255, 0.6)" : "rgba(0, 229, 255, 0.4)",
            }}>{time}</span>
            {renderStatus()}
          </div>
        </div>

        {/* Reactions */}
        {message.reactions && message.reactions.length > 0 && (
          <div style={styles.reactionsRow}>
            {message.reactions.map((r, i) => (
              <span key={i} style={styles.reactionBadge}>{r.emoji}</span>
            ))}
          </div>
        )}

        {/* Context Menu */}
        {showMenu && (
          <div style={{
            ...styles.contextMenu,
            ...(isSent ? { right: 0 } : { left: 0 }),
          }} ref={menuRef}>
            <button style={styles.menuItem} onClick={() => setShowEmojis(!showEmojis)}>
              😊 React
            </button>
            <button style={styles.menuItem} onClick={handleReply}>
              ↩ Reply
            </button>
            {isSent && (
              <button style={{ ...styles.menuItem, color: "var(--danger)" }} onClick={handleDelete}>
                🗑 Delete
              </button>
            )}
            <button style={styles.menuItem} onClick={() => setShowMenu(false)}>
              ✕ Close
            </button>

            {showEmojis && (
              <div style={styles.emojiPicker}>
                {EMOJI_LIST.map((emoji) => (
                  <button
                    key={emoji}
                    style={styles.emojiBtn}
                    onClick={() => handleReact(emoji)}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  wrapper: {
    display: "flex",
    marginBottom: "6px",
    padding: "0 4px",
  },
  messageGroup: {
    maxWidth: "65%",
    display: "flex",
    flexDirection: "column",
    gap: "4px",
    position: "relative",
  },
  senderRow: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    padding: "0 4px",
  },
  senderName: {
    fontFamily: "var(--font-mono)",
    fontSize: "9px",
    letterSpacing: "0.15em",
    fontWeight: "400",
    textTransform: "uppercase",
  },
  senderAvatar: {
    width: "22px",
    height: "22px",
    borderRadius: "var(--radius-sm)",
    background: "rgba(0, 229, 255, 0.08)",
    border: "1px solid rgba(0, 229, 255, 0.12)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "var(--accent-cyan)",
    flexShrink: 0,
  },
  senderAvatarSent: {
    width: "22px",
    height: "22px",
    borderRadius: "var(--radius-full)",
    background: "rgba(124, 77, 255, 0.12)",
    border: "1px solid rgba(124, 77, 255, 0.2)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "var(--accent-purple-light)",
    flexShrink: 0,
  },
  replyPreview: {
    display: "flex",
    alignItems: "stretch",
    gap: "8px",
    padding: "6px 10px",
    borderRadius: "var(--radius-sm)",
    background: "rgba(0, 229, 255, 0.04)",
    marginLeft: "4px",
    marginRight: "4px",
  },
  replyBar: {
    width: "3px",
    borderRadius: "2px",
    background: "var(--accent-cyan)",
    flexShrink: 0,
  },
  replyText: {
    fontSize: "11px",
    color: "var(--text-muted)",
    fontFamily: "var(--font-body)",
    fontWeight: "500",
    margin: 0,
    lineHeight: "1.4",
  },
  bubble: {
    padding: "12px 16px 8px",
    borderRadius: "var(--radius-md)",
    position: "relative",
  },
  sent: {
    background: "rgba(124, 77, 255, 0.1)",
    border: "1px solid rgba(124, 77, 255, 0.15)",
    borderBottomRightRadius: "4px",
  },
  received: {
    background: "rgba(0, 229, 255, 0.04)",
    border: "1px solid rgba(0, 229, 255, 0.08)",
    borderBottomLeftRadius: "4px",
  },
  text: {
    fontSize: "14px",
    lineHeight: "1.6",
    margin: 0,
    wordBreak: "break-word",
    fontFamily: "var(--font-body)",
    fontWeight: "500",
    color: "var(--text-primary)",
    letterSpacing: "0.01em",
  },
  timeRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: "4px",
    marginTop: "4px",
  },
  time: {
    fontSize: "9px",
    fontFamily: "var(--font-mono)",
    letterSpacing: "0.05em",
  },
  statusTick: {
    fontSize: "10px",
    fontWeight: "700",
  },
  msgImage: {
    maxWidth: "100%",
    maxHeight: "240px",
    borderRadius: "var(--radius-sm)",
    objectFit: "cover",
    marginBottom: "6px",
    cursor: "pointer",
  },
  fileLink: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "8px 12px",
    borderRadius: "var(--radius-sm)",
    background: "rgba(0, 229, 255, 0.06)",
    border: "1px solid rgba(0, 229, 255, 0.1)",
    color: "var(--accent-cyan)",
    textDecoration: "none",
    fontSize: "12px",
    fontFamily: "var(--font-body)",
    fontWeight: "600",
    marginBottom: "6px",
  },
  audioWrapper: {
    marginBottom: "4px",
  },
  audioPlayer: {
    width: "100%",
    height: "32px",
    borderRadius: "var(--radius-sm)",
    outline: "none",
  },
  reactionsRow: {
    display: "flex",
    gap: "3px",
    padding: "0 4px",
    flexWrap: "wrap",
  },
  reactionBadge: {
    fontSize: "14px",
    padding: "2px 4px",
    borderRadius: "var(--radius-full)",
    background: "rgba(0, 229, 255, 0.06)",
    border: "1px solid var(--border-color)",
    cursor: "default",
  },
  deletedBubble: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    padding: "8px 14px",
    borderRadius: "var(--radius-md)",
    background: "rgba(255,255,255,0.02)",
    border: "1px dashed rgba(255,255,255,0.06)",
    color: "var(--text-muted)",
  },
  deletedText: {
    fontSize: "12px",
    fontFamily: "var(--font-body)",
    fontWeight: "500",
    fontStyle: "italic",
  },
  contextMenu: {
    position: "absolute",
    top: "100%",
    marginTop: "4px",
    background: "var(--bg-tertiary)",
    border: "1px solid var(--border-glow)",
    borderRadius: "var(--radius-md)",
    padding: "4px",
    zIndex: 50,
    minWidth: "130px",
    boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
  },
  menuItem: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    width: "100%",
    padding: "8px 12px",
    border: "none",
    background: "transparent",
    color: "var(--text-primary)",
    fontSize: "12px",
    fontFamily: "var(--font-body)",
    fontWeight: "600",
    cursor: "pointer",
    borderRadius: "var(--radius-sm)",
    textAlign: "left",
    transition: "background var(--transition-fast)",
  },
  emojiPicker: {
    display: "flex",
    gap: "4px",
    padding: "8px",
    borderTop: "1px solid var(--border-color)",
    marginTop: "4px",
    flexWrap: "wrap",
  },
  emojiBtn: {
    width: "32px",
    height: "32px",
    border: "none",
    background: "transparent",
    fontSize: "18px",
    cursor: "pointer",
    borderRadius: "var(--radius-sm)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "background var(--transition-fast)",
  },
};

export default MessageBubble;
