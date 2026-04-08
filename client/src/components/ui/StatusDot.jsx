const statusColors = {
  online: "var(--green)",
  away: "#eab308",
  busy: "var(--red)",
  offline: "var(--text-muted)",
};

export default function StatusDot({ status = "offline", size = 8 }) {
  return (
    <span style={{
      display: "inline-block",
      width: size,
      height: size,
      borderRadius: "50%",
      background: statusColors[status] || statusColors.offline,
      animation: status === "online" ? "pulse-dot 2s infinite" : "none",
      flexShrink: 0,
    }} />
  );
}
