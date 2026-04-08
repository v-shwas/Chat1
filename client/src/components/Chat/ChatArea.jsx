import { useState, useEffect, useRef } from "react";
import useChatStore from "../../store/useChatStore";
import useAuthStore from "../../store/useAuthStore";
import useSocketStore from "../../store/useSocketStore";
import useCallStore from "../../store/useCallStore";
import MessageBubble from "./MessageBubble";
import VoiceRecorder from "./VoiceRecorder";
import Avatar from "../ui/Avatar";
import { Phone, Video, Paperclip, Send, Smile, ArrowDown, X } from "lucide-react";
import axios from "axios";
import { API_BASE } from "../../config";

const ChatArea = () => {
  const {
    selectedUser, messages, isMessagesLoading, sendMessage,
    getMessages, subscribeToMessages, unsubscribeFromMessages,
    typingUsers, replyingTo, cancelReply, markAsRead,
  } = useChatStore();
  const { authUser } = useAuthStore();
  const { socket, onlineUsers } = useSocketStore();
  const { startCall } = useCallStore();
  const [text, setText] = useState("");
  const messagesEndRef = useRef(null);
  const messagesAreaRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const fileInputRef = useRef(null);
  const [showScrollBtn, setShowScrollBtn] = useState(false);

  useEffect(() => {
    if (selectedUser && socket) {
      getMessages(selectedUser._id);
      subscribeToMessages(socket);
      markAsRead(selectedUser._id);
    }
    return () => unsubscribeFromMessages(socket);
  }, [selectedUser, socket]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleScroll = () => {
    const el = messagesAreaRef.current;
    if (el) {
      const distFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
      setShowScrollBtn(distFromBottom > 200);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleTyping = (e) => {
    setText(e.target.value);
    if (socket && selectedUser) {
      socket.emit("typing", { receiverId: selectedUser._id });
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        socket.emit("stopTyping", { receiverId: selectedUser._id });
      }, 2000);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    if (socket && selectedUser) {
      socket.emit("stopTyping", { receiverId: selectedUser._id });
    }
    await sendMessage({ message: text.trim() });
    setText("");
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const token = useAuthStore.getState().token;
      const formData = new FormData();
      formData.append("file", file);
      const res = await axios.post(`${API_BASE}/upload`, formData, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" },
      });
      const { url, fileName, fileSize, mimeType } = res.data;
      const isImage = mimeType.startsWith("image/");
      const isAudio = mimeType.startsWith("audio/");
      await sendMessage({
        message: isImage ? "" : fileName,
        messageType: isImage ? "image" : isAudio ? "audio" : "file",
        image: url,
        fileName,
        fileSize,
        fileMimeType: mimeType,
      });
    } catch {
      // toast is handled by store
    }
    e.target.value = "";
  };

  const handleVoiceSend = async (blob) => {
    try {
      const token = useAuthStore.getState().token;
      const formData = new FormData();
      formData.append("file", blob, "voice-message.webm");
      const res = await axios.post(`${API_BASE}/upload`, formData, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" },
      });
      await sendMessage({
        message: "Voice message",
        messageType: "audio",
        image: res.data.url,
        fileName: "voice-message.webm",
        fileSize: blob.size,
        fileMimeType: "audio/webm",
      });
    } catch {
      // handled
    }
  };

  const handleCall = (type) => {
    if (selectedUser && authUser) {
      startCall(selectedUser._id, type, authUser.fullname);
    }
  };

  const isTyping = selectedUser && typingUsers[selectedUser._id];

  /* ═══ EMPTY STATE ═══ */
  if (!selectedUser) {
    return (
      <div style={styles.emptyWrapper}>
        <div style={styles.emptyContent} className="animate-fade-in-up">
          <div style={styles.emptyIcon}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </div>
          <h2 style={styles.emptyTitle}>Welcome to ChatFlow</h2>
          <p style={styles.emptySubtitle}>
            Select a conversation to start messaging
          </p>
        </div>
      </div>
    );
  }

  const isOnline = onlineUsers.includes(selectedUser._id);

  return (
    <div style={styles.outerContainer}>
      <div style={styles.chatContainer}>
        {/* ── Chat Header ── */}
        <div style={styles.chatHeader}>
          <div style={styles.headerLeft}>
            <Avatar
              src={selectedUser.profilePic}
              name={selectedUser.fullname}
              size="sm"
              online={isOnline}
            />
            <div>
              <h3 style={styles.headerName}>{selectedUser.fullname}</h3>
              <p style={styles.headerStatus}>
                {isTyping ? (
                  <span style={{ color: "var(--cyan)" }}>typing...</span>
                ) : isOnline ? (
                  "Online"
                ) : (
                  `Last seen ${selectedUser.lastSeen ? new Date(selectedUser.lastSeen).toLocaleString() : "recently"}`
                )}
              </p>
            </div>
          </div>
          <div style={styles.headerRight}>
            <button onClick={() => handleCall("audio")} style={styles.headerBtn} title="Voice Call">
              <Phone size={16} />
            </button>
            <button onClick={() => handleCall("video")} style={styles.headerBtn} title="Video Call">
              <Video size={16} />
            </button>
          </div>
        </div>

        {/* ── Messages ── */}
        <div style={styles.messagesArea} ref={messagesAreaRef} onScroll={handleScroll}>
          {isMessagesLoading ? (
            <div style={styles.loadingWrapper}>
              {[1, 2, 3].map((i) => (
                <div key={i} style={{
                  ...styles.skeleton,
                  alignSelf: i % 2 === 0 ? "flex-end" : "flex-start",
                  width: `${Math.random() * 30 + 25}%`,
                }} />
              ))}
            </div>
          ) : messages.length === 0 ? (
            <div style={styles.noMessages}>
              <p style={styles.noMessagesText}>No messages yet. Say hi!</p>
            </div>
          ) : (
            messages.map((msg) => {
              const isSent = msg.senderId === authUser?._id;
              return (
                <MessageBubble
                  key={msg._id}
                  message={msg}
                  isSent={isSent}
                  senderName={isSent ? authUser?.fullname : selectedUser.fullname}
                />
              );
            })
          )}

          {isTyping && (
            <div style={styles.typingBubble}>
              <span style={styles.typingDot} />
              <span style={{ ...styles.typingDot, animationDelay: "0.2s" }} />
              <span style={{ ...styles.typingDot, animationDelay: "0.4s" }} />
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {showScrollBtn && (
          <button style={styles.scrollBtn} onClick={scrollToBottom}>
            <ArrowDown size={16} />
          </button>
        )}

        {/* ── Reply Preview ── */}
        {replyingTo && (
          <div style={styles.replyBar}>
            <div style={styles.replyLeft}>
              <div style={styles.replyAccent} />
              <div>
                <span style={styles.replyLabel}>Replying to</span>
                <p style={styles.replyText}>
                  {replyingTo.message?.substring(0, 60) || "Message"}
                  {replyingTo.message?.length > 60 ? "..." : ""}
                </p>
              </div>
            </div>
            <button onClick={cancelReply} style={styles.replyClose}>
              <X size={14} />
            </button>
          </div>
        )}

        {/* ── Input ── */}
        <div style={styles.inputSection}>
          <form onSubmit={handleSend} style={styles.inputRow}>
            <input type="file" ref={fileInputRef} onChange={handleFileUpload} style={{ display: "none" }} />
            <button type="button" onClick={() => fileInputRef.current?.click()} style={styles.inputIconBtn}>
              <Paperclip size={18} />
            </button>

            <input
              type="text"
              placeholder="Type a message..."
              value={text}
              onChange={handleTyping}
              style={styles.messageInput}
            />

            <VoiceRecorder onSend={handleVoiceSend} />

            <button
              type="submit"
              disabled={!text.trim()}
              style={{
                ...styles.sendBtn,
                opacity: text.trim() ? 1 : 0.4,
              }}
            >
              <Send size={18} />
            </button>
          </form>
        </div>
      </div>

      {/* ═══ RIGHT INFO PANEL ═══ */}
      <div style={styles.rightPanel}>
        <div style={styles.panelCard}>
          <div style={styles.profileSection}>
            <Avatar
              src={selectedUser.profilePic}
              name={selectedUser.fullname}
              size="xl"
              online={isOnline}
            />
            <h3 style={styles.profileName}>{selectedUser.fullname}</h3>
            <p style={styles.profileAbout}>{selectedUser.about || "Hey there!"}</p>
            <span style={styles.profileUsername}>@{selectedUser.username}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  emptyWrapper: { flex: 1, display: "flex", alignItems: "center", justifyContent: "center" },
  emptyContent: { textAlign: "center", padding: "40px" },
  emptyIcon: {
    width: "100px", height: "100px", borderRadius: "50%",
    background: "var(--accent-dim)", border: "1px solid rgba(108,99,255,0.2)",
    display: "flex", alignItems: "center", justifyContent: "center",
    color: "var(--accent)", margin: "0 auto 24px",
  },
  emptyTitle: { fontFamily: "var(--font-display)", fontSize: "24px", fontWeight: 800, color: "var(--text-primary)", marginBottom: "8px" },
  emptySubtitle: { fontSize: "14px", color: "var(--text-muted)", maxWidth: "300px", margin: "0 auto" },

  outerContainer: { flex: 1, display: "flex", overflow: "hidden" },
  chatContainer: { flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", position: "relative" },

  chatHeader: {
    height: "60px", minHeight: "60px",
    display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "0 20px",
    background: "rgba(3,4,10,0.75)",
    backdropFilter: "blur(20px)",
    WebkitBackdropFilter: "blur(20px)",
    borderBottom: "1px solid var(--border)",
    zIndex: "var(--z-header)",
  },
  headerLeft: { display: "flex", alignItems: "center", gap: "12px" },
  headerName: { fontFamily: "var(--font-display)", fontSize: "14px", fontWeight: 700, color: "var(--text-primary)", margin: 0 },
  headerStatus: { fontSize: "12px", color: "var(--text-muted)", margin: 0, marginTop: "1px" },
  headerRight: { display: "flex", alignItems: "center", gap: "6px" },
  headerBtn: {
    width: "36px", height: "36px", borderRadius: "var(--r-full)",
    border: "1px solid var(--border)", background: "var(--surface)",
    color: "var(--text-secondary)",
    display: "flex", alignItems: "center", justifyContent: "center",
    cursor: "pointer", transition: "all var(--dur-normal) var(--ease-smooth)",
  },

  messagesArea: { flex: 1, overflowY: "auto", padding: "20px 24px", display: "flex", flexDirection: "column", gap: "2px" },
  loadingWrapper: { display: "flex", flexDirection: "column", gap: "12px", padding: "20px" },
  skeleton: { height: "50px", borderRadius: "var(--r-md)", background: "linear-gradient(90deg, var(--surface) 25%, var(--surface-hover) 50%, var(--surface) 75%)", backgroundSize: "200% 100%", animation: "shimmer 1.5s infinite" },
  noMessages: { flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" },
  noMessagesText: { fontSize: "14px", color: "var(--text-muted)" },

  typingBubble: {
    display: "flex", gap: "4px", alignItems: "center",
    padding: "10px 16px", borderRadius: "18px 18px 18px 4px",
    background: "var(--glass-bg)", border: "1px solid var(--glass-border)",
    width: "fit-content", marginTop: "4px",
  },
  typingDot: { width: "6px", height: "6px", borderRadius: "50%", background: "var(--accent)", animation: "pulse-dot 1s infinite" },

  scrollBtn: {
    position: "absolute", bottom: "90px", right: "32px",
    width: "36px", height: "36px", borderRadius: "50%",
    background: "var(--glass-bg)", backdropFilter: "blur(10px)",
    border: "1px solid var(--glass-border)", color: "var(--text-secondary)",
    display: "flex", alignItems: "center", justifyContent: "center",
    cursor: "pointer", zIndex: 5,
  },

  replyBar: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "8px 20px",
    background: "rgba(108,99,255,0.06)",
    borderTop: "1px solid var(--border)",
  },
  replyLeft: { display: "flex", alignItems: "stretch", gap: "10px" },
  replyAccent: { width: "3px", borderRadius: "2px", background: "var(--accent)" },
  replyLabel: { fontFamily: "var(--font-mono)", fontSize: "10px", color: "var(--accent)", display: "block", marginBottom: "2px" },
  replyText: { fontSize: "12px", color: "var(--text-secondary)", margin: 0 },
  replyClose: { width: "28px", height: "28px", borderRadius: "var(--r-sm)", border: "none", background: "transparent", color: "var(--text-muted)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" },

  inputSection: {
    padding: "12px 20px 16px",
    background: "rgba(3,4,10,0.85)",
    backdropFilter: "blur(30px)",
    WebkitBackdropFilter: "blur(30px)",
    borderTop: "1px solid var(--border)",
    boxShadow: "0 -20px 60px rgba(3,4,10,0.8)",
  },
  inputRow: {
    display: "flex", alignItems: "center", gap: "8px",
    padding: "6px 8px",
    borderRadius: "var(--r-xl)",
    background: "var(--glass-bg)",
    border: "1px solid var(--glass-border)",
  },
  inputIconBtn: {
    width: "36px", height: "36px", borderRadius: "50%",
    border: "none", background: "transparent",
    color: "var(--text-muted)",
    display: "flex", alignItems: "center", justifyContent: "center",
    cursor: "pointer", flexShrink: 0,
  },
  messageInput: {
    flex: 1, border: "none", background: "transparent",
    color: "var(--text-primary)", fontSize: "14px",
    fontFamily: "var(--font-body)", outline: "none",
    padding: "8px 4px",
  },
  sendBtn: {
    width: "40px", height: "40px", borderRadius: "50%",
    border: "none",
    background: "linear-gradient(135deg, var(--accent), var(--cyan))",
    color: "#fff",
    display: "flex", alignItems: "center", justifyContent: "center",
    cursor: "pointer", flexShrink: 0,
    boxShadow: "0 4px 16px rgba(108,99,255,0.35)",
    transition: "all var(--dur-normal) var(--ease-smooth)",
  },

  rightPanel: {
    width: "260px", minWidth: "260px", height: "100%",
    background: "rgba(3,4,10,0.6)",
    backdropFilter: "blur(20px)",
    WebkitBackdropFilter: "blur(20px)",
    borderLeft: "1px solid var(--border)",
    padding: "20px 16px", display: "flex", flexDirection: "column", gap: "12px",
    overflowY: "auto",
  },
  panelCard: {
    padding: "24px 16px", borderRadius: "var(--r-lg)",
    background: "var(--glass-bg)", border: "1px solid var(--glass-border)",
  },
  profileSection: { display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" },
  profileName: { fontFamily: "var(--font-display)", fontSize: "16px", fontWeight: 700, color: "var(--text-primary)", margin: 0 },
  profileAbout: { fontSize: "13px", color: "var(--text-muted)", textAlign: "center", margin: 0 },
  profileUsername: { fontFamily: "var(--font-mono)", fontSize: "12px", color: "var(--text-secondary)" },
};

export default ChatArea;
