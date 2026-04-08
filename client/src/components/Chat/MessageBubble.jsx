import { useState, useRef } from "react";
import useChatStore from "../../store/useChatStore";
import { SOCKET_URL } from "../../config";

const EMOJI_LIST = ["👍", "❤️", "😂", "😮", "😢", "🔥"];

const MessageBubble = ({ message, isSent, senderName }) => {
  const [showMenu, setShowMenu] = useState(false);
  const [showEmojis, setShowEmojis] = useState(false);
  const [hovered, setHovered] = useState(false);
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

  const handleReply = () => { setReplyingTo(message); setShowMenu(false); };
  const handleDelete = () => { deleteMessage(message._id); setShowMenu(false); };
  const handleReact = (emoji) => { reactToMessage(message._id, emoji); setShowEmojis(false); setShowMenu(false); };

  // Resolve image URL
  const resolveUrl = (url) => {
    if (!url) return "";
    if (url.startsWith("http")) return url;
    return `${SOCKET_URL}${url}`;
  };

  if (message.isDeleted) {
    return (
      <div style={{ ...styles.wrapper, justifyContent: isSent ? "flex-end" : "flex-start" }}>
        <div style={styles.deletedBubble}>
          <span style={styles.deletedText}>This message was deleted</span>
        </div>
      </div>
    );
  }

  const isAudio = message.messageType === "audio" && message.image;
  const isImage = message.messageType === "image" && message.image;
  const isFile = message.messageType === "file" && message.image;

  const renderStatus = () => {
    if (!isSent) return null;
    const s = message.status || "sent";
    return (
      <span style={{ fontSize: "10px", color: s === "read" ? "var(--cyan)" : "var(--text-muted)" }}>
        {s === "sent" ? "✓" : "✓✓"}
      </span>
    );
  };

  return (
    <div
      style={{ ...styles.wrapper, justifyContent: isSent ? "flex-end" : "flex-start" }}
      className="animate-fade-up"
    >
      <div
        style={styles.messageGroup}
        onContextMenu={handleContextMenu}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => { setHovered(false); setShowMenu(false); }}
      >
        {/* Reply Preview */}
        {message.replyTo && (
          <div style={styles.replyPreview}>
            <div style={styles.replyBar} />
            <p style={styles.replyText}>
              {message.replyTo.message?.substring(0, 80) || "Message"}
            </p>
          </div>
        )}

        {/* Bubble */}
        <div style={{ ...styles.bubble, ...(isSent ? styles.sent : styles.received) }}>
          {isImage && (
            <img src={resolveUrl(message.image)} alt="Shared" style={styles.msgImage} />
          )}
          {isFile && (
            <a href={resolveUrl(message.image)} download={message.fileName} style={styles.fileLink}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
              <span>{message.fileName || "Download file"}</span>
            </a>
          )}
          {isAudio && (
            <audio controls src={resolveUrl(message.image)} style={styles.audioPlayer} />
          )}
          {message.message && (
            <p style={styles.text}>{message.message}</p>
          )}
          <div style={styles.timeRow}>
            <span style={{
              ...styles.time,
              opacity: hovered ? 1 : 0,
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
          <div style={{ ...styles.contextMenu, ...(isSent ? { right: 0 } : { left: 0 }) }} ref={menuRef}>
            <button style={styles.menuItem} onClick={() => setShowEmojis(!showEmojis)}>React</button>
            <button style={styles.menuItem} onClick={handleReply}>Reply</button>
            {isSent && (
              <button style={{ ...styles.menuItem, color: "var(--red)" }} onClick={handleDelete}>Delete</button>
            )}
            {showEmojis && (
              <div style={styles.emojiPicker}>
                {EMOJI_LIST.map((emoji) => (
                  <button key={emoji} style={styles.emojiBtn} onClick={() => handleReact(emoji)}>
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
  wrapper: { display: "flex", marginBottom: "4px", padding: "0 4px" },
  messageGroup: { maxWidth: "68%", display: "flex", flexDirection: "column", gap: "2px", position: "relative" },

  replyPreview: {
    display: "flex", alignItems: "stretch", gap: "8px",
    padding: "6px 10px", borderRadius: "var(--r-sm)",
    background: "rgba(108,99,255,0.06)", marginBottom: "2px",
  },
  replyBar: { width: "3px", borderRadius: "2px", background: "var(--accent)", flexShrink: 0 },
  replyText: { fontSize: "11px", color: "var(--text-muted)", margin: 0, lineHeight: "1.4" },

  bubble: { padding: "10px 14px", position: "relative" },
  sent: {
    background: "linear-gradient(135deg, rgba(108,99,255,0.22), rgba(108,99,255,0.09))",
    border: "1px solid rgba(108,99,255,0.22)",
    borderRadius: "18px 18px 4px 18px",
  },
  received: {
    background: "var(--glass-bg)",
    backdropFilter: "blur(20px)",
    WebkitBackdropFilter: "blur(20px)",
    border: "1px solid var(--glass-border)",
    borderRadius: "18px 18px 18px 4px",
  },

  text: { fontSize: "14px", lineHeight: "1.55", margin: 0, wordBreak: "break-word", color: "var(--text-primary)" },
  timeRow: { display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "4px", marginTop: "4px" },
  time: { fontSize: "10px", fontFamily: "var(--font-mono)", color: "var(--text-muted)", transition: "opacity 200ms" },

  msgImage: { maxWidth: "100%", maxHeight: "240px", borderRadius: "var(--r-sm)", objectFit: "cover", marginBottom: "6px", cursor: "pointer" },
  fileLink: {
    display: "flex", alignItems: "center", gap: "8px",
    padding: "8px 12px", borderRadius: "var(--r-sm)",
    background: "rgba(108,99,255,0.08)", border: "1px solid rgba(108,99,255,0.15)",
    color: "var(--accent)", textDecoration: "none", fontSize: "12px", fontWeight: 500, marginBottom: "6px",
  },
  audioPlayer: { width: "100%", height: "32px", borderRadius: "var(--r-sm)", outline: "none", marginBottom: "4px" },

  reactionsRow: { display: "flex", gap: "3px", padding: "0 4px", flexWrap: "wrap" },
  reactionBadge: {
    fontSize: "14px", padding: "2px 6px", borderRadius: "var(--r-full)",
    background: "var(--glass-bg)", border: "1px solid var(--glass-border)",
  },

  deletedBubble: {
    padding: "8px 14px", borderRadius: "var(--r-md)",
    background: "var(--surface)", border: "1px dashed var(--border)",
    color: "var(--text-muted)",
  },
  deletedText: { fontSize: "12px", fontStyle: "italic" },

  contextMenu: {
    position: "absolute", top: "100%", marginTop: "4px",
    background: "rgba(10,16,32,0.95)", backdropFilter: "blur(20px)",
    border: "1px solid var(--border-hover)", borderRadius: "var(--r-md)",
    padding: "4px", zIndex: 50, minWidth: "120px",
    boxShadow: "0 8px 32px rgba(0,0,0,0.6)",
  },
  menuItem: {
    display: "block", width: "100%", padding: "8px 12px",
    border: "none", background: "transparent", color: "var(--text-primary)",
    fontSize: "12px", fontFamily: "var(--font-body)", fontWeight: 500,
    cursor: "pointer", borderRadius: "var(--r-sm)", textAlign: "left",
    transition: "background var(--dur-fast)",
  },
  emojiPicker: {
    display: "flex", gap: "4px", padding: "8px",
    borderTop: "1px solid var(--border)", marginTop: "4px", flexWrap: "wrap",
  },
  emojiBtn: {
    width: "32px", height: "32px", border: "none", background: "transparent",
    fontSize: "18px", cursor: "pointer", borderRadius: "var(--r-sm)",
    display: "flex", alignItems: "center", justifyContent: "center",
  },
};

export default MessageBubble;
