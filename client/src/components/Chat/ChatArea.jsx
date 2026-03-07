import React, { useState, useEffect, useRef } from "react";
import useChatStore from "../../store/useChatStore";
import useAuthStore from "../../store/useAuthStore";
import useSocketStore from "../../store/useSocketStore";
import useCallStore from "../../store/useCallStore";
import MessageBubble from "./MessageBubble";
import VoiceRecorder from "./VoiceRecorder";

const ChatArea = () => {
  const {
    selectedUser,
    messages,
    isMessagesLoading,
    sendMessage,
    subscribeToMessages,
    unsubscribeFromMessages,
    typingUsers,
    replyingTo,
    cancelReply,
    markAsRead,
  } = useChatStore();
  const { authUser } = useAuthStore();
  const { socket, onlineUsers } = useSocketStore();
  const { startCall } = useCallStore();
  const [text, setText] = useState("");
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    if (selectedUser && socket) {
      subscribeToMessages(socket);
      // Mark messages from this user as read
      markAsRead(selectedUser._id);
    }
    return () => {
      unsubscribeFromMessages(socket);
    };
  }, [selectedUser, socket]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Typing indicator logic
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

  const handleVoiceSend = async (blob) => {
    // Voice messages would use file upload infrastructure
    // For now, this is a placeholder — full file upload needs multipart
    console.log("Voice message recorded, size:", blob.size);
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
        <div style={styles.emptyGrid} />
        <div style={styles.emptyContent} className="animate-fade-in-up">
          <div style={styles.emptyIconOuter}>
            <div style={styles.emptyIcon}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3" />
                <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83" />
              </svg>
            </div>
          </div>
          <h2 style={styles.emptyTitle}>NEURAL CORE READY</h2>
          <p style={styles.emptySubtitle}>
            Select a node from the Core Stream to initiate quantum communication
          </p>
          <div style={styles.emptyBadge}>
            <span style={styles.emptyBadgeDot} />
            AWAITING NEURAL LINK
          </div>
        </div>
      </div>
    );
  }

  const isOnline = onlineUsers.includes(selectedUser._id);

  return (
    <div style={styles.outerContainer}>
      {/* ═══ MAIN CHAT COLUMN ═══ */}
      <div style={styles.chatContainer}>
        {/* ── Chat Header with call buttons ── */}
        <div style={styles.chatHeader}>
          <div style={styles.chatHeaderLeft}>
            <div style={styles.headerIconContainer}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent-cyan)" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <polygon points="10 8 16 12 10 16 10 8" />
              </svg>
            </div>
            <div>
              <h3 style={styles.headerName}>{selectedUser.fullname}</h3>
              <p style={styles.headerSubtext}>
                {isTyping ? (
                  <span style={styles.typingText}>typing...</span>
                ) : isOnline ? (
                  "Online — Neural link active"
                ) : (
                  `Last seen ${selectedUser.lastSeen ? new Date(selectedUser.lastSeen).toLocaleString() : "recently"}`
                )}
              </p>
            </div>
          </div>

          <div style={styles.headerRight}>
            {/* Voice Call */}
            <button onClick={() => handleCall("audio")} style={styles.callBtn} title="Voice Call">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
            </button>

            {/* Video Call */}
            <button onClick={() => handleCall("video")} style={styles.callBtn} title="Video Call">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="23 7 16 12 23 17 23 7" />
                <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
              </svg>
            </button>

            <div style={styles.headerBadge}>
              {isOnline ? "SPATIAL DEPTH ACTIVE" : "LINK DORMANT"}
            </div>
          </div>
        </div>

        {/* ── Messages Area ── */}
        <div style={styles.messagesArea}>
          {isMessagesLoading ? (
            <div style={styles.loadingMessages}>
              {[1, 2, 3].map((i) => (
                <div key={i} style={{
                  ...styles.msgSkeleton,
                  alignSelf: i % 2 === 0 ? "flex-end" : "flex-start",
                  width: `${Math.random() * 30 + 25}%`,
                }} />
              ))}
            </div>
          ) : messages.length === 0 ? (
            <div style={styles.noMessages}>
              <div style={styles.systemMsg}>
                NEURAL SYNC: ESTABLISHING QUANTUM LINK...
              </div>
              <p style={styles.noMessagesText}>
                No transmissions yet. Initiate neural query below.
              </p>
            </div>
          ) : (
            <>
              {messages.map((msg, index) => {
                const isSent = msg.senderId === authUser?._id;
                const showSystemMsg = index === Math.floor(messages.length / 2) && messages.length > 3;
                return (
                  <React.Fragment key={msg._id}>
                    {showSystemMsg && (
                      <div style={styles.systemMsg}>NEURAL SYNC: RE-CALCULATING PATHING...</div>
                    )}
                    <MessageBubble
                      message={msg}
                      isSent={isSent}
                      senderName={isSent ? authUser?.fullname : selectedUser.fullname}
                    />
                  </React.Fragment>
                );
              })}
            </>
          )}

          {/* Typing indicator */}
          {isTyping && (
            <div style={styles.typingBubble}>
              <span style={styles.typingDot} />
              <span style={{ ...styles.typingDot, animationDelay: "0.2s" }} />
              <span style={{ ...styles.typingDot, animationDelay: "0.4s" }} />
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* ── Reply Preview ── */}
        {replyingTo && (
          <div style={styles.replyBar}>
            <div style={styles.replyBarLeft}>
              <div style={styles.replyBarAccent} />
              <div>
                <span style={styles.replyBarLabel}>REPLYING TO</span>
                <p style={styles.replyBarText}>
                  {replyingTo.message?.substring(0, 60) || "Message"}
                  {replyingTo.message?.length > 60 ? "..." : ""}
                </p>
              </div>
            </div>
            <button onClick={cancelReply} style={styles.replyCloseBtn}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        )}

        {/* ── Message Input ── */}
        <div style={styles.inputSection}>
          <form onSubmit={handleSend} style={styles.inputArea}>
            <div style={styles.inputContainer}>
              {/* Plus button (file/image picker) */}
              <label style={styles.inputIconBtn} title="Attach file">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="16" />
                  <line x1="8" y1="12" x2="16" y2="12" />
                </svg>
              </label>

              <input
                type="text"
                placeholder="Transmit neural query..."
                value={text}
                onChange={handleTyping}
                style={styles.messageInput}
              />

              {/* Voice Recorder */}
              <VoiceRecorder onSend={handleVoiceSend} />

              {/* Send button */}
              <button
                type="submit"
                disabled={!text.trim()}
                style={{
                  ...styles.sendBtn,
                  opacity: text.trim() ? 1 : 0.4,
                  cursor: text.trim() ? "pointer" : "not-allowed",
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </button>
            </div>
          </form>

          <div style={styles.inputFooter}>
            <span style={styles.inputHint}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
              </svg>
              Auto-Optimize Prompt
            </span>
            <span style={styles.inputHint}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              End-to-End Neural Encryption
            </span>
          </div>
        </div>
      </div>

      {/* ═══ RIGHT INFO PANEL ═══ */}
      <div style={styles.rightPanel}>
        {/* User Profile Card */}
        <div style={styles.panelCard}>
          <h4 style={styles.panelTitle}>OPERATOR PROFILE</h4>
          <div style={styles.profileSection}>
            <img
              src={selectedUser.profilePic || `https://api.dicebear.com/7.x/initials/svg?seed=${selectedUser.fullname}`}
              alt={selectedUser.fullname}
              style={styles.profilePic}
            />
            <span style={styles.profileName}>{selectedUser.fullname}</span>
            <span style={styles.profileAbout}>{selectedUser.about || "Neural Core operator"}</span>
          </div>
        </div>

        {/* Environment Data */}
        <div style={styles.panelCard}>
          <h4 style={styles.panelTitle}>ENVIRONMENT DATA</h4>
          <div style={styles.dataRow}>
            <span style={styles.dataLabel}>Atmospheric Flow</span>
            <span style={{ ...styles.dataValue, color: "var(--accent-cyan)" }}>Stable</span>
          </div>
          <div style={styles.dataSeparator} />
          <div style={styles.dataRow}>
            <span style={styles.dataLabel}>Neural Load</span>
            <span style={{ ...styles.dataValue, color: "var(--accent-cyan)" }}>Low</span>
          </div>
          <div style={styles.dataSeparator} />
          <div style={styles.dataRow}>
            <span style={styles.dataLabel}>Quantum Drift</span>
            <span style={{ ...styles.dataValue, color: "var(--accent-cyan)" }}>0.002%</span>
          </div>
        </div>

        {/* Spatial Map */}
        <div style={styles.panelCard}>
          <h4 style={styles.panelTitle}>SPATIAL MAP</h4>
          <div style={styles.mapArea}>
            <div style={styles.mapDots}>
              <span style={{ ...styles.mapDot, background: "var(--success)" }} />
              <span style={{ ...styles.mapDot, background: "var(--accent-cyan)" }} />
            </div>
            <div style={styles.mapGrid}>
              <div style={styles.mapInnerBox} />
              <div style={styles.mapPoint} />
            </div>
            <div style={styles.mapCoords}>
              <span style={styles.coordText}>COORD: 34.673 // 139.461</span>
            </div>
          </div>
        </div>

        {/* Direct Link */}
        <div style={styles.linkCard}>
          <span style={styles.linkLabel}>DIRECT LINK</span>
          <span style={styles.linkValue}>Connect to Orbital Node 4</span>
        </div>

        <div style={styles.linkCard}>
          <span style={styles.linkLabelPurple}>ACTIVE CHANNEL</span>
          <span style={styles.linkValue}>Satellite Relay Grid</span>
        </div>
      </div>
    </div>
  );
};

const styles = {
  /* ── Empty State ── */
  emptyWrapper: { flex: 1, display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg-primary)", position: "relative", overflow: "hidden" },
  emptyGrid: { position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(0,229,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(0,229,255,0.02) 1px, transparent 1px)", backgroundSize: "50px 50px", pointerEvents: "none" },
  emptyContent: { textAlign: "center", padding: "40px", position: "relative", zIndex: 1 },
  emptyIconOuter: { display: "flex", justifyContent: "center", marginBottom: "28px" },
  emptyIcon: { width: "100px", height: "100px", borderRadius: "50%", background: "rgba(0,229,255,0.05)", border: "1px solid rgba(0,229,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--accent-cyan)", animation: "pulse-cyan 3s infinite" },
  emptyTitle: { fontFamily: "var(--font-heading)", fontSize: "20px", fontWeight: "700", color: "var(--text-primary)", marginBottom: "10px", letterSpacing: "0.15em" },
  emptySubtitle: { fontSize: "14px", color: "var(--text-muted)", maxWidth: "340px", margin: "0 auto", lineHeight: "1.6", fontFamily: "var(--font-body)", fontWeight: "500" },
  emptyBadge: { display: "inline-flex", alignItems: "center", gap: "8px", marginTop: "24px", padding: "8px 20px", borderRadius: "var(--radius-full)", background: "rgba(0,229,255,0.06)", border: "1px solid rgba(0,229,255,0.12)", fontFamily: "var(--font-mono)", fontSize: "10px", color: "var(--accent-cyan)", letterSpacing: "0.15em" },
  emptyBadgeDot: { width: "6px", height: "6px", borderRadius: "50%", background: "var(--accent-cyan)", animation: "pulse-dot 2s infinite" },

  /* ── Outer ── */
  outerContainer: { flex: 1, display: "flex", overflow: "hidden" },

  /* ── Chat ── */
  chatContainer: { flex: 1, display: "flex", flexDirection: "column", background: "var(--bg-primary)", overflow: "hidden", minWidth: 0 },

  /* ── Header ── */
  chatHeader: { height: "70px", minHeight: "70px", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 24px", background: "var(--bg-secondary)", borderBottom: "1px solid var(--border-color)" },
  chatHeaderLeft: { display: "flex", alignItems: "center", gap: "14px" },
  headerIconContainer: { width: "42px", height: "42px", borderRadius: "var(--radius-md)", background: "rgba(0,229,255,0.06)", border: "1px solid rgba(0,229,255,0.12)", display: "flex", alignItems: "center", justifyContent: "center" },
  headerName: { fontFamily: "var(--font-heading)", fontSize: "14px", fontWeight: "700", color: "var(--text-primary)", margin: 0, letterSpacing: "0.05em" },
  headerSubtext: { fontSize: "12px", color: "var(--text-muted)", fontFamily: "var(--font-body)", fontWeight: "500", margin: 0, marginTop: "2px" },
  typingText: { color: "var(--accent-cyan)", fontStyle: "italic" },
  headerRight: { display: "flex", alignItems: "center", gap: "8px" },
  callBtn: { width: "36px", height: "36px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-color)", background: "transparent", color: "var(--text-secondary)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "all var(--transition-fast)" },
  headerBadge: { padding: "5px 14px", borderRadius: "var(--radius-full)", background: "rgba(0,229,255,0.08)", border: "1px solid rgba(0,229,255,0.15)", fontFamily: "var(--font-mono)", fontSize: "9px", color: "var(--accent-cyan)", letterSpacing: "0.15em" },

  /* ── Messages ── */
  messagesArea: { flex: 1, overflowY: "auto", padding: "20px 24px", display: "flex", flexDirection: "column", backgroundImage: "linear-gradient(rgba(0,229,255,0.01) 1px, transparent 1px), linear-gradient(90deg, rgba(0,229,255,0.01) 1px, transparent 1px)", backgroundSize: "50px 50px" },
  loadingMessages: { display: "flex", flexDirection: "column", gap: "12px", padding: "20px" },
  msgSkeleton: { height: "50px", borderRadius: "var(--radius-md)", background: "linear-gradient(90deg, rgba(0,229,255,0.03) 25%, rgba(0,229,255,0.06) 50%, rgba(0,229,255,0.03) 75%)", backgroundSize: "200% 100%", animation: "shimmer 1.5s infinite" },
  noMessages: { flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "12px" },
  noMessagesText: { fontSize: "13px", color: "var(--text-muted)", fontFamily: "var(--font-body)", fontWeight: "500" },
  systemMsg: { alignSelf: "center", padding: "6px 20px", borderRadius: "var(--radius-full)", background: "rgba(0,229,255,0.04)", border: "1px solid rgba(0,229,255,0.08)", fontFamily: "var(--font-mono)", fontSize: "9px", color: "var(--text-muted)", letterSpacing: "0.15em", margin: "16px 0", textTransform: "uppercase" },

  /* ── Typing Bubble ── */
  typingBubble: { display: "flex", gap: "4px", alignItems: "center", padding: "10px 16px", borderRadius: "var(--radius-md)", background: "rgba(0,229,255,0.04)", border: "1px solid rgba(0,229,255,0.08)", width: "fit-content", marginBottom: "8px" },
  typingDot: { width: "6px", height: "6px", borderRadius: "50%", background: "var(--accent-cyan)", animation: "pulse-dot 1s infinite" },

  /* ── Reply Bar ── */
  replyBar: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 24px", background: "rgba(0,229,255,0.04)", borderTop: "1px solid var(--border-color)" },
  replyBarLeft: { display: "flex", alignItems: "stretch", gap: "10px" },
  replyBarAccent: { width: "3px", borderRadius: "2px", background: "var(--accent-cyan)" },
  replyBarLabel: { fontFamily: "var(--font-mono)", fontSize: "9px", color: "var(--accent-cyan)", letterSpacing: "0.15em", display: "block", marginBottom: "2px" },
  replyBarText: { fontSize: "12px", color: "var(--text-secondary)", fontFamily: "var(--font-body)", fontWeight: "500", margin: 0 },
  replyCloseBtn: { width: "28px", height: "28px", borderRadius: "var(--radius-sm)", border: "none", background: "transparent", color: "var(--text-muted)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" },

  /* ── Input ── */
  inputSection: { padding: "12px 24px 8px", borderTop: "1px solid var(--border-color)", background: "var(--bg-secondary)" },
  inputArea: {},
  inputContainer: { display: "flex", alignItems: "center", gap: "8px", padding: "6px", borderRadius: "var(--radius-lg)", border: "1px solid var(--border-color)", background: "rgba(0,229,255,0.02)", transition: "border-color var(--transition-fast)" },
  inputIconBtn: { width: "36px", height: "36px", borderRadius: "var(--radius-md)", border: "none", background: "transparent", color: "var(--text-muted)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 },
  messageInput: { flex: 1, border: "none", background: "transparent", color: "var(--text-primary)", fontSize: "14px", fontFamily: "var(--font-body)", fontWeight: "500", outline: "none", padding: "8px 4px", letterSpacing: "0.02em" },
  sendBtn: { width: "40px", height: "40px", borderRadius: "var(--radius-md)", border: "none", background: "linear-gradient(135deg, #7c4dff 0%, #651fff 100%)", color: "white", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "transform var(--transition-fast), box-shadow var(--transition-fast)", boxShadow: "0 4px 16px rgba(124,77,255,0.35)", flexShrink: 0 },
  inputFooter: { display: "flex", alignItems: "center", justifyContent: "center", gap: "24px", padding: "8px 0 4px" },
  inputHint: { display: "flex", alignItems: "center", gap: "5px", fontFamily: "var(--font-mono)", fontSize: "9px", color: "var(--text-muted)", letterSpacing: "0.05em" },

  /* ═══ RIGHT PANEL ═══ */
  rightPanel: { width: "260px", minWidth: "260px", height: "100%", background: "var(--bg-secondary)", borderLeft: "1px solid var(--border-color)", padding: "16px", display: "flex", flexDirection: "column", gap: "12px", overflowY: "auto" },
  panelCard: { padding: "16px", borderRadius: "var(--radius-md)", background: "var(--bg-panel)", border: "1px solid var(--border-color)" },
  panelTitle: { fontFamily: "var(--font-heading)", fontSize: "11px", fontWeight: "700", color: "var(--text-primary)", letterSpacing: "0.12em", margin: "0 0 14px 0" },

  /* Profile */
  profileSection: { display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" },
  profilePic: { width: "56px", height: "56px", borderRadius: "var(--radius-full)", objectFit: "cover", border: "2px solid rgba(0,229,255,0.2)" },
  profileName: { fontFamily: "var(--font-heading)", fontSize: "12px", fontWeight: "700", color: "var(--text-primary)", letterSpacing: "0.1em" },
  profileAbout: { fontFamily: "var(--font-body)", fontSize: "11px", color: "var(--text-muted)", fontWeight: "500", textAlign: "center" },

  /* Data */
  dataRow: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "6px 0" },
  dataLabel: { fontSize: "12px", fontFamily: "var(--font-body)", fontWeight: "500", color: "var(--text-secondary)" },
  dataValue: { fontSize: "12px", fontFamily: "var(--font-mono)" },
  dataSeparator: { height: "1px", background: "var(--border-color)" },

  /* Map */
  mapArea: { borderRadius: "var(--radius-sm)", background: "rgba(0,229,255,0.03)", border: "1px solid var(--border-color)", padding: "12px", position: "relative" },
  mapDots: { position: "absolute", top: "10px", right: "10px", display: "flex", gap: "5px" },
  mapDot: { width: "6px", height: "6px", borderRadius: "50%", display: "inline-block" },
  mapGrid: { height: "80px", borderRadius: "var(--radius-sm)", border: "1px solid rgba(0,229,255,0.06)", background: "rgba(0,229,255,0.02)", position: "relative", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "8px" },
  mapInnerBox: { width: "70px", height: "40px", border: "1px solid rgba(0,229,255,0.1)", borderRadius: "2px" },
  mapPoint: { position: "absolute", bottom: "15px", left: "50%", transform: "translateX(-50%)", width: "8px", height: "8px", borderRadius: "50%", background: "var(--accent-purple)", boxShadow: "0 0 10px rgba(124,77,255,0.6)" },
  mapCoords: { display: "flex", flexDirection: "column", gap: "2px" },
  coordText: { fontFamily: "var(--font-mono)", fontSize: "8px", color: "var(--text-muted)", letterSpacing: "0.1em" },

  /* Links */
  linkCard: { padding: "14px 16px", borderRadius: "var(--radius-md)", background: "var(--bg-panel)", border: "1px solid var(--border-color)", display: "flex", flexDirection: "column", gap: "6px" },
  linkLabel: { fontFamily: "var(--font-mono)", fontSize: "9px", color: "var(--accent-cyan)", letterSpacing: "0.12em" },
  linkLabelPurple: { fontFamily: "var(--font-mono)", fontSize: "9px", color: "var(--accent-purple-light)", letterSpacing: "0.12em" },
  linkValue: { fontSize: "13px", fontFamily: "var(--font-body)", fontWeight: "600", color: "var(--text-primary)" },
};

export default ChatArea;
