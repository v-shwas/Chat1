import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useAuthStore from "../store/useAuthStore";
import GlassButton from "../components/ui/GlassButton";

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
      <div style={styles.card} className="animate-fade-in-up">
        {/* Logo */}
        <div style={styles.logoSection}>
          <div style={styles.logoIcon}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </div>
          <h1 style={styles.logoText}>ChatFlow</h1>
        </div>
        <p style={styles.subtitle}>Sign in to your account</p>

        <form onSubmit={submitHandler} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Email or Username</label>
            <input
              type="text"
              value={userInfo}
              onChange={(e) => setUserInfo(e.target.value)}
              placeholder="Enter your email or username"
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

          <GlassButton
            variant="accent"
            size="lg"
            loading={isLoggingIn}
            disabled={isLoggingIn}
            onClick={submitHandler}
            style={{ width: "100%", marginTop: 4 }}
          >
            Sign In
          </GlassButton>
        </form>

        <div style={styles.divider}>
          <span style={styles.dividerLine} />
          <span style={styles.dividerText}>or</span>
          <span style={styles.dividerLine} />
        </div>

        <Link to="/signup" style={styles.switchLink}>
          Don't have an account? <span style={styles.switchAccent}>Sign Up</span>
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
    position: "relative",
    zIndex: 10,
  },
  card: {
    width: "100%",
    maxWidth: "420px",
    padding: "40px",
    borderRadius: "var(--r-xl)",
    background: "rgba(255,255,255,0.04)",
    backdropFilter: "blur(20px) saturate(180%)",
    WebkitBackdropFilter: "blur(20px) saturate(180%)",
    border: "1px solid var(--glass-border)",
    boxShadow: "var(--glass-shadow)",
  },
  logoSection: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "12px",
    marginBottom: "8px",
  },
  logoIcon: {
    width: "48px",
    height: "48px",
    borderRadius: "var(--r-md)",
    background: "var(--accent-dim)",
    border: "1px solid rgba(108,99,255,0.3)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "var(--accent)",
    animation: "glow-pulse 3s infinite",
  },
  logoText: {
    fontFamily: "var(--font-display)",
    fontSize: "28px",
    fontWeight: "800",
    color: "var(--text-primary)",
  },
  subtitle: {
    textAlign: "center",
    color: "var(--text-secondary)",
    fontSize: "14px",
    fontFamily: "var(--font-body)",
    marginBottom: "28px",
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
    fontSize: "11px",
    color: "var(--text-muted)",
    letterSpacing: "0.05em",
  },
  input: {
    width: "100%",
    padding: "12px 16px",
    borderRadius: "var(--r-md)",
    border: "1px solid var(--border)",
    background: "var(--surface)",
    color: "var(--text-primary)",
    fontSize: "14px",
    fontFamily: "var(--font-body)",
    outline: "none",
    transition: "border-color var(--dur-normal) var(--ease-smooth)",
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
    background: "var(--border)",
  },
  dividerText: {
    fontSize: "12px",
    fontFamily: "var(--font-mono)",
    color: "var(--text-muted)",
  },
  switchLink: {
    display: "block",
    textAlign: "center",
    color: "var(--text-secondary)",
    fontSize: "14px",
    fontFamily: "var(--font-body)",
    textDecoration: "none",
  },
  switchAccent: {
    color: "var(--accent)",
    fontWeight: "600",
  },
};

export default Login;
