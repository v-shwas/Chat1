import { useRef } from "react";
import { clsx } from "clsx";
import { buttonPress } from "../../lib/animations";

const variants = {
  default: {
    background: "var(--glass-bg)",
    border: "1px solid var(--glass-border)",
    color: "var(--text-primary)",
  },
  accent: {
    background: "linear-gradient(135deg, var(--accent-soft), var(--accent-strong))",
    border: "1px solid rgba(255,224,136,0.28)",
    color: "#241a00",
    boxShadow: "0 12px 26px rgba(212,175,55,0.18)",
  },
  danger: {
    background: "rgba(239,68,68,0.2)",
    border: "1px solid rgba(239,68,68,0.3)",
    color: "var(--red)",
  },
  ghost: {
    background: "transparent",
    border: "1px solid var(--border)",
    color: "var(--text-secondary)",
  },
};

const sizes = {
  sm:   { height: "32px", padding: "0 12px", fontSize: "12px", borderRadius: "var(--r-sm)" },
  md:   { height: "40px", padding: "0 20px", fontSize: "14px", borderRadius: "var(--r-md)" },
  lg:   { height: "48px", padding: "0 28px", fontSize: "15px", borderRadius: "var(--r-lg)" },
  icon: { width: "40px", height: "40px", padding: "0", borderRadius: "50%", fontSize: "16px" },
};

export default function GlassButton({
  children, variant = "default", size = "md",
  loading = false, disabled = false, onClick, className, style,
}) {
  const ref = useRef(null);

  const handleClick = (e) => {
    if (disabled || loading) return;
    if (ref.current) buttonPress(ref.current);
    onClick?.(e);
  };

  return (
    <button
      ref={ref}
      className={clsx(className)}
      disabled={disabled || loading}
      onClick={handleClick}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "8px",
        fontFamily: "var(--font-body)",
        fontWeight: 700,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.4 : 1,
        transition: "all var(--dur-normal) var(--ease-smooth)",
        outline: "none",
        ...variants[variant],
        ...sizes[size],
        ...style,
      }}
    >
      {loading ? (
        <span style={{ width: 16, height: 16, border: "2px solid currentColor", borderTopColor: "transparent", borderRadius: "50%", animation: "spin-slow 0.8s linear infinite" }} />
      ) : children}
    </button>
  );
}
