import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useAuthStore from "../store/useAuthStore";

const SignUp = () => {
  const [fullname, setFullname] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [gender, setGender] = useState("");
  const navigate = useNavigate();
  const { signup, isSigningUp } = useAuthStore();

  const registerHandler = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) return;
    const success = await signup({
      fullname,
      username,
      email,
      password,
      confirmPassword,
      gender,
    });
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
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <line x1="19" y1="8" x2="19" y2="14" />
              <line x1="22" y1="11" x2="16" y2="11" />
            </svg>
          </div>
          <h1 style={styles.logoText}>NEURAL CORE</h1>
        </div>

        <p style={styles.subtitle}>Register a new node on the quantum network</p>

        {/* Status Indicator */}
        <div style={styles.statusBar}>
          <span style={styles.statusDot} />
          <span style={styles.statusLabel}>NODE REGISTRATION OPEN</span>
        </div>

        <form onSubmit={registerHandler} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>NEURAL EMAIL</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="operator@neuralcore.net"
              style={styles.input}
              required
            />
          </div>

          <div style={styles.row}>
            <div style={{ ...styles.inputGroup, flex: 1 }}>
              <label style={styles.label}>OPERATOR NAME</label>
              <input
                type="text"
                value={fullname}
                onChange={(e) => setFullname(e.target.value)}
                placeholder="Full designation"
                style={styles.input}
                required
              />
            </div>
            <div style={{ ...styles.inputGroup, flex: 1 }}>
              <label style={styles.label}>NODE HANDLE</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="node_handle"
                style={styles.input}
                required
              />
            </div>
          </div>

          <div style={styles.row}>
            <div style={{ ...styles.inputGroup, flex: 1 }}>
              <label style={styles.label}>ACCESS KEY</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min 6 characters"
                style={styles.input}
                required
                minLength={6}
              />
            </div>
            <div style={{ ...styles.inputGroup, flex: 1 }}>
              <label style={styles.label}>CONFIRM KEY</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter key"
                style={styles.input}
                required
                minLength={6}
              />
            </div>
          </div>

          {/* Gender Selection */}
          <div style={styles.inputGroup}>
            <label style={styles.label}>OPERATOR TYPE</label>
            <div style={styles.genderRow}>
              <button
                type="button"
                onClick={() => setGender("male")}
                style={{
                  ...styles.genderBtn,
                  ...(gender === "male" ? styles.genderActive : {}),
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 8v8M8 12h8" />
                </svg>
                Alpha
              </button>
              <button
                type="button"
                onClick={() => setGender("female")}
                style={{
                  ...styles.genderBtn,
                  ...(gender === "female" ? styles.genderActive : {}),
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M8 12h8" />
                </svg>
                Beta
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSigningUp || !gender}
            style={{
              ...styles.button,
              opacity: isSigningUp || !gender ? 0.5 : 1,
              cursor: isSigningUp || !gender ? "not-allowed" : "pointer",
            }}
          >
            {isSigningUp ? (
              <span style={styles.loadingText}>INITIALIZING NODE...</span>
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                </svg>
                REGISTER NODE
              </>
            )}
          </button>
        </form>

        <div style={styles.divider}>
          <span style={styles.dividerLine} />
          <span style={styles.dividerText}>OR</span>
          <span style={styles.dividerLine} />
        </div>

        <Link to="/login" style={styles.switchLink}>
          Already registered? <span style={styles.switchAccent}>Access Node</span>
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
    background: "radial-gradient(circle, rgba(124,77,255,0.08) 0%, transparent 70%)",
    top: "-150px",
    left: "-150px",
    pointerEvents: "none",
  },
  glowOrb2: {
    position: "absolute",
    width: "400px",
    height: "400px",
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(0,229,255,0.06) 0%, transparent 70%)",
    bottom: "-100px",
    right: "-100px",
    pointerEvents: "none",
  },
  glowOrb3: {
    position: "absolute",
    width: "250px",
    height: "250px",
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(0,229,255,0.04) 0%, transparent 70%)",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    pointerEvents: "none",
  },
  card: {
    width: "100%",
    maxWidth: "500px",
    padding: "36px 40px",
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
    marginBottom: "8px",
  },
  logoIcon: {
    width: "48px",
    height: "48px",
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
    fontSize: "22px",
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
    marginBottom: "12px",
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
    marginBottom: "24px",
  },
  statusDot: {
    width: "6px",
    height: "6px",
    borderRadius: "50%",
    background: "var(--success)",
    boxShadow: "0 0 6px rgba(0, 230, 118, 0.6)",
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
    gap: "14px",
  },
  row: {
    display: "flex",
    gap: "12px",
  },
  inputGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "5px",
  },
  label: {
    fontFamily: "var(--font-mono)",
    fontSize: "9px",
    fontWeight: "400",
    color: "var(--text-muted)",
    letterSpacing: "0.15em",
  },
  input: {
    width: "100%",
    padding: "12px 14px",
    borderRadius: "var(--radius-md)",
    border: "1px solid var(--border-color)",
    background: "rgba(0, 229, 255, 0.03)",
    color: "var(--text-primary)",
    fontSize: "13px",
    fontFamily: "var(--font-body)",
    fontWeight: "500",
    outline: "none",
    transition: "border-color var(--transition-fast), box-shadow var(--transition-fast)",
    letterSpacing: "0.02em",
  },
  genderRow: {
    display: "flex",
    gap: "12px",
  },
  genderBtn: {
    flex: 1,
    padding: "10px",
    borderRadius: "var(--radius-md)",
    border: "1px solid var(--border-color)",
    background: "rgba(0, 229, 255, 0.03)",
    color: "var(--text-secondary)",
    fontSize: "12px",
    fontFamily: "var(--font-body)",
    fontWeight: "600",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    transition: "all var(--transition-fast)",
    letterSpacing: "0.05em",
  },
  genderActive: {
    borderColor: "rgba(0, 229, 255, 0.3)",
    background: "rgba(0, 229, 255, 0.08)",
    color: "var(--accent-cyan)",
    boxShadow: "0 0 12px rgba(0, 229, 255, 0.15)",
  },
  button: {
    width: "100%",
    padding: "14px",
    borderRadius: "var(--radius-md)",
    border: "1px solid rgba(0,229,255,0.25)",
    background: "linear-gradient(135deg, rgba(0,229,255,0.15) 0%, rgba(0,188,212,0.2) 100%)",
    color: "var(--accent-cyan)",
    fontFamily: "var(--font-heading)",
    fontSize: "11px",
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
  loadingText: {
    fontFamily: "var(--font-mono)",
    fontSize: "10px",
    letterSpacing: "0.15em",
  },
  divider: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    margin: "20px 0",
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
    marginTop: "24px",
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

export default SignUp;
