import { useEffect } from "react";
import useAuthStore from "../store/useAuthStore";
import useChatStore from "../store/useChatStore";
import useSocketStore from "../store/useSocketStore";
import useGroupStore from "../store/useGroupStore";
import useCallStore from "../store/useCallStore";
import Sidebar from "../components/Sidebar/Sidebar";
import ChatArea from "../components/Chat/ChatArea";
import GroupChatArea from "../components/Chat/GroupChatArea";
import CallModal from "../components/Call/CallModal";
import Avatar from "../components/ui/Avatar";
import { Archive, Bell, LogOut, MessageSquare, Phone, Settings, Shield, Users } from "lucide-react";

const Dashboard = () => {
  const { authUser, logout } = useAuthStore();
  const { getUsers, selectedUser } = useChatStore();
  const { socket } = useSocketStore();
  const { selectedGroup, getMyGroups } = useGroupStore();
  const { setupCallListeners, removeCallListeners } = useCallStore();

  useEffect(() => {
    getUsers();
    getMyGroups();
  }, [getUsers, getMyGroups]);

  useEffect(() => {
    if (socket) {
      setupCallListeners(socket);
    }
    return () => removeCallListeners(socket);
  }, [socket, setupCallListeners, removeCallListeners]);

  const hasActiveThread = selectedUser || selectedGroup;

  return (
    <div className={hasActiveThread ? "has-active-chat secure-grid" : "secure-grid"} style={styles.wrapper}>
      <CallModal />

      <nav className="desktop-rail" style={styles.rail}>
        <div style={styles.railTop}>
          <div style={styles.logoMark}>
            <Shield size={21} />
          </div>
          <div style={styles.railDivider} />
        </div>

        <div style={styles.railCenter}>
          <button style={{ ...styles.railBtn, ...styles.railBtnActive }} title="Conversations">
            <MessageSquare size={18} />
          </button>
          <button style={styles.railBtn} title="Groups">
            <Users size={18} />
          </button>
          <button style={styles.railBtn} title="Calls">
            <Phone size={18} />
          </button>
          <button style={styles.railBtn} title="Archive">
            <Archive size={18} />
          </button>
          <button style={styles.railBtn} title="Settings">
            <Settings size={18} />
          </button>
        </div>

        <div style={styles.railBottom}>
          <button style={styles.railBtn} title="Notifications">
            <Bell size={18} />
          </button>
          <div onClick={logout} title="Account" style={{ cursor: "pointer" }}>
            <Avatar
              src={authUser?.profilePic}
              name={authUser?.fullname || "User"}
              size="sm"
              online
            />
          </div>
          <button onClick={logout} style={styles.logoutBtn} title="Logout">
            <LogOut size={16} />
          </button>
        </div>
      </nav>

      <Sidebar />

      <main className="app-main-pane" style={styles.main}>
        {selectedGroup ? <GroupChatArea /> : <ChatArea />}
      </main>
    </div>
  );
};

const styles = {
  wrapper: {
    height: "100vh",
    display: "flex",
    overflow: "hidden",
    position: "relative",
    zIndex: "var(--z-base)",
    background: "rgba(14, 14, 14, 0.86)",
  },
  rail: {
    width: "80px",
    minWidth: "80px",
    height: "100%",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "16px 0",
    background: "rgba(20, 19, 18, 0.92)",
    backdropFilter: "blur(18px)",
    WebkitBackdropFilter: "blur(18px)",
    borderRight: "1px solid rgba(153,144,124,0.12)",
    boxShadow: "10px 0 30px rgba(0,0,0,0.36)",
    zIndex: "var(--z-sidebar)",
  },
  railTop: {
    marginBottom: "auto",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "12px",
  },
  logoMark: {
    width: "46px",
    height: "46px",
    borderRadius: "var(--r-lg)",
    background: "linear-gradient(135deg, var(--accent-soft), var(--accent-strong))",
    border: "1px solid rgba(255,224,136,0.32)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#241a00",
    boxShadow: "0 12px 28px rgba(212,175,55,0.18)",
  },
  railDivider: {
    width: "24px",
    height: "1px",
    background: "var(--border)",
  },
  railCenter: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "6px",
  },
  railBtn: {
    width: "44px",
    height: "44px",
    borderRadius: "var(--r-lg)",
    border: "1px solid transparent",
    background: "transparent",
    color: "var(--text-muted)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
  },
  railBtnActive: {
    background: "var(--accent-dim)",
    borderColor: "rgba(242,202,80,0.20)",
    color: "var(--accent)",
  },
  railBottom: {
    marginTop: "auto",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "12px",
  },
  logoutBtn: {
    width: "38px",
    height: "38px",
    borderRadius: "var(--r-lg)",
    border: "none",
    background: "transparent",
    color: "var(--text-muted)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
  },
  main: {
    flex: 1,
    overflow: "hidden",
    display: "flex",
    minWidth: 0,
  },
};

export default Dashboard;
