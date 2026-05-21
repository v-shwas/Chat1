import { useState, useEffect, useRef } from "react";
import useChatStore from "../../store/useChatStore";
import useAuthStore from "../../store/useAuthStore";
import useSocketStore from "../../store/useSocketStore";
import useCallStore from "../../store/useCallStore";
import MessageBubble from "./MessageBubble";
import VoiceRecorder from "./VoiceRecorder";
import Avatar from "../ui/Avatar";
import { ArrowDown, ArrowLeft, Paperclip, Phone, Send, ShieldCheck, Video, X } from "lucide-react";
import axios from "axios";
import { API_BASE } from "../../config";

const ChatArea = () => {
  const {
    selectedUser,
    messages,
    isMessagesLoading,
    sendMessage,
    getMessages,
    subscribeToMessages,
    unsubscribeFromMessages,
    typingUsers,
    replyingTo,
    cancelReply,
    markAsRead,
    setSelectedUser,
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
    if (!el) return;
    const distFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    setShowScrollBtn(distFromBottom > 200);
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
      // Store-level toasts cover failed sends.
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
      // Store-level toasts cover failed sends.
    }
  };

  const handleCall = (type) => {
    if (selectedUser && authUser) {
      startCall(selectedUser._id, type, authUser.fullname);
    }
  };

  if (!selectedUser) {
    return (
      <section style={styles.emptyWrapper}>
        <div style={styles.emptyContent} className="animate-fade-in-up">
          <div style={styles.emptyIcon}>
            <ShieldCheck size={44} />
          </div>
          <h2 style={styles.emptyTitle}>Aurum is ready</h2>
          <p style={styles.emptySubtitle}>Choose a thread to open a protected conversation.</p>
        </div>
      </section>
    );
  }

  const isOnline = onlineUsers.includes(selectedUser._id);
  const isTyping = typingUsers[selectedUser._id];

  return (
    <section style={styles.outerContainer}>
      <div style={styles.chatContainer}>
        <header style={styles.chatHeader}>
          <div style={styles.headerLeft}>
            <button className="mobile-only" onClick={() => setSelectedUser(null)} style={styles.mobileBack}>
              <ArrowLeft size={18} />
            </button>
            <Avatar src={selectedUser.profilePic} name={selectedUser.fullname} size="md" online={isOnline} />
            <div>
              <h3 style={styles.headerName}>{selectedUser.fullname}</h3>
              <p style={styles.headerStatus}>
                {isTyping ? "Typing securely" : isOnline ? "Secure connection" : "Protected archive"}
              </p>
            </div>
          </div>
          <div style={styles.headerRight}>
            <button onClick={() => handleCall("audio")} style={styles.headerBtn} title="Voice call">
              <Phone size={17} />
            </button>
            <button onClick={() => handleCall("video")} style={styles.headerBtn} title="Video call">
              <Video size={17} />
            </button>
          </div>
        </header>

        <div style={styles.messagesArea} ref={messagesAreaRef} onScroll={handleScroll}>
          <div style={styles.dayPill}>Today</div>

          {isMessagesLoading ? (
            <div style={styles.loadingWrapper}>
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  style={{
                    ...styles.skeleton,
                    alignSelf: i % 2 === 0 ? "flex-end" : "flex-start",
                    width: `${i * 12 + 30}%`,
                  }}
                />
              ))}
            </div>
          ) : messages.length === 0 ? (
            <div style={styles.noMessages}>
              <p style={styles.noMessagesText}>No messages yet. Start with something worth protecting.</p>
            </div>
          ) : (
            messages.map((msg) => {
              const senderId = msg.senderId?._id || msg.senderId;
              const isSent = senderId === authUser?._id;
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
          <button style={styles.scrollBtn} onClick={() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })}>
            <ArrowDown size={16} />
          </button>
        )}

        {replyingTo && (
          <div style={styles.replyBar}>
            <div style={styles.replyLeft}>
              <div style={styles.replyAccent} />
              <div>
                <span style={styles.replyLabel}>Replying to message</span>
                <p style={styles.replyText}>
                  {replyingTo.message?.substring(0, 72) || "Attachment"}
                  {replyingTo.message?.length > 72 ? "..." : ""}
                </p>
              </div>
            </div>
            <button onClick={cancelReply} style={styles.replyClose}>
              <X size={14} />
            </button>
          </div>
        )}

        <footer style={styles.inputSection}>
          <form onSubmit={handleSend} style={styles.inputRow}>
            <input type="file" ref={fileInputRef} onChange={handleFileUpload} style={{ display: "none" }} />
            <button type="button" onClick={() => fileInputRef.current?.click()} style={styles.inputIconBtn} title="Attach file">
              <Paperclip size={18} />
            </button>
            <input
              type="text"
              placeholder="Send secure message"
              value={text}
              onChange={handleTyping}
              style={styles.messageInput}
            />
            <VoiceRecorder onSend={handleVoiceSend} />
            <button type="submit" disabled={!text.trim()} style={{ ...styles.sendBtn, opacity: text.trim() ? 1 : 0.45 }}>
              <Send size={18} />
            </button>
          </form>
        </footer>
      </div>

      <aside className="desktop-info-panel" style={styles.rightPanel}>
        <div style={styles.panelCard}>
          <Avatar src={selectedUser.profilePic} name={selectedUser.fullname} size="xl" online={isOnline} />
          <h3 style={styles.profileName}>{selectedUser.fullname}</h3>
          <span style={styles.profileUsername}>@{selectedUser.username}</span>
          <p style={styles.profileAbout}>{selectedUser.about || "Available on Aurum."}</p>
        </div>
        <div style={styles.securityCard}>
          <ShieldCheck size={18} />
          <div>
            <p style={styles.securityTitle}>Session status</p>
            <p style={styles.securityCopy}>Messages are routed through your authenticated session.</p>
          </div>
        </div>
      </aside>
    </section>
  );
};

const styles = {
  emptyWrapper: { flex: 1, display: "flex", alignItems: "center", justifyContent: "center", position: "relative" },
  emptyContent: { textAlign: "center", padding: "40px", maxWidth: "420px" },
  emptyIcon: {
    width: "104px",
    height: "104px",
    borderRadius: "50%",
    background: "var(--accent-dim)",
    border: "1px solid rgba(242,202,80,0.20)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "var(--accent)",
    margin: "0 auto 24px",
    boxShadow: "0 18px 46px rgba(0,0,0,0.36)",
  },
  emptyTitle: { fontFamily: "var(--font-display)", fontSize: "26px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "8px" },
  emptySubtitle: { fontSize: "14px", color: "var(--text-muted)", margin: "0 auto" },
  outerContainer: { flex: 1, display: "flex", overflow: "hidden", minWidth: 0 },
  chatContainer: { flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", position: "relative", minWidth: 0 },
  chatHeader: {
    height: "68px",
    minHeight: "68px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 24px",
    background: "rgba(19,19,19,0.76)",
    backdropFilter: "blur(18px)",
    WebkitBackdropFilter: "blur(18px)",
    borderBottom: "1px solid rgba(153,144,124,0.10)",
    zIndex: "var(--z-header)",
  },
  headerLeft: { display: "flex", alignItems: "center", gap: "12px", minWidth: 0 },
  mobileBack: {
    width: "36px",
    height: "36px",
    borderRadius: "var(--r-full)",
    border: "1px solid var(--border)",
    background: "var(--surface)",
    color: "var(--text-secondary)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerName: { fontFamily: "var(--font-display)", fontSize: "15px", fontWeight: 700, color: "var(--text-primary)", margin: 0 },
  headerStatus: { fontFamily: "var(--font-mono)", fontSize: "10px", color: "var(--accent)", margin: 0, marginTop: "2px", textTransform: "uppercase", letterSpacing: "0.12em" },
  headerRight: { display: "flex", alignItems: "center", gap: "8px" },
  headerBtn: {
    width: "40px",
    height: "40px",
    borderRadius: "var(--r-full)",
    border: "1px solid var(--border)",
    background: "var(--surface)",
    color: "var(--text-secondary)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  messagesArea: { flex: 1, overflowY: "auto", padding: "24px", display: "flex", flexDirection: "column", gap: "10px" },
  dayPill: {
    alignSelf: "center",
    padding: "5px 14px",
    borderRadius: "var(--r-full)",
    background: "rgba(53,53,52,0.42)",
    color: "var(--text-muted)",
    fontFamily: "var(--font-mono)",
    fontSize: "10px",
    textTransform: "uppercase",
    letterSpacing: "0.14em",
    marginBottom: "12px",
  },
  loadingWrapper: { display: "flex", flexDirection: "column", gap: "12px", padding: "20px" },
  skeleton: { height: "52px", borderRadius: "var(--r-xl)", background: "linear-gradient(90deg, rgba(53,53,52,0.25) 25%, rgba(80,72,52,0.28) 50%, rgba(53,53,52,0.25) 75%)", backgroundSize: "200% 100%", animation: "shimmer 1.5s infinite" },
  noMessages: { flex: 1, display: "flex", alignItems: "center", justifyContent: "center" },
  noMessagesText: { fontSize: "14px", color: "var(--text-muted)" },
  typingBubble: {
    display: "flex",
    gap: "5px",
    alignItems: "center",
    padding: "11px 16px",
    borderRadius: "18px 18px 18px 4px",
    background: "rgba(32,31,29,0.74)",
    border: "1px solid var(--border)",
    width: "fit-content",
    marginTop: "4px",
  },
  typingDot: { width: "6px", height: "6px", borderRadius: "50%", background: "var(--accent)", animation: "pulse-dot 1s infinite" },
  scrollBtn: {
    position: "absolute",
    bottom: "96px",
    right: "32px",
    width: "38px",
    height: "38px",
    borderRadius: "50%",
    background: "var(--glass-bg)",
    backdropFilter: "blur(10px)",
    border: "1px solid var(--glass-border)",
    color: "var(--text-secondary)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 5,
  },
  replyBar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "10px 24px",
    background: "rgba(212,175,55,0.08)",
    borderTop: "1px solid var(--border)",
  },
  replyLeft: { display: "flex", alignItems: "stretch", gap: "10px", minWidth: 0 },
  replyAccent: { width: "3px", borderRadius: "2px", background: "var(--accent)" },
  replyLabel: { fontFamily: "var(--font-mono)", fontSize: "10px", color: "var(--accent)", display: "block", marginBottom: "2px", textTransform: "uppercase", letterSpacing: "0.10em" },
  replyText: { fontSize: "12px", color: "var(--text-secondary)", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
  replyClose: { width: "28px", height: "28px", borderRadius: "var(--r-full)", border: "none", background: "transparent", color: "var(--text-muted)", display: "flex", alignItems: "center", justifyContent: "center" },
  inputSection: {
    padding: "14px 24px 18px",
    background: "rgba(19,19,19,0.82)",
    backdropFilter: "blur(20px)",
    WebkitBackdropFilter: "blur(20px)",
    borderTop: "1px solid rgba(153,144,124,0.10)",
  },
  inputRow: {
    display: "flex",
    alignItems: "center",
    gap: "9px",
    padding: "7px 8px",
    borderRadius: "var(--r-full)",
    background: "rgba(28,27,26,0.88)",
    border: "1px solid var(--border)",
  },
  inputIconBtn: {
    width: "38px",
    height: "38px",
    borderRadius: "50%",
    border: "none",
    background: "transparent",
    color: "var(--text-muted)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  messageInput: { flex: 1, border: "none", background: "transparent", color: "var(--text-primary)", fontSize: "14px", fontFamily: "var(--font-body)", outline: "none", padding: "8px 4px", minWidth: 0 },
  sendBtn: {
    width: "42px",
    height: "42px",
    borderRadius: "50%",
    border: "none",
    background: "linear-gradient(135deg, var(--accent-soft), var(--accent-strong))",
    color: "#241a00",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    boxShadow: "0 8px 20px rgba(212,175,55,0.22)",
  },
  rightPanel: {
    width: "280px",
    minWidth: "280px",
    height: "100%",
    background: "rgba(20,19,18,0.72)",
    backdropFilter: "blur(18px)",
    WebkitBackdropFilter: "blur(18px)",
    borderLeft: "1px solid rgba(153,144,124,0.10)",
    padding: "22px 18px",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    overflowY: "auto",
  },
  panelCard: {
    padding: "24px 16px",
    borderRadius: "var(--r-xl)",
    background: "var(--glass-bg)",
    border: "1px solid var(--glass-border)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "10px",
    boxShadow: "var(--glass-shadow)",
  },
  profileName: { fontFamily: "var(--font-display)", fontSize: "17px", fontWeight: 700, color: "var(--text-primary)", margin: "4px 0 0" },
  profileAbout: { fontSize: "13px", color: "var(--text-muted)", textAlign: "center", margin: "4px 0 0" },
  profileUsername: { fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--accent)" },
  securityCard: {
    display: "flex",
    gap: "12px",
    padding: "16px",
    borderRadius: "var(--r-xl)",
    background: "rgba(212,175,55,0.08)",
    border: "1px solid rgba(242,202,80,0.14)",
    color: "var(--accent)",
  },
  securityTitle: { margin: 0, fontSize: "13px", fontWeight: 700, color: "var(--text-primary)" },
  securityCopy: { margin: "3px 0 0", fontSize: "12px", color: "var(--text-muted)", lineHeight: 1.5 },
};

export default ChatArea;
