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

      <div style={styles.card} className="animate-fade-in-up">
        {/* Logo / Brand */}
        <div style={styles.logoContainer}>
          <div style={styles.logoIcon}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </div>
          <h1 style={styles.logoText}>ChatFlow</h1>
        </div>

        <p style={styles.subtitle}>Welcome back! Sign in to continue</p>

        <form onSubmit={submitHandler} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Username or Email</label>
            <input
              type="text"
              value={userInfo}
              onChange={(e) => setUserInfo(e.target.value)}
              placeholder="Enter your username or email"
              style={styles.input}
              required
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
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
              <span style={styles.loadingDots}>Signing in...</span>
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        <div style={styles.divider}>
          <span style={styles.dividerLine} />
          <span style={styles.dividerText}>OR</span>
          <span style={styles.dividerLine} />
        </div>

        <Link to="/signup" style={styles.switchLink}>
          Don't have an account? <span style={styles.switchAccent}>Create one</span>
        </Link>
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
  glowOrb1: {
    position: "absolute",
    width: "400px",
    height: "400px",
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(108,99,255,0.15) 0%, transparent 70%)",
    top: "-100px",
    right: "-100px",
    pointerEvents: "none",
  },
  glowOrb2: {
    position: "absolute",
    width: "300px",
    height: "300px",
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(167,139,250,0.1) 0%, transparent 70%)",
    bottom: "-50px",
    left: "-50px",
    pointerEvents: "none",
  },
  card: {
    width: "100%",
    maxWidth: "420px",
    padding: "40px",
    borderRadius: "var(--radius-xl)",
    background: "var(--bg-secondary)",
    border: "1px solid var(--border-color)",
    boxShadow: "var(--shadow-lg), var(--shadow-glow)",
    position: "relative",
    zIndex: 1,
  },
  logoContainer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "12px",
    marginBottom: "8px",
  },
  logoIcon: {
    width: "48px",
    height: "48px",
    borderRadius: "var(--radius-md)",
    background: "var(--accent-gradient)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "white",
    boxShadow: "var(--accent-glow)",
  },
  logoText: {
    fontSize: "28px",
    fontWeight: "700",
    background: "var(--accent-gradient)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
  },
  subtitle: {
    textAlign: "center",
    color: "var(--text-secondary)",
    fontSize: "14px",
    marginBottom: "32px",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  inputGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  label: {
    fontSize: "13px",
    fontWeight: "500",
    color: "var(--text-secondary)",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
  },
  input: {
    width: "100%",
    padding: "14px 16px",
    borderRadius: "var(--radius-md)",
    border: "1px solid var(--border-color)",
    background: "var(--bg-glass)",
    color: "var(--text-primary)",
    fontSize: "15px",
    fontFamily: "inherit",
    outline: "none",
    transition: "border-color var(--transition-fast), box-shadow var(--transition-fast)",
  },
  button: {
    width: "100%",
    padding: "14px",
    borderRadius: "var(--radius-md)",
    border: "none",
    background: "var(--accent-gradient)",
    color: "white",
    fontSize: "15px",
    fontWeight: "600",
    fontFamily: "inherit",
    cursor: "pointer",
    transition: "transform var(--transition-fast), box-shadow var(--transition-fast)",
    boxShadow: "var(--accent-glow)",
    marginTop: "4px",
  },
  loadingDots: {
    display: "inline-block",
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
    fontSize: "12px",
    color: "var(--text-muted)",
    fontWeight: "500",
  },
  switchLink: {
    display: "block",
    textAlign: "center",
    color: "var(--text-secondary)",
    fontSize: "14px",
    textDecoration: "none",
    transition: "color var(--transition-fast)",
  },
  switchAccent: {
    color: "var(--accent-primary)",
    fontWeight: "600",
  },
};

export default Login;
