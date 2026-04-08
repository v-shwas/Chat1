import { useState, useEffect, useRef } from "react";
import useGroupStore from "../../store/useGroupStore";
import useAuthStore from "../../store/useAuthStore";
import useSocketStore from "../../store/useSocketStore";
import Avatar from "../ui/Avatar";
import { Send, LogOut } from "lucide-react";

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
      if (socket) socket.emit("joinGroup", selectedGroup._id);
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
    <div style={styles.outer}>
      <div style={styles.chatContainer}>
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.headerLeft}>
            <Avatar name={selectedGroup.name} size="sm" />
            <div>
              <h3 style={styles.headerName}>{selectedGroup.name}</h3>
              <p style={styles.headerSub}>{selectedGroup.members?.length || 0} members</p>
            </div>
          </div>
          <div style={styles.headerRight}>
            <button onClick={() => leaveGroup(selectedGroup._id)} style={styles.leaveBtn} title="Leave Group">
              <LogOut size={14} />
              <span>Leave</span>
            </button>
          </div>
        </div>

        {/* Messages */}
        <div style={styles.messagesArea}>
          {isGroupMessagesLoading ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {[1, 2, 3].map((i) => (
                <div key={i} style={{ height: "50px", borderRadius: "var(--r-md)", background: "var(--surface)", width: `${Math.random() * 30 + 25}%` }} />
              ))}
            </div>
          ) : groupMessages.length === 0 ? (
            <div style={styles.noMessages}>
              <p style={{ fontSize: "14px", color: "var(--text-muted)" }}>No messages yet. Start the conversation!</p>
            </div>
          ) : (
            groupMessages.map((msg) => {
              const isSent = (msg.senderId?._id || msg.senderId) === authUser?._id;
              const senderName = msg.senderId?.fullname || "Unknown";
              return (
                <div key={msg._id} style={{ display: "flex", justifyContent: isSent ? "flex-end" : "flex-start", marginBottom: "4px" }}>
                  <div style={{ maxWidth: "68%", display: "flex", flexDirection: "column", gap: "2px" }}>
                    {!isSent && (
                      <span style={styles.senderLabel}>{senderName}</span>
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
          <form onSubmit={handleSend} style={styles.inputRow}>
            <input
              type="text"
              placeholder="Message group..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              style={styles.messageInput}
            />
            <button type="submit" disabled={!text.trim()} style={{ ...styles.sendBtn, opacity: text.trim() ? 1 : 0.4 }}>
              <Send size={18} />
            </button>
          </form>
        </div>
      </div>

      {/* Right Panel */}
      <div style={styles.rightPanel}>
        <div style={styles.panelCard}>
          <h4 style={styles.panelTitle}>Group Info</h4>
          <p style={styles.groupDesc}>{selectedGroup.description || "No description"}</p>
        </div>
        <div style={styles.panelCard}>
          <h4 style={styles.panelTitle}>Members ({selectedGroup.members?.length || 0})</h4>
          <div style={styles.memberList}>
            {selectedGroup.members?.map((member) => (
              <div key={member._id} style={styles.memberRow}>
                <Avatar src={member.profilePic} name={member.fullname} size="xs" />
                <span style={styles.memberName}>{member.fullname}</span>
                {selectedGroup.admins?.some((a) => (a._id || a) === member._id) && (
                  <span style={styles.adminBadge}>Admin</span>
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
  outer: { flex: 1, display: "flex", overflow: "hidden" },
  chatContainer: { flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" },
  header: {
    height: "60px", minHeight: "60px", display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "0 20px", background: "rgba(3,4,10,0.75)", backdropFilter: "blur(20px)",
    borderBottom: "1px solid var(--border)",
  },
  headerLeft: { display: "flex", alignItems: "center", gap: "12px" },
  headerName: { fontFamily: "var(--font-display)", fontSize: "14px", fontWeight: 700, color: "var(--text-primary)", margin: 0 },
  headerSub: { fontSize: "12px", color: "var(--text-muted)", margin: 0 },
  headerRight: { display: "flex", alignItems: "center", gap: "8px" },
  leaveBtn: {
    display: "flex", alignItems: "center", gap: "6px",
    padding: "6px 14px", borderRadius: "var(--r-full)",
    border: "1px solid rgba(239,68,68,0.2)", background: "rgba(239,68,68,0.06)",
    fontFamily: "var(--font-mono)", fontSize: "11px",
    color: "var(--red)", cursor: "pointer",
  },
  messagesArea: { flex: 1, overflowY: "auto", padding: "20px 24px", display: "flex", flexDirection: "column" },
  noMessages: { flex: 1, display: "flex", alignItems: "center", justifyContent: "center" },
  senderLabel: { fontFamily: "var(--font-mono)", fontSize: "10px", color: "var(--cyan)", padding: "0 4px" },
  bubble: { padding: "10px 14px", position: "relative" },
  sent: {
    background: "linear-gradient(135deg, rgba(108,99,255,0.22), rgba(108,99,255,0.09))",
    border: "1px solid rgba(108,99,255,0.22)", borderRadius: "18px 18px 4px 18px",
  },
  received: {
    background: "var(--glass-bg)", border: "1px solid var(--glass-border)",
    borderRadius: "18px 18px 18px 4px",
  },
  msgText: { fontSize: "14px", lineHeight: "1.55", margin: 0, wordBreak: "break-word", color: "var(--text-primary)" },
  msgTime: { fontSize: "10px", fontFamily: "var(--font-mono)", color: "var(--text-muted)", display: "block", textAlign: "right", marginTop: "4px" },
  inputSection: { padding: "12px 20px 16px", background: "rgba(3,4,10,0.85)", backdropFilter: "blur(30px)", borderTop: "1px solid var(--border)" },
  inputRow: {
    display: "flex", alignItems: "center", gap: "8px", padding: "6px 8px",
    borderRadius: "var(--r-xl)", background: "var(--glass-bg)", border: "1px solid var(--glass-border)",
  },
  messageInput: { flex: 1, border: "none", background: "transparent", color: "var(--text-primary)", fontSize: "14px", fontFamily: "var(--font-body)", outline: "none", padding: "8px 4px" },
  sendBtn: {
    width: "40px", height: "40px", borderRadius: "50%", border: "none",
    background: "linear-gradient(135deg, var(--accent), var(--cyan))", color: "#fff",
    display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0,
  },
  rightPanel: {
    width: "260px", minWidth: "260px", height: "100%",
    background: "rgba(3,4,10,0.6)", backdropFilter: "blur(20px)",
    borderLeft: "1px solid var(--border)", padding: "20px 16px",
    display: "flex", flexDirection: "column", gap: "12px", overflowY: "auto",
  },
  panelCard: { padding: "16px", borderRadius: "var(--r-lg)", background: "var(--glass-bg)", border: "1px solid var(--glass-border)" },
  panelTitle: { fontFamily: "var(--font-display)", fontSize: "13px", fontWeight: 700, color: "var(--text-primary)", margin: "0 0 12px 0" },
  groupDesc: { fontSize: "13px", color: "var(--text-muted)", margin: 0 },
  memberList: { display: "flex", flexDirection: "column", gap: "8px" },
  memberRow: { display: "flex", alignItems: "center", gap: "10px" },
  memberName: { fontSize: "12px", fontWeight: 500, color: "var(--text-primary)", flex: 1 },
  adminBadge: {
    fontFamily: "var(--font-mono)", fontSize: "9px", color: "var(--accent)",
    background: "var(--accent-dim)", padding: "2px 8px", borderRadius: "var(--r-full)",
  },
};

export default GroupChatArea;
