import { useState, useEffect, useRef } from "react";
import useGroupStore from "../../store/useGroupStore";
import useAuthStore from "../../store/useAuthStore";
import useSocketStore from "../../store/useSocketStore";
import Avatar from "../ui/Avatar";
import { ArrowLeft, LogOut, Send, ShieldCheck, Users } from "lucide-react";

const GroupChatArea = () => {
  const {
    selectedGroup,
    groupMessages,
    isGroupMessagesLoading,
    getGroupMessages,
    sendGroupMessage,
    leaveGroup,
    setSelectedGroup,
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
  }, [selectedGroup, getGroupMessages, socket]);

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
    <section style={styles.outer}>
      <div style={styles.chatContainer}>
        <header style={styles.header}>
          <div style={styles.headerLeft}>
            <button className="mobile-only" onClick={() => setSelectedGroup(null)} style={styles.mobileBack}>
              <ArrowLeft size={18} />
            </button>
            <Avatar name={selectedGroup.name} size="md" />
            <div>
              <h3 style={styles.headerName}>{selectedGroup.name}</h3>
              <p style={styles.headerSub}>{selectedGroup.members?.length || 0} members in private room</p>
            </div>
          </div>
          <button onClick={() => leaveGroup(selectedGroup._id)} style={styles.leaveBtn} title="Leave group">
            <LogOut size={14} />
            <span>Leave</span>
          </button>
        </header>

        <div style={styles.messagesArea}>
          <div style={styles.dayPill}>Room activity</div>
          {isGroupMessagesLoading ? (
            <div style={styles.loadingStack}>
              {[1, 2, 3].map((i) => (
                <div key={i} style={{ ...styles.skeleton, width: `${i * 14 + 28}%` }} />
              ))}
            </div>
          ) : groupMessages.length === 0 ? (
            <div style={styles.noMessages}>
              <p style={styles.noMessagesText}>No room messages yet.</p>
            </div>
          ) : (
            groupMessages.map((msg) => {
              const isSent = (msg.senderId?._id || msg.senderId) === authUser?._id;
              const senderName = msg.senderId?.fullname || "Member";
              return (
                <div key={msg._id} style={{ display: "flex", justifyContent: isSent ? "flex-end" : "flex-start", marginBottom: "6px" }}>
                  <div style={{ maxWidth: "68%", display: "flex", flexDirection: "column", gap: "4px", alignItems: isSent ? "flex-end" : "flex-start" }}>
                    {!isSent && <span style={styles.senderLabel}>{senderName}</span>}
                    <div style={{ ...styles.bubble, ...(isSent ? styles.sent : styles.received) }}>
                      <p style={styles.msgText}>{msg.message}</p>
                      <span style={styles.msgTime}>{new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        <footer style={styles.inputSection}>
          <form onSubmit={handleSend} style={styles.inputRow}>
            <input
              type="text"
              placeholder="Message private room"
              value={text}
              onChange={(e) => setText(e.target.value)}
              style={styles.messageInput}
            />
            <button type="submit" disabled={!text.trim()} style={{ ...styles.sendBtn, opacity: text.trim() ? 1 : 0.45 }}>
              <Send size={18} />
            </button>
          </form>
        </footer>
      </div>

      <aside className="desktop-info-panel" style={styles.rightPanel}>
        <div style={styles.panelCard}>
          <ShieldCheck size={22} style={{ color: "var(--accent)" }} />
          <h4 style={styles.panelTitle}>Room Brief</h4>
          <p style={styles.groupDesc}>{selectedGroup.description || "A private Aurum room for trusted collaborators."}</p>
        </div>
        <div style={styles.panelCard}>
          <div style={styles.memberTitle}>
            <Users size={16} />
            <h4 style={styles.panelTitle}>Members ({selectedGroup.members?.length || 0})</h4>
          </div>
          <div style={styles.memberList}>
            {selectedGroup.members?.map((member) => (
              <div key={member._id || member} style={styles.memberRow}>
                <Avatar src={member.profilePic} name={member.fullname || "Member"} size="xs" />
                <span style={styles.memberName}>{member.fullname || "Member"}</span>
                {selectedGroup.admins?.some((a) => (a._id || a) === member._id) && <span style={styles.adminBadge}>Admin</span>}
              </div>
            ))}
          </div>
        </div>
      </aside>
    </section>
  );
};

const styles = {
  outer: { flex: 1, display: "flex", overflow: "hidden", minWidth: 0 },
  chatContainer: { flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minWidth: 0 },
  header: {
    height: "68px",
    minHeight: "68px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 24px",
    background: "rgba(19,19,19,0.76)",
    backdropFilter: "blur(18px)",
    borderBottom: "1px solid rgba(153,144,124,0.10)",
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
  headerSub: { fontFamily: "var(--font-mono)", fontSize: "10px", color: "var(--accent)", margin: 0, marginTop: "2px", textTransform: "uppercase", letterSpacing: "0.12em" },
  leaveBtn: {
    display: "flex",
    alignItems: "center",
    gap: "7px",
    padding: "8px 14px",
    borderRadius: "var(--r-full)",
    border: "1px solid rgba(215,107,98,0.22)",
    background: "rgba(215,107,98,0.08)",
    fontFamily: "var(--font-body)",
    fontSize: "12px",
    fontWeight: 700,
    color: "var(--red)",
  },
  messagesArea: { flex: 1, overflowY: "auto", padding: "24px", display: "flex", flexDirection: "column", gap: "8px" },
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
  loadingStack: { display: "flex", flexDirection: "column", gap: "12px", padding: "20px" },
  skeleton: { height: "52px", borderRadius: "var(--r-xl)", background: "linear-gradient(90deg, rgba(53,53,52,0.25) 25%, rgba(80,72,52,0.28) 50%, rgba(53,53,52,0.25) 75%)", backgroundSize: "200% 100%", animation: "shimmer 1.5s infinite" },
  noMessages: { flex: 1, display: "flex", alignItems: "center", justifyContent: "center" },
  noMessagesText: { fontSize: "14px", color: "var(--text-muted)" },
  senderLabel: { fontFamily: "var(--font-mono)", fontSize: "10px", color: "var(--accent)", padding: "0 5px", textTransform: "uppercase", letterSpacing: "0.08em" },
  bubble: { padding: "11px 15px", position: "relative", boxShadow: "0 10px 26px rgba(0,0,0,0.22)" },
  sent: {
    background: "linear-gradient(135deg, #735f32, #5f4f2c)",
    border: "1px solid rgba(255,224,136,0.16)",
    borderRadius: "18px 18px 5px 18px",
    color: "#fff9e8",
  },
  received: {
    background: "rgba(42,42,40,0.86)",
    border: "1px solid rgba(153,144,124,0.12)",
    borderRadius: "18px 18px 18px 5px",
    color: "var(--text-primary)",
  },
  msgText: { fontSize: "14px", lineHeight: 1.58, margin: 0, wordBreak: "break-word" },
  msgTime: { fontSize: "10px", fontFamily: "var(--font-mono)", color: "rgba(232,227,215,0.55)", display: "block", textAlign: "right", marginTop: "6px" },
  inputSection: {
    padding: "14px 24px 18px",
    background: "rgba(19,19,19,0.82)",
    backdropFilter: "blur(20px)",
    borderTop: "1px solid rgba(153,144,124,0.10)",
  },
  inputRow: {
    display: "flex",
    alignItems: "center",
    gap: "9px",
    padding: "7px 8px 7px 16px",
    borderRadius: "var(--r-full)",
    background: "rgba(28,27,26,0.88)",
    border: "1px solid var(--border)",
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
  },
  rightPanel: {
    width: "280px",
    minWidth: "280px",
    height: "100%",
    background: "rgba(20,19,18,0.72)",
    backdropFilter: "blur(18px)",
    borderLeft: "1px solid rgba(153,144,124,0.10)",
    padding: "22px 18px",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    overflowY: "auto",
  },
  panelCard: { padding: "18px", borderRadius: "var(--r-xl)", background: "var(--glass-bg)", border: "1px solid var(--glass-border)", boxShadow: "var(--glass-shadow)" },
  memberTitle: { display: "flex", alignItems: "center", gap: "8px", color: "var(--accent)" },
  panelTitle: { fontFamily: "var(--font-display)", fontSize: "14px", fontWeight: 700, color: "var(--text-primary)", margin: 0 },
  groupDesc: { fontSize: "13px", color: "var(--text-muted)", margin: "10px 0 0", lineHeight: 1.55 },
  memberList: { display: "flex", flexDirection: "column", gap: "10px", marginTop: "14px" },
  memberRow: { display: "flex", alignItems: "center", gap: "10px" },
  memberName: { fontSize: "12px", fontWeight: 600, color: "var(--text-primary)", flex: 1 },
  adminBadge: { fontFamily: "var(--font-mono)", fontSize: "9px", color: "var(--accent)", background: "var(--accent-dim)", padding: "2px 8px", borderRadius: "var(--r-full)" },
};

export default GroupChatArea;
