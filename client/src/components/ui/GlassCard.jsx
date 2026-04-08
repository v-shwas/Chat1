import { clsx } from "clsx";

const glowMap = {
  purple: "0 0 40px rgba(108,99,255,0.35)",
  cyan: "0 0 40px rgba(0,212,255,0.30)",
  pink: "0 0 40px rgba(255,107,157,0.30)",
  none: "none",
};

export default function GlassCard({ children, className, glow = "none", hover = false, onClick, style }) {
  return (
    <div
      className={clsx("glass", hover && "glass-hover", className)}
      onClick={onClick}
      style={{
        borderRadius: "var(--r-md)",
        padding: "16px",
        boxShadow: `var(--glass-shadow)${glow !== "none" ? `, ${glowMap[glow]}` : ""}`,
        cursor: onClick ? "pointer" : "default",
        ...style,
      }}
    >
      {children}
    </div>
  );
}
