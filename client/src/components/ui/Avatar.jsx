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
  "linear-gradient(135deg, #f2ca50, #735f32)",
  "linear-gradient(135deg, #b8c7bd, #4e5b51)",
  "linear-gradient(135deg, #c28468, #5f4f2c)",
  "linear-gradient(135deg, #ffe088, #7c7467)",
  "linear-gradient(135deg, #88a879, #3f4b3d)",
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
            border: speaking ? "2px solid transparent" : "1px solid rgba(242,202,80,0.18)",
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
          fontFamily: "var(--font-display)",
          fontSize: px * 0.35,
          fontWeight: 700,
          color: "#241a00",
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
          border: `2px solid var(--deep)`,
          animation: online ? "pulse-dot 2s infinite" : "none",
        }} />
      )}
    </div>
  );
}
