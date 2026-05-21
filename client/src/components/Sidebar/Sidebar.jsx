import { useState, useEffect } from "react";
import useChatStore from "../../store/useChatStore";
import useSocketStore from "../../store/useSocketStore";
import useGroupStore from "../../store/useGroupStore";
import Avatar from "../ui/Avatar";
import { Check, Edit3, MessageSquare, Plus, Search, ShieldCheck, Users } from "lucide-react";

const Sidebar = () => {
  const { users, selectedUser, setSelectedUser, isUsersLoading } = useChatStore();
  const { onlineUsers, socket } = useSocketStore();
  const {
    groups,
    selectedGroup,
    setSelectedGroup,
    getMyGroups,
    createGroup,
    subscribeToGroupMessages,
    unsubscribeFromGroupMessages,
  } = useGroupStore();
  const [activeTab, setActiveTab] = useState("chats");
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

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
    await createGroup({ name: groupName.trim(), members: selectedMembers });
    setGroupName("");
    setSelectedMembers([]);
    setShowCreateGroup(false);
  };

  const toggleMember = (userId) => {
    setSelectedMembers((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const query = searchQuery.toLowerCase();
  const filteredUsers = users.filter((u) =>
    u.fullname.toLowerCase().includes(query) || u.username.toLowerCase().includes(query)
  );
  const filteredGroups = groups.filter((g) => g.name.toLowerCase().includes(query));

  return (
    <aside className="app-sidebar" style={styles.sidebar}>
      <header style={styles.header}>
        <div>
          <div style={styles.brandRow}>
            <ShieldCheck size={18} />
            <h1 style={styles.brand}>Aurum</h1>
          </div>
          <p style={styles.subtitle}>Secure conversations</p>
        </div>
        <button style={styles.composeBtn} title="New conversation">
          <Edit3 size={17} />
        </button>
      </header>

      <div style={styles.searchSection}>
        <div style={styles.searchBar}>
          <Search size={15} style={{ color: "var(--text-muted)", flexShrink: 0 }} />
          <input
            type="text"
            placeholder="Search threads"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={styles.searchInput}
          />
        </div>
      </div>

      <div style={styles.tabs}>
        <button
          style={{ ...styles.tab, ...(activeTab === "chats" ? styles.tabActive : {}) }}
          onClick={() => setActiveTab("chats")}
        >
          <MessageSquare size={14} />
          Chats
        </button>
        <button
          style={{ ...styles.tab, ...(activeTab === "groups" ? styles.tabActive : {}) }}
          onClick={() => setActiveTab("groups")}
        >
          <Users size={14} />
          Groups
        </button>
      </div>

      <div style={styles.content}>
        {activeTab === "chats" && (
          <div style={styles.list}>
            {isUsersLoading ? (
              [1, 2, 3, 4].map((i) => <div key={i} style={styles.skeleton} />)
            ) : filteredUsers.length === 0 ? (
              <p style={styles.emptyText}>No matching contacts</p>
            ) : (
              filteredUsers.map((user) => {
                const isOnline = onlineUsers.includes(user._id);
                const isActive = selectedUser?._id === user._id;
                return (
                  <button
                    key={user._id}
                    style={{ ...styles.threadItem, ...(isActive ? styles.threadActive : {}) }}
                    onClick={() => handleSelectUser(user)}
                  >
                    <Avatar src={user.profilePic} name={user.fullname} size="md" online={isOnline} />
                    <div style={styles.threadInfo}>
                      <div style={styles.threadMeta}>
                        <span style={styles.threadName}>{user.fullname}</span>
                        <span style={styles.threadTime}>{isOnline ? "Now" : "Idle"}</span>
                      </div>
                      <span style={styles.threadPreview}>
                        {isOnline ? "Secure connection available" : user.about || `@${user.username}`}
                      </span>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        )}

        {activeTab === "groups" && (
          <>
            <div style={styles.groupHeader}>
              <span style={styles.sectionLabel}>Private rooms ({groups.length})</span>
              <button style={styles.addBtn} onClick={() => setShowCreateGroup(!showCreateGroup)}>
                <Plus size={14} />
              </button>
            </div>

            {showCreateGroup && (
              <div style={styles.createForm}>
                <input
                  type="text"
                  placeholder="Room name"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  style={styles.createInput}
                />
                <span style={styles.sectionLabel}>Invite members</span>
                <div style={styles.memberPicker}>
                  {users.map((user) => {
                    const selected = selectedMembers.includes(user._id);
                    return (
                      <button
                        key={user._id}
                        style={{ ...styles.memberChip, ...(selected ? styles.memberChipActive : {}) }}
                        onClick={() => toggleMember(user._id)}
                      >
                        <span>{user.fullname}</span>
                        {selected && <Check size={12} />}
                      </button>
                    );
                  })}
                </div>
                <button
                  onClick={handleCreateGroup}
                  disabled={!groupName.trim() || selectedMembers.length === 0}
                  style={{
                    ...styles.createBtn,
                    opacity: groupName.trim() && selectedMembers.length > 0 ? 1 : 0.45,
                  }}
                >
                  Create room
                </button>
              </div>
            )}

            <div style={styles.list}>
              {filteredGroups.length === 0 ? (
                <p style={styles.emptyText}>No private rooms yet</p>
              ) : (
                filteredGroups.map((group) => {
                  const isActive = selectedGroup?._id === group._id;
                  return (
                    <button
                      key={group._id}
                      style={{ ...styles.threadItem, ...(isActive ? styles.threadActive : {}) }}
                      onClick={() => handleSelectGroup(group)}
                    >
                      <Avatar name={group.name} size="md" />
                      <div style={styles.threadInfo}>
                        <div style={styles.threadMeta}>
                          <span style={styles.threadName}>{group.name}</span>
                          <span style={styles.threadTime}>{group.members?.length || 0}</span>
                        </div>
                        <span style={styles.threadPreview}>Encrypted room</span>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </>
        )}
      </div>
    </aside>
  );
};

const styles = {
  sidebar: {
    width: "360px",
    minWidth: "360px",
    height: "100%",
    display: "flex",
    flexDirection: "column",
    background: "rgba(28, 27, 26, 0.92)",
    backdropFilter: "blur(18px)",
    WebkitBackdropFilter: "blur(18px)",
    borderRight: "1px solid rgba(153,144,124,0.10)",
    boxShadow: "8px 0 28px rgba(0,0,0,0.25)",
  },
  header: {
    height: "84px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "18px 22px 12px",
  },
  brandRow: {
    display: "flex",
    alignItems: "center",
    gap: "9px",
    color: "var(--accent)",
  },
  brand: {
    fontFamily: "var(--font-display)",
    fontSize: "26px",
    lineHeight: 1,
    fontWeight: 700,
    letterSpacing: "-0.01em",
    color: "var(--accent)",
  },
  subtitle: {
    marginTop: "6px",
    fontFamily: "var(--font-mono)",
    fontSize: "11px",
    color: "var(--text-muted)",
    textTransform: "uppercase",
    letterSpacing: "0.12em",
  },
  composeBtn: {
    width: "42px",
    height: "42px",
    borderRadius: "var(--r-full)",
    border: "1px solid var(--border)",
    background: "var(--surface)",
    color: "var(--text-secondary)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  searchSection: { padding: "0 22px 14px" },
  searchBar: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "10px 14px",
    borderRadius: "var(--r-xl)",
    background: "rgba(53, 53, 52, 0.35)",
    border: "1px solid transparent",
  },
  searchInput: {
    flex: 1,
    border: "none",
    background: "transparent",
    color: "var(--text-primary)",
    fontSize: "14px",
    fontFamily: "var(--font-body)",
    outline: "none",
  },
  tabs: {
    display: "flex",
    padding: "0 18px 8px",
    gap: "8px",
  },
  tab: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "7px",
    padding: "10px",
    borderRadius: "var(--r-lg)",
    border: "1px solid transparent",
    background: "transparent",
    color: "var(--text-muted)",
    fontSize: "13px",
    fontFamily: "var(--font-body)",
    fontWeight: 600,
  },
  tabActive: {
    color: "var(--accent)",
    background: "var(--accent-dim)",
    borderColor: "rgba(242,202,80,0.16)",
  },
  content: {
    flex: 1,
    overflowY: "auto",
    display: "flex",
    flexDirection: "column",
  },
  list: { flex: 1, padding: "4px 0 18px" },
  skeleton: {
    height: "68px",
    margin: "4px 18px",
    borderRadius: "var(--r-lg)",
    background: "linear-gradient(90deg, rgba(53,53,52,0.25) 25%, rgba(80,72,52,0.28) 50%, rgba(53,53,52,0.25) 75%)",
    backgroundSize: "200% 100%",
    animation: "shimmer 1.5s infinite",
  },
  threadItem: {
    width: "100%",
    display: "flex",
    alignItems: "center",
    gap: "14px",
    padding: "14px 22px",
    border: "none",
    borderLeft: "3px solid transparent",
    background: "transparent",
    textAlign: "left",
    color: "inherit",
  },
  threadActive: {
    background: "rgba(53,53,52,0.34)",
    borderLeftColor: "var(--accent)",
  },
  threadInfo: {
    flex: 1,
    minWidth: 0,
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  threadMeta: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "baseline",
    gap: "12px",
  },
  threadName: {
    fontSize: "14px",
    fontWeight: 700,
    color: "var(--text-primary)",
    overflow: "hidden",
    whiteSpace: "nowrap",
    textOverflow: "ellipsis",
  },
  threadTime: {
    fontFamily: "var(--font-mono)",
    fontSize: "10px",
    color: "var(--accent)",
    flexShrink: 0,
  },
  threadPreview: {
    fontSize: "13px",
    color: "var(--text-muted)",
    overflow: "hidden",
    whiteSpace: "nowrap",
    textOverflow: "ellipsis",
  },
  groupHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "14px 22px 6px",
  },
  sectionLabel: {
    fontFamily: "var(--font-mono)",
    fontSize: "11px",
    color: "var(--text-muted)",
    letterSpacing: "0.08em",
    textTransform: "uppercase",
  },
  addBtn: {
    width: "30px",
    height: "30px",
    borderRadius: "var(--r-full)",
    border: "1px solid var(--border)",
    background: "var(--surface)",
    color: "var(--accent)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  createForm: {
    margin: "8px 18px 10px",
    padding: "14px",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    borderRadius: "var(--r-xl)",
    background: "rgba(19,19,19,0.64)",
    border: "1px solid var(--border)",
  },
  createInput: {
    width: "100%",
    padding: "10px 12px",
    borderRadius: "var(--r-lg)",
    border: "1px solid var(--border)",
    background: "rgba(53,53,52,0.32)",
    color: "var(--text-primary)",
    fontSize: "13px",
    fontFamily: "var(--font-body)",
    outline: "none",
  },
  memberPicker: {
    maxHeight: "108px",
    overflowY: "auto",
    display: "flex",
    flexWrap: "wrap",
    gap: "6px",
  },
  memberChip: {
    display: "inline-flex",
    alignItems: "center",
    gap: "5px",
    padding: "5px 10px",
    borderRadius: "var(--r-full)",
    border: "1px solid var(--border)",
    background: "transparent",
    color: "var(--text-secondary)",
    fontSize: "11px",
    fontFamily: "var(--font-body)",
  },
  memberChipActive: {
    background: "var(--accent-dim)",
    borderColor: "rgba(242,202,80,0.25)",
    color: "var(--accent)",
  },
  createBtn: {
    padding: "10px 16px",
    borderRadius: "var(--r-lg)",
    border: "none",
    background: "linear-gradient(135deg, var(--accent-soft), var(--accent-strong))",
    color: "#241a00",
    fontFamily: "var(--font-body)",
    fontSize: "13px",
    fontWeight: 700,
  },
  emptyText: {
    textAlign: "center",
    color: "var(--text-muted)",
    fontSize: "13px",
    padding: "28px",
  },
};

export default Sidebar;
