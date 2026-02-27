import React, { useEffect } from "react";
import useAuthStore from "../store/useAuthStore";
import useChatStore from "../store/useChatStore";
import useSocketStore from "../store/useSocketStore";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar/Sidebar";
import ChatArea from "../components/Chat/ChatArea";

const Dashboard = () => {
  const { authUser, logout } = useAuthStore();
  const { selectedUser, getUsers } = useChatStore();
  const { onlineUsers } = useSocketStore();
  const navigate = useNavigate();

  useEffect(() => {
    getUsers();
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div style={styles.wrapper}>
      {/* Top Navigation Bar */}
      <header style={styles.navbar}>
        <div style={styles.navLeft}>
          <div style={styles.navLogo}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </div>
          <span style={styles.navTitle}>ChatFlow</span>
        </div>

        <div style={styles.navRight}>
          <div style={styles.userInfo}>
            <img
              src={authUser?.profilePic || `https://api.dicebear.com/7.x/initials/svg?seed=${authUser?.fullname || "User"}`}
              alt="avatar"
              style={styles.navAvatar}
            />
            <span style={styles.navUsername}>{authUser?.fullname || "User"}</span>
          </div>
          <button onClick={handleLogout} style={styles.logoutBtn}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          </button>
        </div>
      </header>

      {/* Main Chat Area */}
      <div style={styles.mainContent}>
        <Sidebar />
        <ChatArea />
      </div>
    </div>
  );
};

const styles = {
  wrapper: {
    height: "100vh",
    width: "100vw",
    display: "flex",
    flexDirection: "column",
    background: "var(--bg-primary)",
    overflow: "hidden",
  },
  navbar: {
    height: "60px",
    minHeight: "60px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 24px",
    background: "var(--bg-secondary)",
    borderBottom: "1px solid var(--border-color)",
    zIndex: 10,
  },
  navLeft: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  navLogo: {
    width: "36px",
    height: "36px",
    borderRadius: "var(--radius-sm)",
    background: "var(--accent-gradient)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "white",
  },
  navTitle: {
    fontSize: "18px",
    fontWeight: "700",
    background: "var(--accent-gradient)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
  },
  navRight: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
  },
  userInfo: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  navAvatar: {
    width: "32px",
    height: "32px",
    borderRadius: "var(--radius-full)",
    objectFit: "cover",
    border: "2px solid var(--border-color)",
  },
  navUsername: {
    fontSize: "14px",
    fontWeight: "500",
    color: "var(--text-primary)",
  },
  logoutBtn: {
    width: "36px",
    height: "36px",
    borderRadius: "var(--radius-sm)",
    border: "1px solid var(--border-color)",
    background: "var(--bg-glass)",
    color: "var(--text-secondary)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    transition: "all var(--transition-fast)",
  },
  mainContent: {
    flex: 1,
    display: "flex",
    overflow: "hidden",
  },
};

export default Dashboard;
