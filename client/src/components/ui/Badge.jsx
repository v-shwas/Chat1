import { useRef, useEffect } from "react";
import { badgePop } from "../../lib/animations";

export default function Badge({ count, variant = "accent" }) {
  const ref = useRef(null);

  useEffect(() => {
    if (ref.current && count > 0) {
      badgePop(ref.current);
    }
  }, [count]);

  if (!count || count <= 0) return null;

  const display = count > 99 ? "99+" : count;

  return (
    <span
      ref={ref}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        minWidth: 18,
        height: 18,
        padding: "0 5px",
        borderRadius: "var(--r-full)",
        background: variant === "accent"
          ? "linear-gradient(135deg, var(--accent-soft), var(--accent-strong))"
          : "var(--glass-bg)",
        border: variant === "accent" ? "none" : "1px solid var(--glass-border)",
        color: variant === "accent" ? "#241a00" : "var(--text-primary)",
        fontFamily: "var(--font-mono)",
        fontSize: 10,
        fontWeight: 500,
        lineHeight: 1,
      }}
    >
      {display}
    </span>
  );
}
