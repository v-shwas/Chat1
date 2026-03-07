import React, { useState, useEffect } from "react";
import useChatStore from "../../store/useChatStore";
import useSocketStore from "../../store/useSocketStore";
import useGroupStore from "../../store/useGroupStore";

const navItems = [
  { id: "stream", icon: "⌐", label: "Core Stream" },
  { id: "groups", icon: "◈", label: "Node Network" },
  { id: "logs", icon: "◎", label: "Synapse Logs" },
  { id: "history", icon: "⊕", label: "Sync History" },
];

const Sidebar = () => {
  const { users, selectedUser, setSelectedUser, isUsersLoading } = useChatStore();
  const { onlineUsers } = useSocketStore();
  const {
    groups, selectedGroup, setSelectedGroup, getMyGroups,
    createGroup, subscribeToGroupMessages, unsubscribeFromGroupMessages,
  } = useGroupStore();
  const { socket } = useSocketStore();
  const [activeNav, setActiveNav] = useState("stream");
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [selectedMembers, setSelectedMembers] = useState([]);

  useEffect(() => {
    getMyGroups();
  }, []);

  useEffect(() => {
    if (socket) {
      subscribeToGroupMessages(socket);
    }
    return () => unsubscribeFromGroupMessages(socket);
  }, [socket]);

  const handleSelectUser = (user) => {
    setSelectedUser(user);
    setSelectedGroup(null);
  };

  const handleSelectGroup = (group) => {
    setSelectedGroup(group);
    setSelectedUser(null);
  };

  const handleCreateGroup = async () => {
    if (!groupName.trim() || selectedMembers.length === 0) return;
    await createGroup({ name: groupName, members: selectedMembers });
    setGroupName("");
    setSelectedMembers([]);
    setShowCreateGroup(false);
  };

  const toggleMember = (userId) => {
    setSelectedMembers((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  return (
    <div style={styles.sidebar}>
      {/* Navigation */}
      <div style={styles.navSection}>
        {navItems.map((item) => (
          <button
            key={item.id}
            style={{
              ...styles.navItem,
              ...(activeNav === item.id ? styles.navItemActive : {}),
            }}
            onClick={() => setActiveNav(item.id)}
            title={item.label}
          >
            <span style={styles.navIcon}>{item.icon}</span>
            <span style={styles.navLabel}>{item.label}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={styles.content}>
        {/* Core Stream — Users */}
        {activeNav === "stream" && (
          <>
            <div style={styles.sectionHeader}>
              <span style={styles.sectionHeaderText}>DIRECT CHANNELS</span>
              <span style={styles.sectionCount}>{users.length}</span>
            </div>
            <div style={styles.userList}>
              {isUsersLoading ? (
                [1, 2, 3, 4].map((i) => <div key={i} style={styles.skeleton} />)
              ) : (
                users.map((user) => {
                  const isOnline = onlineUsers.includes(user._id);
                  const isActive = selectedUser?._id === user._id;
                  return (
                    <button
                      key={user._id}
                      style={{ ...styles.userItem, ...(isActive ? styles.userItemActive : {}) }}
                      onClick={() => handleSelectUser(user)}
                    >
                      <div style={styles.avatarContainer}>
                        <img
                          src={user.profilePic || `https://api.dicebear.com/7.x/initials/svg?seed=${user.fullname}`}
                          alt={user.fullname}
                          style={styles.avatar}
                        />
                        <span style={{ ...styles.statusDot, background: isOnline ? "var(--success)" : "var(--text-muted)" }} />
                      </div>
                      <div style={styles.userInfo}>
                        <span style={styles.userName}>{user.fullname}</span>
                        <span style={styles.userStatus}>
                          {isOnline ? "Neural link active" : "Offline"}
                        </span>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </>
        )}

        {/* Groups — Node Network */}
        {activeNav === "groups" && (
          <>
            <div style={styles.sectionHeader}>
              <span style={styles.sectionHeaderText}>GROUP CHANNELS</span>
              <button
                style={styles.createGroupBtn}
                onClick={() => setShowCreateGroup(!showCreateGroup)}
              >
                +
              </button>
            </div>

            {showCreateGroup && (
              <div style={styles.createGroupForm}>
                <input
                  type="text"
                  placeholder="Group name..."
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  style={styles.createGroupInput}
                />
                <span style={styles.memberSelectLabel}>SELECT MEMBERS</span>
                <div style={styles.memberList}>
                  {users.map((user) => (
                    <button
                      key={user._id}
                      style={{
                        ...styles.memberItem,
                        ...(selectedMembers.includes(user._id) ? styles.memberItemSelected : {}),
                      }}
                      onClick={() => toggleMember(user._id)}
                    >
                      <span>{user.fullname}</span>
                      {selectedMembers.includes(user._id) && (
                        <span style={styles.checkMark}>✓</span>
                      )}
                    </button>
                  ))}
                </div>
                <button
                  onClick={handleCreateGroup}
                  disabled={!groupName.trim() || selectedMembers.length === 0}
                  style={{
                    ...styles.createBtn,
                    opacity: groupName.trim() && selectedMembers.length > 0 ? 1 : 0.4,
                  }}
                >
                  CREATE GROUP
                </button>
              </div>
            )}

            <div style={styles.userList}>
              {groups.length === 0 ? (
                <p style={styles.emptyText}>No groups yet. Create one!</p>
              ) : (
                groups.map((group) => {
                  const isActive = selectedGroup?._id === group._id;
                  return (
                    <button
                      key={group._id}
                      style={{ ...styles.userItem, ...(isActive ? styles.userItemActive : {}) }}
                      onClick={() => handleSelectGroup(group)}
                    >
                      <div style={styles.groupAvatarContainer}>
                        <span style={styles.groupIcon}>◈</span>
                      </div>
                      <div style={styles.userInfo}>
                        <span style={styles.userName}>{group.name}</span>
                        <span style={styles.userStatus}>
                          {group.members?.length || 0} members
                        </span>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </>
        )}

        {/* Placeholder for other nav items */}
        {(activeNav === "logs" || activeNav === "history") && (
          <div style={styles.placeholderSection}>
            <div style={styles.placeholderIcon}>
              {activeNav === "logs" ? "◎" : "⊕"}
            </div>
            <p style={styles.placeholderText}>
              {activeNav === "logs" ? "SYNAPSE LOGS" : "SYNC HISTORY"}
            </p>
            <p style={styles.placeholderSubtext}>Module initializing...</p>
          </div>
        )}
      </div>

      {/* Neural Sync */}
      <div style={styles.syncSection}>
        <div style={styles.syncHeader}>
          <span style={styles.syncLabel}>NEURAL SYNC</span>
          <span style={styles.syncValue}>98.4%</span>
        </div>
        <div style={styles.syncBar}>
          <div style={styles.syncProgress} />
        </div>
        <button style={styles.syncButton}>⚡ INITIATE SYNC</button>
      </div>
    </div>
  );
};

const styles = {
  sidebar: {
    width: "280px",
    minWidth: "280px",
    height: "100%",
    display: "flex",
    flexDirection: "column",
    background: "var(--bg-secondary)",
    borderRight: "1px solid var(--border-color)",
  },
  /* Nav */
  navSection: {
    display: "flex",
    padding: "8px",
    gap: "2px",
    borderBottom: "1px solid var(--border-color)",
  },
  navItem: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "3px",
    padding: "8px 4px",
    borderRadius: "var(--radius-sm)",
    border: "none",
    background: "transparent",
    color: "var(--text-muted)",
    cursor: "pointer",
    transition: "all var(--transition-fast)",
  },
  navItemActive: {
    background: "rgba(0, 229, 255, 0.06)",
    color: "var(--accent-cyan)",
  },
  navIcon: { fontSize: "16px" },
  navLabel: { fontFamily: "var(--font-mono)", fontSize: "8px", letterSpacing: "0.08em", textTransform: "uppercase" },
  /* Content */
  content: { flex: 1, overflowY: "auto", display: "flex", flexDirection: "column" },
  sectionHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "12px 16px 6px",
  },
  sectionHeaderText: { fontFamily: "var(--font-mono)", fontSize: "9px", color: "var(--text-muted)", letterSpacing: "0.15em" },
  sectionCount: { fontFamily: "var(--font-mono)", fontSize: "9px", color: "var(--accent-cyan)", background: "rgba(0,229,255,0.08)", padding: "2px 8px", borderRadius: "var(--radius-full)" },
  userList: { flex: 1, padding: "4px 8px" },
  skeleton: { height: "52px", margin: "4px 0", borderRadius: "var(--radius-md)", background: "linear-gradient(90deg, rgba(0,229,255,0.02) 25%, rgba(0,229,255,0.05) 50%, rgba(0,229,255,0.02) 75%)", backgroundSize: "200% 100%", animation: "shimmer 1.5s infinite" },
  userItem: {
    width: "100%",
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "10px 12px",
    borderRadius: "var(--radius-md)",
    border: "1px solid transparent",
    background: "transparent",
    cursor: "pointer",
    transition: "all var(--transition-fast)",
    textAlign: "left",
    color: "inherit",
  },
  userItemActive: {
    background: "rgba(0, 229, 255, 0.06)",
    border: "1px solid rgba(0, 229, 255, 0.12)",
  },
  avatarContainer: { position: "relative", flexShrink: 0 },
  avatar: { width: "38px", height: "38px", borderRadius: "var(--radius-md)", objectFit: "cover", border: "1px solid var(--border-color)" },
  statusDot: { position: "absolute", bottom: "1px", right: "1px", width: "10px", height: "10px", borderRadius: "50%", border: "2px solid var(--bg-secondary)" },
  userInfo: { flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minWidth: 0 },
  userName: { fontFamily: "var(--font-body)", fontSize: "13px", fontWeight: "600", color: "var(--text-primary)", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" },
  userStatus: { fontFamily: "var(--font-body)", fontSize: "11px", color: "var(--text-muted)", fontWeight: "500" },
  /* Groups */
  createGroupBtn: {
    width: "24px",
    height: "24px",
    borderRadius: "var(--radius-sm)",
    border: "1px solid rgba(0,229,255,0.2)",
    background: "rgba(0,229,255,0.06)",
    color: "var(--accent-cyan)",
    fontSize: "14px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  createGroupForm: {
    padding: "8px 12px",
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    borderBottom: "1px solid var(--border-color)",
    marginBottom: "4px",
  },
  createGroupInput: {
    width: "100%",
    padding: "8px 12px",
    borderRadius: "var(--radius-sm)",
    border: "1px solid var(--border-color)",
    background: "rgba(0,229,255,0.03)",
    color: "var(--text-primary)",
    fontSize: "12px",
    fontFamily: "var(--font-body)",
    fontWeight: "500",
    outline: "none",
  },
  memberSelectLabel: {
    fontFamily: "var(--font-mono)",
    fontSize: "8px",
    color: "var(--text-muted)",
    letterSpacing: "0.15em",
  },
  memberList: {
    maxHeight: "120px",
    overflowY: "auto",
    display: "flex",
    flexDirection: "column",
    gap: "2px",
  },
  memberItem: {
    width: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "6px 10px",
    borderRadius: "var(--radius-sm)",
    border: "1px solid transparent",
    background: "transparent",
    color: "var(--text-secondary)",
    fontSize: "12px",
    fontFamily: "var(--font-body)",
    fontWeight: "500",
    cursor: "pointer",
    textAlign: "left",
  },
  memberItemSelected: {
    background: "rgba(0,229,255,0.06)",
    border: "1px solid rgba(0,229,255,0.12)",
    color: "var(--accent-cyan)",
  },
  checkMark: {
    color: "var(--accent-cyan)",
    fontSize: "12px",
    fontWeight: "700",
  },
  createBtn: {
    padding: "8px",
    borderRadius: "var(--radius-sm)",
    border: "1px solid rgba(0,229,255,0.2)",
    background: "rgba(0,229,255,0.08)",
    color: "var(--accent-cyan)",
    fontFamily: "var(--font-heading)",
    fontSize: "10px",
    fontWeight: "700",
    letterSpacing: "0.15em",
    cursor: "pointer",
  },
  groupAvatarContainer: {
    width: "38px",
    height: "38px",
    borderRadius: "var(--radius-md)",
    background: "rgba(124,77,255,0.08)",
    border: "1px solid rgba(124,77,255,0.15)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "var(--accent-purple-light)",
    fontSize: "18px",
    flexShrink: 0,
  },
  groupIcon: {},
  emptyText: {
    textAlign: "center",
    color: "var(--text-muted)",
    fontSize: "12px",
    fontFamily: "var(--font-body)",
    fontWeight: "500",
    padding: "20px",
  },
  /* Placeholder */
  placeholderSection: { flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "12px", padding: "32px" },
  placeholderIcon: { fontSize: "36px", color: "var(--text-muted)", opacity: 0.4 },
  placeholderText: { fontFamily: "var(--font-heading)", fontSize: "12px", color: "var(--text-muted)", letterSpacing: "0.15em" },
  placeholderSubtext: { fontSize: "11px", color: "var(--text-muted)", fontFamily: "var(--font-body)", fontWeight: "500", opacity: 0.6 },
  /* Sync */
  syncSection: {
    padding: "16px",
    borderTop: "1px solid var(--border-color)",
  },
  syncHeader: { display: "flex", justifyContent: "space-between", marginBottom: "8px" },
  syncLabel: { fontFamily: "var(--font-mono)", fontSize: "9px", color: "var(--text-muted)", letterSpacing: "0.15em" },
  syncValue: { fontFamily: "var(--font-mono)", fontSize: "9px", color: "var(--accent-cyan)", letterSpacing: "0.1em" },
  syncBar: { height: "4px", borderRadius: "2px", background: "var(--bg-panel)", marginBottom: "12px" },
  syncProgress: { height: "100%", width: "98.4%", borderRadius: "2px", background: "linear-gradient(90deg, var(--accent-cyan) 0%, var(--accent-purple) 100%)" },
  syncButton: {
    width: "100%",
    padding: "10px",
    borderRadius: "var(--radius-md)",
    border: "1px solid rgba(0,229,255,0.2)",
    background: "linear-gradient(135deg, rgba(0,229,255,0.08) 0%, rgba(124,77,255,0.08) 100%)",
    fontFamily: "var(--font-heading)",
    fontSize: "10px",
    fontWeight: "700",
    color: "var(--accent-cyan)",
    letterSpacing: "0.15em",
    cursor: "pointer",
  },
};

export default Sidebar;
