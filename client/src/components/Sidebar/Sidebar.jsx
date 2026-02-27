import React, { useState, useMemo } from "react";
import useChatStore from "../../store/useChatStore";
import useSocketStore from "../../store/useSocketStore";

const Sidebar = () => {
  const { users, selectedUser, setSelectedUser, isUsersLoading, getMessages } =
    useChatStore();
  const { onlineUsers } = useSocketStore();
  const [search, setSearch] = useState("");

  const filteredUsers = useMemo(() => {
    if (!search.trim()) return users;
    return users.filter(
      (u) =>
        u.fullname.toLowerCase().includes(search.toLowerCase()) ||
        u.username.toLowerCase().includes(search.toLowerCase())
    );
  }, [users, search]);

  const handleSelectUser = (user) => {
    setSelectedUser(user);
    getMessages(user._id);
  };

  return (
    <div style={styles.sidebar}>
      {/* Header */}
      <div style={styles.header}>
        <h2 style={styles.headerTitle}>Messages</h2>
        <span style={styles.onlineCounter}>
          {onlineUsers.length} online
        </span>
      </div>

      {/* Search */}
      <div style={styles.searchContainer}>
        <svg
          style={styles.searchIcon}
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          type="text"
          placeholder="Search people..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={styles.searchInput}
        />
      </div>

      {/* User List */}
      <div style={styles.userList}>
        {isUsersLoading ? (
          <div style={styles.loadingState}>
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} style={styles.skeleton} />
            ))}
          </div>
        ) : filteredUsers.length === 0 ? (
          <div style={styles.emptyState}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.5">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            <p style={styles.emptyText}>No users found</p>
          </div>
        ) : (
          filteredUsers.map((user, index) => {
            const isOnline = onlineUsers.includes(user._id);
            const isSelected = selectedUser?._id === user._id;
            return (
              <div
                key={user._id}
                onClick={() => handleSelectUser(user)}
                style={{
                  ...styles.userItem,
                  ...(isSelected ? styles.userItemActive : {}),
                  animationDelay: `${index * 0.05}s`,
                }}
                className="animate-fade-in"
              >
                <div style={styles.avatarContainer}>
                  <img
                    src={
                      user.profilePic ||
                      `https://api.dicebear.com/7.x/initials/svg?seed=${user.fullname}`
                    }
                    alt={user.fullname}
                    style={styles.avatar}
                  />
                  <span
                    style={{
                      ...styles.statusDot,
                      background: isOnline ? "var(--success)" : "var(--text-muted)",
                      boxShadow: isOnline
                        ? "0 0 8px rgba(16, 185, 129, 0.6)"
                        : "none",
                    }}
                  />
                </div>
                <div style={styles.userDetails}>
                  <span style={styles.userName}>{user.fullname}</span>
                  <span style={styles.userStatus}>
                    {isOnline ? "Online" : "Offline"}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

const styles = {
  sidebar: {
    width: "320px",
    minWidth: "320px",
    height: "100%",
    display: "flex",
    flexDirection: "column",
    background: "var(--bg-secondary)",
    borderRight: "1px solid var(--border-color)",
  },
  header: {
    padding: "20px 20px 12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerTitle: {
    fontSize: "20px",
    fontWeight: "700",
    color: "var(--text-primary)",
  },
  onlineCounter: {
    fontSize: "12px",
    fontWeight: "500",
    padding: "4px 10px",
    borderRadius: "var(--radius-full)",
    background: "rgba(16, 185, 129, 0.1)",
    color: "var(--success)",
    border: "1px solid rgba(16, 185, 129, 0.2)",
  },
  searchContainer: {
    padding: "0 16px 16px",
    position: "relative",
  },
  searchIcon: {
    position: "absolute",
    left: "30px",
    top: "50%",
    transform: "translateY(-50%)",
    color: "var(--text-muted)",
    pointerEvents: "none",
  },
  searchInput: {
    width: "100%",
    padding: "10px 14px 10px 40px",
    borderRadius: "var(--radius-md)",
    border: "1px solid var(--border-color)",
    background: "var(--bg-glass)",
    color: "var(--text-primary)",
    fontSize: "13px",
    fontFamily: "inherit",
    outline: "none",
    transition: "border-color var(--transition-fast)",
  },
  userList: {
    flex: 1,
    overflowY: "auto",
    padding: "0 8px",
  },
  userItem: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "12px",
    borderRadius: "var(--radius-md)",
    cursor: "pointer",
    transition: "all var(--transition-fast)",
    marginBottom: "2px",
  },
  userItemActive: {
    background: "rgba(108, 99, 255, 0.1)",
    border: "1px solid var(--border-accent)",
  },
  avatarContainer: {
    position: "relative",
    flexShrink: 0,
  },
  avatar: {
    width: "44px",
    height: "44px",
    borderRadius: "var(--radius-full)",
    objectFit: "cover",
    border: "2px solid var(--border-color)",
  },
  statusDot: {
    position: "absolute",
    bottom: "2px",
    right: "2px",
    width: "10px",
    height: "10px",
    borderRadius: "var(--radius-full)",
    border: "2px solid var(--bg-secondary)",
  },
  userDetails: {
    flex: 1,
    minWidth: 0,
  },
  userName: {
    display: "block",
    fontSize: "14px",
    fontWeight: "600",
    color: "var(--text-primary)",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  userStatus: {
    display: "block",
    fontSize: "12px",
    color: "var(--text-muted)",
    marginTop: "2px",
  },
  loadingState: {
    padding: "8px",
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  skeleton: {
    height: "60px",
    borderRadius: "var(--radius-md)",
    background: "linear-gradient(90deg, var(--bg-glass) 25%, rgba(255,255,255,0.06) 50%, var(--bg-glass) 75%)",
    backgroundSize: "200% 100%",
    animation: "shimmer 1.5s infinite",
  },
  emptyState: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "40px 20px",
    gap: "12px",
  },
  emptyText: {
    fontSize: "14px",
    color: "var(--text-muted)",
  },
};

export default Sidebar;
