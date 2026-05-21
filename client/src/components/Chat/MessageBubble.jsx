import { useState } from "react";
import useChatStore from "../../store/useChatStore";
import { SOCKET_URL } from "../../config";
import { FileText, Reply, Smile, Trash2 } from "lucide-react";

const EMOJI_LIST = ["👍", "❤️", "😂", "😮", "😢", "🔥"];

const MessageBubble = ({ message, isSent, senderName }) => {
  const [showMenu, setShowMenu] = useState(false);
  const [showEmojis, setShowEmojis] = useState(false);
  const [hovered, setHovered] = useState(false);
  const { setReplyingTo, reactToMessage, deleteMessage } = useChatStore();

  const time = new Date(message.createdAt).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  const resolveUrl = (url) => {
    if (!url) return "";
    if (url.startsWith("http")) return url;
    return `${SOCKET_URL}${url}`;
  };

  const handleContextMenu = (e) => {
    e.preventDefault();
    setShowMenu(!showMenu);
    setShowEmojis(false);
  };

  const handleReact = (emoji) => {
    reactToMessage(message._id, emoji);
    setShowEmojis(false);
    setShowMenu(false);
  };

  if (message.isDeleted) {
    return (
      <div style={{ ...styles.wrapper, justifyContent: isSent ? "flex-end" : "flex-start" }}>
        <div style={styles.deletedBubble}>This message was deleted</div>
      </div>
    );
  }

  const isAudio = message.messageType === "audio" && message.image;
  const isImage = message.messageType === "image" && message.image;
  const isFile = message.messageType === "file" && message.image;

  const renderStatus = () => {
    if (!isSent) return null;
    const status = message.status || "sent";
    return <span style={styles.status}>{status === "read" ? "Read" : "Sent"}</span>;
  };

  return (
    <div
      style={{ ...styles.wrapper, justifyContent: isSent ? "flex-end" : "flex-start" }}
      className="animate-fade-up"
    >
      <div
        style={{ ...styles.messageGroup, alignItems: isSent ? "flex-end" : "flex-start" }}
        onContextMenu={handleContextMenu}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => {
          setHovered(false);
          setShowMenu(false);
          setShowEmojis(false);
        }}
        aria-label={`Message from ${senderName || "contact"}`}
      >
        {message.replyTo && (
          <div style={styles.replyPreview}>
            <div style={styles.replyBar} />
            <p style={styles.replyText}>{message.replyTo.message?.substring(0, 80) || "Attachment"}</p>
          </div>
        )}

        <div style={{ ...styles.bubble, ...(isSent ? styles.sent : styles.received) }}>
          {isImage && <img src={resolveUrl(message.image)} alt="Shared attachment" style={styles.msgImage} />}

          {isFile && (
            <a href={resolveUrl(message.image)} download={message.fileName} style={styles.fileLink}>
              <FileText size={16} />
              <span>{message.fileName || "Download file"}</span>
            </a>
          )}

          {isAudio && <audio controls src={resolveUrl(message.image)} style={styles.audioPlayer} />}

          {message.message && <p style={styles.text}>{message.message}</p>}

          <div style={styles.timeRow}>
            <span style={{ ...styles.time, opacity: hovered || !isSent ? 1 : 0.75 }}>{time}</span>
            {renderStatus()}
          </div>
        </div>

        {message.reactions && message.reactions.length > 0 && (
          <div style={styles.reactionsRow}>
            {message.reactions.map((r, i) => (
              <span key={`${r.emoji}-${i}`} style={styles.reactionBadge}>{r.emoji}</span>
            ))}
          </div>
        )}

        {showMenu && (
          <div style={{ ...styles.contextMenu, ...(isSent ? { right: 0 } : { left: 0 }) }}>
            <button style={styles.menuItem} onClick={() => setShowEmojis(!showEmojis)}>
              <Smile size={14} />
              React
            </button>
            <button style={styles.menuItem} onClick={() => { setReplyingTo(message); setShowMenu(false); }}>
              <Reply size={14} />
              Reply
            </button>
            {isSent && (
              <button style={{ ...styles.menuItem, color: "var(--red)" }} onClick={() => { deleteMessage(message._id); setShowMenu(false); }}>
                <Trash2 size={14} />
                Delete
              </button>
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
  messageGroup: { maxWidth: "68%", display: "flex", flexDirection: "column", gap: "4px", position: "relative" },
  replyPreview: {
    display: "flex",
    alignItems: "stretch",
    gap: "8px",
    padding: "7px 10px",
    borderRadius: "var(--r-lg)",
    background: "rgba(212,175,55,0.08)",
    border: "1px solid rgba(242,202,80,0.10)",
    marginBottom: "2px",
  },
  replyBar: { width: "3px", borderRadius: "2px", background: "var(--accent)", flexShrink: 0 },
  replyText: { fontSize: "11px", color: "var(--text-muted)", margin: 0, lineHeight: 1.4 },
  bubble: { padding: "11px 15px", position: "relative", boxShadow: "0 10px 26px rgba(0,0,0,0.22)" },
  sent: {
    background: "linear-gradient(135deg, #735f32, #5f4f2c)",
    border: "1px solid rgba(255,224,136,0.16)",
    borderRadius: "18px 18px 5px 18px",
    color: "#fff9e8",
  },
  received: {
    background: "rgba(42,42,40,0.86)",
    backdropFilter: "blur(18px)",
    WebkitBackdropFilter: "blur(18px)",
    border: "1px solid rgba(153,144,124,0.12)",
    borderRadius: "18px 18px 18px 5px",
    color: "var(--text-primary)",
  },
  text: { fontSize: "14px", lineHeight: 1.58, margin: 0, wordBreak: "break-word" },
  timeRow: { display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "7px", marginTop: "6px" },
  time: { fontSize: "10px", fontFamily: "var(--font-mono)", color: "rgba(232,227,215,0.55)", transition: "opacity 200ms" },
  status: { fontFamily: "var(--font-mono)", fontSize: "9px", color: "var(--accent-soft)", textTransform: "uppercase", letterSpacing: "0.10em" },
  msgImage: { maxWidth: "100%", maxHeight: "260px", borderRadius: "var(--r-md)", objectFit: "cover", marginBottom: "8px", display: "block" },
  fileLink: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "9px 12px",
    borderRadius: "var(--r-md)",
    background: "rgba(242,202,80,0.08)",
    border: "1px solid rgba(242,202,80,0.14)",
    color: "var(--accent)",
    textDecoration: "none",
    fontSize: "12px",
    fontWeight: 700,
    marginBottom: "6px",
  },
  audioPlayer: { width: "230px", maxWidth: "100%", height: "34px", borderRadius: "var(--r-sm)", outline: "none", marginBottom: "4px" },
  reactionsRow: { display: "flex", gap: "3px", padding: "0 4px", flexWrap: "wrap" },
  reactionBadge: {
    fontSize: "14px",
    padding: "2px 6px",
    borderRadius: "var(--r-full)",
    background: "rgba(32,31,29,0.9)",
    border: "1px solid var(--border)",
  },
  deletedBubble: {
    padding: "9px 14px",
    borderRadius: "var(--r-md)",
    background: "rgba(53,53,52,0.32)",
    border: "1px dashed var(--border)",
    color: "var(--text-muted)",
    fontSize: "12px",
    fontStyle: "italic",
  },
  contextMenu: {
    position: "absolute",
    top: "100%",
    marginTop: "6px",
    background: "rgba(20,19,18,0.98)",
    backdropFilter: "blur(18px)",
    border: "1px solid var(--border-hover)",
    borderRadius: "var(--r-lg)",
    padding: "5px",
    zIndex: 50,
    minWidth: "132px",
    boxShadow: "0 14px 36px rgba(0,0,0,0.48)",
  },
  menuItem: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    width: "100%",
    padding: "8px 10px",
    border: "none",
    background: "transparent",
    color: "var(--text-primary)",
    fontSize: "12px",
    fontFamily: "var(--font-body)",
    fontWeight: 600,
    borderRadius: "var(--r-sm)",
    textAlign: "left",
  },
  emojiPicker: { display: "flex", gap: "4px", padding: "8px", borderTop: "1px solid var(--border)", marginTop: "4px", flexWrap: "wrap" },
  emojiBtn: {
    width: "32px",
    height: "32px",
    border: "none",
    background: "transparent",
    fontSize: "18px",
    borderRadius: "var(--r-sm)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
};

export default MessageBubble;
