import { useState, useEffect } from "react";
import useChatStore from "../../store/useChatStore";
import useSocketStore from "../../store/useSocketStore";
import useGroupStore from "../../store/useGroupStore";
import Avatar from "../ui/Avatar";
import { MessageSquare, Users, Plus, Search } from "lucide-react";

const Sidebar = () => {
  const { users, selectedUser, setSelectedUser, isUsersLoading } = useChatStore();
  const { onlineUsers } = useSocketStore();
  const {
    groups, selectedGroup, setSelectedGroup, getMyGroups,
    createGroup, subscribeToGroupMessages, unsubscribeFromGroupMessages,
  } = useGroupStore();
  const { socket } = useSocketStore();
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

  const filteredUsers = users.filter((u) =>
    u.fullname.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredGroups = groups.filter((g) =>
    g.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={styles.sidebar}>
      {/* ── Search ── */}
      <div style={styles.searchSection}>
        <div style={styles.searchBar}>
          <Search size={14} style={{ color: "var(--text-muted)", flexShrink: 0 }} />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={styles.searchInput}
          />
        </div>
      </div>

      {/* ── Tabs ── */}
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

      {/* ── Content ── */}
      <div style={styles.content}>
        {activeTab === "chats" && (
          <div style={styles.list}>
            {isUsersLoading ? (
              [1, 2, 3, 4].map((i) => <div key={i} style={styles.skeleton} />)
            ) : filteredUsers.length === 0 ? (
              <p style={styles.emptyText}>No users found</p>
            ) : (
              filteredUsers.map((user) => {
                const isOnline = onlineUsers.includes(user._id);
                const isActive = selectedUser?._id === user._id;
                return (
                  <button
                    key={user._id}
                    style={{ ...styles.contactItem, ...(isActive ? styles.contactActive : {}) }}
                    onClick={() => handleSelectUser(user)}
                  >
                    {isActive && <div style={styles.activeBar} />}
                    <Avatar
                      src={user.profilePic}
                      name={user.fullname}
                      size="sm"
                      online={isOnline}
                    />
                    <div style={styles.contactInfo}>
                      <span style={styles.contactName}>{user.fullname}</span>
                      <span style={styles.contactStatus}>
                        {isOnline ? "Online" : "Offline"}
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
              <span style={styles.sectionLabel}>
                Groups ({groups.length})
              </span>
              <button
                style={styles.addBtn}
                onClick={() => setShowCreateGroup(!showCreateGroup)}
              >
                <Plus size={14} />
              </button>
            </div>

            {showCreateGroup && (
              <div style={styles.createForm}>
                <input
                  type="text"
                  placeholder="Group name..."
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  style={styles.createInput}
                />
                <span style={styles.sectionLabel}>Select Members</span>
                <div style={styles.memberPicker}>
                  {users.map((user) => (
                    <button
                      key={user._id}
                      style={{
                        ...styles.memberChip,
                        ...(selectedMembers.includes(user._id) ? styles.memberChipActive : {}),
                      }}
                      onClick={() => toggleMember(user._id)}
                    >
                      {user.fullname}
                      {selectedMembers.includes(user._id) && " ✓"}
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
                  Create Group
                </button>
              </div>
            )}

            <div style={styles.list}>
              {filteredGroups.length === 0 ? (
                <p style={styles.emptyText}>No groups yet</p>
              ) : (
                filteredGroups.map((group) => {
                  const isActive = selectedGroup?._id === group._id;
                  return (
                    <button
                      key={group._id}
                      style={{ ...styles.contactItem, ...(isActive ? styles.contactActive : {}) }}
                      onClick={() => handleSelectGroup(group)}
                    >
                      {isActive && <div style={styles.activeBar} />}
                      <Avatar name={group.name} size="sm" />
                      <div style={styles.contactInfo}>
                        <span style={styles.contactName}>{group.name}</span>
                        <span style={styles.contactStatus}>
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
    background: "rgba(3, 4, 10, 0.65)",
    backdropFilter: "blur(24px)",
    WebkitBackdropFilter: "blur(24px)",
    borderRight: "1px solid var(--border)",
  },
  searchSection: { padding: "16px 14px 8px" },
  searchBar: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "8px 14px",
    borderRadius: "var(--r-lg)",
    background: "var(--surface)",
    border: "1px solid var(--border)",
  },
  searchInput: {
    flex: 1,
    border: "none",
    background: "transparent",
    color: "var(--text-primary)",
    fontSize: "13px",
    fontFamily: "var(--font-body)",
    outline: "none",
  },
  tabs: {
    display: "flex",
    padding: "0 14px",
    gap: "4px",
    borderBottom: "1px solid var(--border)",
  },
  tab: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "6px",
    padding: "10px",
    border: "none",
    background: "transparent",
    color: "var(--text-muted)",
    fontSize: "13px",
    fontFamily: "var(--font-body)",
    fontWeight: 500,
    cursor: "pointer",
    borderBottom: "2px solid transparent",
    transition: "all var(--dur-normal) var(--ease-smooth)",
  },
  tabActive: {
    color: "var(--accent)",
    borderBottomColor: "var(--accent)",
  },
  content: { flex: 1, overflowY: "auto", display: "flex", flexDirection: "column" },
  list: { flex: 1, padding: "6px 8px" },
  skeleton: {
    height: "52px",
    margin: "4px 6px",
    borderRadius: "var(--r-md)",
    background: "linear-gradient(90deg, var(--surface) 25%, var(--surface-hover) 50%, var(--surface) 75%)",
    backgroundSize: "200% 100%",
    animation: "shimmer 1.5s infinite",
  },
  contactItem: {
    width: "100%",
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "10px 12px",
    borderRadius: "var(--r-md)",
    border: "1px solid transparent",
    background: "transparent",
    cursor: "pointer",
    transition: "all var(--dur-normal) var(--ease-smooth)",
    textAlign: "left",
    color: "inherit",
    position: "relative",
  },
  contactActive: {
    background: "var(--accent-dim)",
    borderColor: "rgba(108,99,255,0.2)",
  },
  activeBar: {
    position: "absolute",
    left: 0,
    top: "50%",
    transform: "translateY(-50%)",
    width: "3px",
    height: "24px",
    borderRadius: "0 2px 2px 0",
    background: "var(--accent)",
  },
  contactInfo: { flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minWidth: 0 },
  contactName: {
    fontSize: "13px",
    fontWeight: 500,
    color: "var(--text-primary)",
    textOverflow: "ellipsis",
    overflow: "hidden",
    whiteSpace: "nowrap",
  },
  contactStatus: {
    fontSize: "11px",
    color: "var(--text-muted)",
  },
  groupHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "12px 16px 4px",
  },
  sectionLabel: {
    fontFamily: "var(--font-mono)",
    fontSize: "11px",
    color: "var(--text-muted)",
    letterSpacing: "0.03em",
  },
  addBtn: {
    width: "28px",
    height: "28px",
    borderRadius: "var(--r-sm)",
    border: "1px solid var(--border)",
    background: "var(--surface)",
    color: "var(--accent)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
  },
  createForm: {
    padding: "8px 14px 12px",
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    borderBottom: "1px solid var(--border)",
  },
  createInput: {
    width: "100%",
    padding: "8px 12px",
    borderRadius: "var(--r-sm)",
    border: "1px solid var(--border)",
    background: "var(--surface)",
    color: "var(--text-primary)",
    fontSize: "13px",
    fontFamily: "var(--font-body)",
    outline: "none",
  },
  memberPicker: {
    maxHeight: "100px",
    overflowY: "auto",
    display: "flex",
    flexWrap: "wrap",
    gap: "4px",
  },
  memberChip: {
    padding: "4px 10px",
    borderRadius: "var(--r-full)",
    border: "1px solid var(--border)",
    background: "transparent",
    color: "var(--text-secondary)",
    fontSize: "11px",
    fontFamily: "var(--font-body)",
    cursor: "pointer",
  },
  memberChipActive: {
    background: "var(--accent-dim)",
    borderColor: "rgba(108,99,255,0.3)",
    color: "var(--accent)",
  },
  createBtn: {
    padding: "8px 16px",
    borderRadius: "var(--r-sm)",
    border: "none",
    background: "linear-gradient(135deg, var(--accent), var(--cyan))",
    color: "#fff",
    fontFamily: "var(--font-body)",
    fontSize: "12px",
    fontWeight: 500,
    cursor: "pointer",
  },
  emptyText: {
    textAlign: "center",
    color: "var(--text-muted)",
    fontSize: "13px",
    padding: "24px",
  },
};

export default Sidebar;
