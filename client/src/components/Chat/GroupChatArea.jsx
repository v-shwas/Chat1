import React, { useState, useEffect, useRef } from "react";
import useGroupStore from "../../store/useGroupStore";
import useAuthStore from "../../store/useAuthStore";
import useSocketStore from "../../store/useSocketStore";

const GroupChatArea = () => {
  const {
    selectedGroup, groupMessages, isGroupMessagesLoading,
    getGroupMessages, sendGroupMessage, leaveGroup,
  } = useGroupStore();
  const { authUser } = useAuthStore();
  const { socket } = useSocketStore();
  const [text, setText] = useState("");
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (selectedGroup) {
      getGroupMessages(selectedGroup._id);
      if (socket) {
        socket.emit("joinGroup", selectedGroup._id);
      }
    }
  }, [selectedGroup]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [groupMessages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    await sendGroupMessage({ message: text.trim() });
    setText("");
  };

  if (!selectedGroup) return null;

  return (
    <div style={styles.outerContainer}>
      <div style={styles.chatContainer}>
        {/* Header */}
        <div style={styles.chatHeader}>
          <div style={styles.chatHeaderLeft}>
            <div style={styles.groupAvatar}>◈</div>
            <div>
              <h3 style={styles.headerName}>{selectedGroup.name}</h3>
              <p style={styles.headerSubtext}>
                {selectedGroup.members?.length || 0} members
              </p>
            </div>
          </div>
          <div style={styles.headerRight}>
            <button
              onClick={() => leaveGroup(selectedGroup._id)}
              style={styles.leaveBtn}
              title="Leave Group"
            >
              Leave
            </button>
            <div style={styles.headerBadge}>GROUP CHANNEL</div>
          </div>
        </div>

        {/* Messages */}
        <div style={styles.messagesArea}>
          {isGroupMessagesLoading ? (
            <div style={styles.loadingMessages}>
              {[1, 2, 3].map((i) => (
                <div key={i} style={{ ...styles.msgSkeleton, width: `${Math.random() * 30 + 25}%` }} />
              ))}
            </div>
          ) : groupMessages.length === 0 ? (
            <div style={styles.noMessages}>
              <p style={styles.systemMsg}>GROUP CHANNEL INITIALIZED</p>
              <p style={styles.noMessagesText}>Start the conversation!</p>
            </div>
          ) : (
            groupMessages.map((msg) => {
              const isSent = (msg.senderId?._id || msg.senderId) === authUser?._id;
              const senderName = msg.senderId?.fullname || "Unknown";
              return (
                <div
                  key={msg._id}
                  style={{ ...styles.msgWrapper, justifyContent: isSent ? "flex-end" : "flex-start" }}
                >
                  <div style={styles.msgGroup}>
                    {!isSent && (
                      <span style={styles.groupSenderName}>{senderName}</span>
                    )}
                    <div style={{ ...styles.bubble, ...(isSent ? styles.sent : styles.received) }}>
                      <p style={styles.msgText}>{msg.message}</p>
                      <span style={styles.msgTime}>
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div style={styles.inputSection}>
          <form onSubmit={handleSend} style={styles.inputContainer}>
            <input
              type="text"
              placeholder="Message group..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              style={styles.messageInput}
            />
            <button
              type="submit"
              disabled={!text.trim()}
              style={{ ...styles.sendBtn, opacity: text.trim() ? 1 : 0.4 }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </button>
          </form>
        </div>
      </div>

      {/* Right Panel */}
      <div style={styles.rightPanel}>
        <div style={styles.panelCard}>
          <h4 style={styles.panelTitle}>GROUP INFO</h4>
          <p style={styles.groupDesc}>{selectedGroup.description || "No description"}</p>
        </div>
        <div style={styles.panelCard}>
          <h4 style={styles.panelTitle}>MEMBERS ({selectedGroup.members?.length || 0})</h4>
          <div style={styles.memberList}>
            {selectedGroup.members?.map((member) => (
              <div key={member._id} style={styles.memberRow}>
                <img
                  src={member.profilePic || `https://api.dicebear.com/7.x/initials/svg?seed=${member.fullname}`}
                  alt={member.fullname}
                  style={styles.memberAvatar}
                />
                <span style={styles.memberName}>{member.fullname}</span>
                {selectedGroup.admins?.some((a) => (a._id || a) === member._id) && (
                  <span style={styles.adminBadge}>ADMIN</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  outerContainer: { flex: 1, display: "flex", overflow: "hidden" },
  chatContainer: { flex: 1, display: "flex", flexDirection: "column", background: "var(--bg-primary)", overflow: "hidden" },
  chatHeader: { height: "70px", minHeight: "70px", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 24px", background: "var(--bg-secondary)", borderBottom: "1px solid var(--border-color)" },
  chatHeaderLeft: { display: "flex", alignItems: "center", gap: "14px" },
  groupAvatar: { width: "42px", height: "42px", borderRadius: "var(--radius-md)", background: "rgba(124,77,255,0.08)", border: "1px solid rgba(124,77,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--accent-purple-light)", fontSize: "20px" },
  headerName: { fontFamily: "var(--font-heading)", fontSize: "14px", fontWeight: "700", color: "var(--text-primary)", margin: 0, letterSpacing: "0.05em" },
  headerSubtext: { fontSize: "12px", color: "var(--text-muted)", fontFamily: "var(--font-body)", fontWeight: "500", margin: 0 },
  headerRight: { display: "flex", alignItems: "center", gap: "8px" },
  leaveBtn: { padding: "5px 14px", borderRadius: "var(--radius-full)", border: "1px solid rgba(255,23,68,0.2)", background: "rgba(255,23,68,0.06)", fontFamily: "var(--font-mono)", fontSize: "9px", color: "var(--danger)", letterSpacing: "0.1em", cursor: "pointer" },
  headerBadge: { padding: "5px 14px", borderRadius: "var(--radius-full)", background: "rgba(124,77,255,0.08)", border: "1px solid rgba(124,77,255,0.15)", fontFamily: "var(--font-mono)", fontSize: "9px", color: "var(--accent-purple-light)", letterSpacing: "0.15em" },
  messagesArea: { flex: 1, overflowY: "auto", padding: "20px 24px", display: "flex", flexDirection: "column" },
  loadingMessages: { display: "flex", flexDirection: "column", gap: "12px" },
  msgSkeleton: { height: "50px", borderRadius: "var(--radius-md)", background: "linear-gradient(90deg, rgba(0,229,255,0.03) 25%, rgba(0,229,255,0.06) 50%, rgba(0,229,255,0.03) 75%)", backgroundSize: "200% 100%", animation: "shimmer 1.5s infinite" },
  noMessages: { flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "8px" },
  noMessagesText: { fontSize: "13px", color: "var(--text-muted)", fontFamily: "var(--font-body)", fontWeight: "500" },
  systemMsg: { padding: "6px 20px", borderRadius: "var(--radius-full)", background: "rgba(124,77,255,0.04)", border: "1px solid rgba(124,77,255,0.08)", fontFamily: "var(--font-mono)", fontSize: "9px", color: "var(--text-muted)", letterSpacing: "0.15em", textTransform: "uppercase" },
  msgWrapper: { display: "flex", marginBottom: "6px", padding: "0 4px" },
  msgGroup: { maxWidth: "65%", display: "flex", flexDirection: "column", gap: "3px" },
  groupSenderName: { fontFamily: "var(--font-mono)", fontSize: "9px", color: "var(--accent-cyan)", letterSpacing: "0.1em", padding: "0 4px" },
  bubble: { padding: "10px 16px", borderRadius: "var(--radius-md)", position: "relative" },
  sent: { background: "rgba(124,77,255,0.1)", border: "1px solid rgba(124,77,255,0.15)", borderBottomRightRadius: "4px" },
  received: { background: "rgba(0,229,255,0.04)", border: "1px solid rgba(0,229,255,0.08)", borderBottomLeftRadius: "4px" },
  msgText: { fontSize: "14px", lineHeight: "1.6", margin: 0, wordBreak: "break-word", fontFamily: "var(--font-body)", fontWeight: "500", color: "var(--text-primary)" },
  msgTime: { fontSize: "9px", fontFamily: "var(--font-mono)", color: "var(--text-muted)", marginTop: "4px", display: "block", textAlign: "right" },
  inputSection: { padding: "12px 24px", borderTop: "1px solid var(--border-color)", background: "var(--bg-secondary)" },
  inputContainer: { display: "flex", alignItems: "center", gap: "8px", padding: "6px", borderRadius: "var(--radius-lg)", border: "1px solid var(--border-color)", background: "rgba(0,229,255,0.02)" },
  messageInput: { flex: 1, border: "none", background: "transparent", color: "var(--text-primary)", fontSize: "14px", fontFamily: "var(--font-body)", fontWeight: "500", outline: "none", padding: "8px 4px" },
  sendBtn: { width: "40px", height: "40px", borderRadius: "var(--radius-md)", border: "none", background: "linear-gradient(135deg, #7c4dff 0%, #651fff 100%)", color: "white", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: "0 4px 16px rgba(124,77,255,0.35)", flexShrink: 0 },
  rightPanel: { width: "260px", minWidth: "260px", height: "100%", background: "var(--bg-secondary)", borderLeft: "1px solid var(--border-color)", padding: "16px", display: "flex", flexDirection: "column", gap: "12px", overflowY: "auto" },
  panelCard: { padding: "16px", borderRadius: "var(--radius-md)", background: "var(--bg-panel)", border: "1px solid var(--border-color)" },
  panelTitle: { fontFamily: "var(--font-heading)", fontSize: "11px", fontWeight: "700", color: "var(--text-primary)", letterSpacing: "0.12em", margin: "0 0 12px 0" },
  groupDesc: { fontSize: "12px", color: "var(--text-muted)", fontFamily: "var(--font-body)", fontWeight: "500", margin: 0 },
  memberList: { display: "flex", flexDirection: "column", gap: "8px" },
  memberRow: { display: "flex", alignItems: "center", gap: "10px" },
  memberAvatar: { width: "28px", height: "28px", borderRadius: "var(--radius-sm)", objectFit: "cover", border: "1px solid var(--border-color)" },
  memberName: { fontSize: "12px", fontFamily: "var(--font-body)", fontWeight: "600", color: "var(--text-primary)", flex: 1 },
  adminBadge: { fontFamily: "var(--font-mono)", fontSize: "8px", color: "var(--accent-cyan)", background: "rgba(0,229,255,0.06)", padding: "2px 6px", borderRadius: "var(--radius-full)", letterSpacing: "0.1em" },
};

export default GroupChatArea;
