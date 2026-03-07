import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useAuthStore from "../store/useAuthStore";

const Login = () => {
  const [userInfo, setUserInfo] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { login, isLoggingIn } = useAuthStore();

  const submitHandler = async (e) => {
    e.preventDefault();
    if (!userInfo || !password) return;
    const success = await login({ userInfo, password });
    if (success) navigate("/dashboard");
  };

  return (
    <div style={styles.wrapper}>
      {/* Ambient glow effects */}
      <div style={styles.glowOrb1} />
      <div style={styles.glowOrb2} />
      <div style={styles.glowOrb3} />

      {/* Neural grid background */}
      <div style={styles.gridBg} />

      {/* Scan line effect */}
      <div style={styles.scanLine} />

      <div style={styles.card} className="animate-fade-in-up">
        {/* Logo / Brand */}
        <div style={styles.logoContainer}>
          <div style={styles.logoIcon}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3" />
              <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83" />
            </svg>
          </div>
          <h1 style={styles.logoText}>NEURAL CORE</h1>
        </div>

        <p style={styles.subtitle}>Authenticate to access quantum neural network</p>

        {/* Status Indicator */}
        <div style={styles.statusBar}>
          <span style={styles.statusDot} />
          <span style={styles.statusLabel}>SECURE CHANNEL ACTIVE</span>
        </div>

        <form onSubmit={submitHandler} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>NEURAL ID</label>
            <input
              type="text"
              value={userInfo}
              onChange={(e) => setUserInfo(e.target.value)}
              placeholder="Enter your neural identifier"
              style={styles.input}
              required
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>ACCESS KEY</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter access encryption key"
              style={styles.input}
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoggingIn}
            style={{
              ...styles.button,
              opacity: isLoggingIn ? 0.7 : 1,
              cursor: isLoggingIn ? "not-allowed" : "pointer",
            }}
          >
            {isLoggingIn ? (
              <span style={styles.loadingDots}>AUTHENTICATING...</span>
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                </svg>
                INITIATE LINK
              </>
            )}
          </button>
        </form>

        <div style={styles.divider}>
          <span style={styles.dividerLine} />
          <span style={styles.dividerText}>OR</span>
          <span style={styles.dividerLine} />
        </div>

        <Link to="/signup" style={styles.switchLink}>
          New to the network? <span style={styles.switchAccent}>Register Node</span>
        </Link>

        {/* Footer */}
        <div style={styles.cardFooter}>
          <span style={styles.footerText}>NEURAL LATTICE ENCRYPTED</span>
          <span style={styles.footerDot}>•</span>
          <span style={styles.footerText}>PROTOCOL V.9.4</span>
        </div>
      </div>
    </div>
  );
};

const styles = {
  wrapper: {
    minHeight: "100vh",
    width: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "var(--bg-primary)",
    position: "relative",
    overflow: "hidden",
  },
  gridBg: {
    position: "absolute",
    inset: 0,
    backgroundImage:
      "linear-gradient(rgba(0, 229, 255, 0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 229, 255, 0.02) 1px, transparent 1px)",
    backgroundSize: "50px 50px",
    pointerEvents: "none",
  },
  scanLine: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "2px",
    background: "linear-gradient(90deg, transparent, rgba(0, 229, 255, 0.15), transparent)",
    animation: "scan-line 8s linear infinite",
    pointerEvents: "none",
  },
  glowOrb1: {
    position: "absolute",
    width: "500px",
    height: "500px",
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(0,229,255,0.08) 0%, transparent 70%)",
    top: "-150px",
    right: "-150px",
    pointerEvents: "none",
  },
  glowOrb2: {
    position: "absolute",
    width: "400px",
    height: "400px",
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(124,77,255,0.06) 0%, transparent 70%)",
    bottom: "-100px",
    left: "-100px",
    pointerEvents: "none",
  },
  glowOrb3: {
    position: "absolute",
    width: "300px",
    height: "300px",
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(0,229,255,0.04) 0%, transparent 70%)",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    pointerEvents: "none",
  },
  card: {
    width: "100%",
    maxWidth: "440px",
    padding: "40px",
    borderRadius: "var(--radius-xl)",
    background: "var(--bg-secondary)",
    border: "1px solid var(--border-glow)",
    boxShadow: "var(--shadow-lg), var(--shadow-glow-cyan)",
    position: "relative",
    zIndex: 1,
  },
  logoContainer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "14px",
    marginBottom: "10px",
  },
  logoIcon: {
    width: "52px",
    height: "52px",
    borderRadius: "var(--radius-md)",
    background: "linear-gradient(135deg, rgba(0,229,255,0.12) 0%, rgba(124,77,255,0.12) 100%)",
    border: "1px solid rgba(0,229,255,0.2)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "var(--accent-cyan)",
    animation: "pulse-cyan 3s infinite",
  },
  logoText: {
    fontFamily: "var(--font-heading)",
    fontSize: "24px",
    fontWeight: "800",
    color: "var(--accent-cyan)",
    letterSpacing: "0.15em",
  },
  subtitle: {
    textAlign: "center",
    color: "var(--text-muted)",
    fontSize: "13px",
    fontFamily: "var(--font-body)",
    fontWeight: "500",
    marginBottom: "16px",
  },
  statusBar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    padding: "8px 16px",
    borderRadius: "var(--radius-full)",
    background: "rgba(0, 229, 255, 0.04)",
    border: "1px solid rgba(0, 229, 255, 0.08)",
    marginBottom: "28px",
  },
  statusDot: {
    width: "6px",
    height: "6px",
    borderRadius: "50%",
    background: "var(--accent-cyan)",
    animation: "pulse-dot 2s infinite",
  },
  statusLabel: {
    fontFamily: "var(--font-mono)",
    fontSize: "9px",
    color: "var(--accent-cyan)",
    letterSpacing: "0.15em",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "18px",
  },
  inputGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  label: {
    fontFamily: "var(--font-mono)",
    fontSize: "10px",
    fontWeight: "400",
    color: "var(--text-muted)",
    letterSpacing: "0.15em",
  },
  input: {
    width: "100%",
    padding: "14px 16px",
    borderRadius: "var(--radius-md)",
    border: "1px solid var(--border-color)",
    background: "rgba(0, 229, 255, 0.03)",
    color: "var(--text-primary)",
    fontSize: "14px",
    fontFamily: "var(--font-body)",
    fontWeight: "500",
    outline: "none",
    transition: "border-color var(--transition-fast), box-shadow var(--transition-fast)",
    letterSpacing: "0.02em",
  },
  button: {
    width: "100%",
    padding: "14px",
    borderRadius: "var(--radius-md)",
    border: "none",
    background: "linear-gradient(135deg, rgba(0,229,255,0.15) 0%, rgba(0,188,212,0.2) 100%)",
    border: "1px solid rgba(0,229,255,0.25)",
    color: "var(--accent-cyan)",
    fontFamily: "var(--font-heading)",
    fontSize: "12px",
    fontWeight: "700",
    letterSpacing: "0.15em",
    cursor: "pointer",
    transition: "all var(--transition-fast)",
    boxShadow: "0 4px 20px rgba(0, 229, 255, 0.15)",
    marginTop: "4px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
  },
  loadingDots: {
    display: "inline-block",
    fontFamily: "var(--font-mono)",
    fontSize: "10px",
    letterSpacing: "0.15em",
  },
  divider: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    margin: "24px 0",
  },
  dividerLine: {
    flex: 1,
    height: "1px",
    background: "var(--border-color)",
  },
  dividerText: {
    fontSize: "10px",
    fontFamily: "var(--font-mono)",
    color: "var(--text-muted)",
    letterSpacing: "0.1em",
  },
  switchLink: {
    display: "block",
    textAlign: "center",
    color: "var(--text-secondary)",
    fontSize: "13px",
    fontFamily: "var(--font-body)",
    fontWeight: "500",
    textDecoration: "none",
    transition: "color var(--transition-fast)",
  },
  switchAccent: {
    color: "var(--accent-cyan)",
    fontWeight: "700",
  },
  cardFooter: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
    marginTop: "28px",
    paddingTop: "16px",
    borderTop: "1px solid var(--border-color)",
  },
  footerText: {
    fontFamily: "var(--font-mono)",
    fontSize: "8px",
    color: "var(--text-muted)",
    letterSpacing: "0.15em",
  },
  footerDot: {
    color: "var(--text-muted)",
    fontSize: "6px",
    opacity: 0.5,
  },
};

export default Login;
