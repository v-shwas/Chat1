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
import { MessageSquare, Settings, LogOut, Bell } from "lucide-react";

const Dashboard = () => {
  const { authUser, logout } = useAuthStore();
  const { getUsers } = useChatStore();
  const { socket } = useSocketStore();
  const { selectedGroup, getMyGroups } = useGroupStore();
  const { setupCallListeners, removeCallListeners } = useCallStore();

  useEffect(() => {
    getUsers();
    getMyGroups();
  }, []);

  useEffect(() => {
    if (socket) {
      setupCallListeners(socket);
    }
    return () => removeCallListeners(socket);
  }, [socket]);

  return (
    <div style={styles.wrapper}>
      <CallModal />

      {/* ── Slim icon rail ── */}
      <nav style={styles.rail}>
        <div style={styles.railTop}>
          <div style={styles.logoMark}>
            <MessageSquare size={20} />
          </div>
        </div>

        <div style={styles.railCenter}>
          <button style={styles.railBtn} title="Notifications">
            <Bell size={18} />
          </button>
          <button style={styles.railBtn} title="Settings">
            <Settings size={18} />
          </button>
        </div>

        <div style={styles.railBottom}>
          <div onClick={logout} title="Logout" style={{ cursor: "pointer" }}>
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

      {/* ── Sidebar ── */}
      <Sidebar />

      {/* ── Main Content ── */}
      <main style={styles.main}>
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
  },
  rail: {
    width: "68px",
    minWidth: "68px",
    height: "100%",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "16px 0",
    background: "rgba(3, 4, 10, 0.8)",
    backdropFilter: "blur(24px)",
    WebkitBackdropFilter: "blur(24px)",
    borderRight: "1px solid var(--border)",
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
    width: "44px",
    height: "44px",
    borderRadius: "var(--r-md)",
    background: "var(--accent-dim)",
    border: "1px solid rgba(108,99,255,0.3)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "var(--accent)",
    marginBottom: "8px",
  },
  railCenter: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "4px",
  },
  railBtn: {
    width: "40px",
    height: "40px",
    borderRadius: "var(--r-md)",
    border: "none",
    background: "transparent",
    color: "var(--text-muted)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    transition: "all var(--dur-normal) var(--ease-smooth)",
  },
  railBottom: {
    marginTop: "auto",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "12px",
  },
  logoutBtn: {
    width: "36px",
    height: "36px",
    borderRadius: "var(--r-md)",
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
  },
};

export default Dashboard;
