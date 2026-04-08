const sizeMap = {
  xs: 24, sm: 32, md: 40, lg: 56, xl: 80,
};

function hashName(name) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash);
}

const gradients = [
  "linear-gradient(135deg, #6c63ff, #00d4ff)",
  "linear-gradient(135deg, #ff6b9d, #6c63ff)",
  "linear-gradient(135deg, #00d4ff, #22c55e)",
  "linear-gradient(135deg, #6c63ff, #ff6b9d)",
  "linear-gradient(135deg, #22c55e, #00d4ff)",
];

export default function Avatar({ src, name = "", size = "md", online, speaking }) {
  const px = sizeMap[size] || 40;
  const initials = name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
  const gradient = gradients[hashName(name) % gradients.length];

  return (
    <div style={{
      position: "relative",
      width: px, height: px, flexShrink: 0,
    }}>
      {/* Speaking ring */}
      {speaking && (
        <div style={{
          position: "absolute", inset: -3,
          borderRadius: "50%",
          background: "conic-gradient(var(--accent), var(--cyan), var(--pink), var(--accent))",
          animation: "spin-slow 3s linear infinite",
          opacity: 0.7,
        }} />
      )}

      {src ? (
        <img
          src={src}
          alt={name}
          style={{
            width: px, height: px,
            borderRadius: "50%",
            objectFit: "cover",
            border: speaking ? "2px solid transparent" : "1px solid var(--border)",
            position: "relative",
          }}
        />
      ) : (
        <div style={{
          width: px, height: px,
          borderRadius: "50%",
          background: gradient,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "var(--font-mono)",
          fontSize: px * 0.35,
          fontWeight: 500,
          color: "#fff",
          position: "relative",
        }}>
          {initials}
        </div>
      )}

      {/* Online indicator */}
      {online !== undefined && (
        <span style={{
          position: "absolute",
          bottom: size === "xs" ? -1 : 1,
          right: size === "xs" ? -1 : 1,
          width: px * 0.28,
          height: px * 0.28,
          minWidth: 8,
          minHeight: 8,
          borderRadius: "50%",
          background: online ? "var(--green)" : "var(--text-muted)",
          border: `2px solid var(--void)`,
          animation: online ? "pulse-dot 2s infinite" : "none",
        }} />
      )}
    </div>
  );
}
