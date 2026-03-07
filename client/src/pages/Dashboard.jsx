import React, { useEffect } from "react";
import useAuthStore from "../store/useAuthStore";
import useChatStore from "../store/useChatStore";
import useSocketStore from "../store/useSocketStore";
import useGroupStore from "../store/useGroupStore";
import useCallStore from "../store/useCallStore";
import Sidebar from "../components/Sidebar/Sidebar";
import ChatArea from "../components/Chat/ChatArea";
import GroupChatArea from "../components/Chat/GroupChatArea";
import CallModal from "../components/Call/CallModal";

const Dashboard = () => {
  const { authUser, logout } = useAuthStore();
  const { getUsers } = useChatStore();
  const { connectSocket, disconnectSocket, socket } = useSocketStore();
  const { selectedGroup, getMyGroups } = useGroupStore();
  const { setupCallListeners, removeCallListeners } = useCallStore();

  useEffect(() => {
    getUsers();
    getMyGroups();
  }, []);

  useEffect(() => {
    if (authUser?._id) {
      connectSocket(authUser._id);
    }
    return () => disconnectSocket();
  }, [authUser]);

  // Setup call listeners when socket is ready
  useEffect(() => {
    if (socket) {
      setupCallListeners(socket);
    }
    return () => removeCallListeners(socket);
  }, [socket]);

  return (
    <div style={styles.wrapper}>
      {/* Call Modal (renders globally) */}
      <CallModal />

      {/* ── Navbar ── */}
      <header style={styles.navbar}>
        <div style={styles.navLeft}>
          <div style={styles.logoMark}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3" />
              <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83" />
            </svg>
          </div>
          <span style={styles.logoText}>NEURAL CORE</span>
          <div style={styles.signalBadge}>
            <span style={styles.signalDot} />
            SIGNAL STABLE
          </div>
        </div>

        <div style={styles.navCenter}>
          <div style={styles.searchBar}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <span style={styles.searchPlaceholder}>Search neural nodes...</span>
            <span style={styles.searchShortcut}>⌘ K</span>
          </div>
        </div>

        <div style={styles.navRight}>
          <button style={styles.navIconBtn} title="Notifications">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
          </button>
          <button style={styles.navIconBtn} title="Settings">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
          </button>

          <div
            style={styles.userAvatar}
            onClick={logout}
            title="Logout"
          >
            <img
              src={authUser?.profilePic || `https://api.dicebear.com/7.x/initials/svg?seed=${authUser?.fullname}`}
              alt="avatar"
              style={styles.avatarImg}
            />
          </div>
        </div>
      </header>

      {/* ── Main Content ── */}
      <div style={styles.main}>
        <Sidebar />
        {selectedGroup ? <GroupChatArea /> : <ChatArea />}
      </div>

      {/* ── Footer ── */}
      <footer style={styles.footer}>
        <span style={styles.footerText}>CORE PROTOCOL V.9.4.2</span>
        <span style={styles.footerDot}>•</span>
        <span style={styles.footerText}>NEURAL LATTICE ENCRYPTED</span>
        <span style={styles.footerDot}>•</span>
        <span style={styles.footerText}>SESSION: {authUser?._id?.slice(-8)?.toUpperCase() || "—"}</span>
      </footer>
    </div>
  );
};

const styles = {
  wrapper: {
    height: "100vh",
    display: "flex",
    flexDirection: "column",
    background: "var(--bg-primary)",
    overflow: "hidden",
  },
  /* Navbar */
  navbar: {
    height: "56px",
    minHeight: "56px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 20px",
    background: "var(--bg-secondary)",
    borderBottom: "1px solid var(--border-color)",
    zIndex: 10,
  },
  navLeft: { display: "flex", alignItems: "center", gap: "12px" },
  logoMark: {
    width: "36px",
    height: "36px",
    borderRadius: "var(--radius-md)",
    background: "linear-gradient(135deg, rgba(0,229,255,0.1) 0%, rgba(124,77,255,0.1) 100%)",
    border: "1px solid rgba(0,229,255,0.15)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "var(--accent-cyan)",
    animation: "pulse-cyan 3s infinite",
  },
  logoText: {
    fontFamily: "var(--font-heading)",
    fontSize: "14px",
    fontWeight: "800",
    color: "var(--accent-cyan)",
    letterSpacing: "0.2em",
  },
  signalBadge: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    padding: "4px 12px",
    borderRadius: "var(--radius-full)",
    background: "rgba(0,230,118,0.06)",
    border: "1px solid rgba(0,230,118,0.12)",
    fontFamily: "var(--font-mono)",
    fontSize: "9px",
    color: "var(--success)",
    letterSpacing: "0.1em",
  },
  signalDot: {
    width: "5px",
    height: "5px",
    borderRadius: "50%",
    background: "var(--success)",
    animation: "pulse-dot 2s infinite",
  },
  navCenter: { flex: 1, maxWidth: "420px", margin: "0 24px" },
  searchBar: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "8px 16px",
    borderRadius: "var(--radius-lg)",
    background: "var(--bg-panel)",
    border: "1px solid var(--border-color)",
    color: "var(--text-muted)",
  },
  searchPlaceholder: { flex: 1, fontFamily: "var(--font-body)", fontWeight: "500", fontSize: "13px", opacity: 0.5 },
  searchShortcut: { fontFamily: "var(--font-mono)", fontSize: "10px", color: "var(--text-muted)", background: "rgba(0,229,255,0.06)", padding: "2px 6px", borderRadius: "var(--radius-sm)", letterSpacing: "0.05em" },
  navRight: { display: "flex", alignItems: "center", gap: "8px" },
  navIconBtn: {
    width: "36px",
    height: "36px",
    borderRadius: "var(--radius-md)",
    border: "1px solid var(--border-color)",
    background: "transparent",
    color: "var(--text-secondary)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    transition: "all var(--transition-fast)",
  },
  userAvatar: { width: "34px", height: "34px", borderRadius: "var(--radius-md)", cursor: "pointer", overflow: "hidden", border: "1px solid var(--border-color)" },
  avatarImg: { width: "100%", height: "100%", objectFit: "cover" },
  /* Main */
  main: { flex: 1, display: "flex", overflow: "hidden" },
  /* Footer */
  footer: {
    height: "28px",
    minHeight: "28px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "12px",
    background: "var(--bg-secondary)",
    borderTop: "1px solid var(--border-color)",
  },
  footerText: { fontFamily: "var(--font-mono)", fontSize: "8px", color: "var(--text-muted)", letterSpacing: "0.15em" },
  footerDot: { fontSize: "6px", color: "var(--text-muted)", opacity: 0.4 },
};

export default Dashboard;
