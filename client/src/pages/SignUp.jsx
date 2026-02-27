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
      <div style={styles.glowOrb1} />
      <div style={styles.glowOrb2} />

      <div style={styles.card} className="animate-fade-in-up">
        <div style={styles.logoContainer}>
          <div style={styles.logoIcon}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <line x1="19" y1="8" x2="19" y2="14" />
              <line x1="22" y1="11" x2="16" y2="11" />
            </svg>
          </div>
          <h1 style={styles.logoText}>Join ChatFlow</h1>
        </div>

        <p style={styles.subtitle}>Create your account and start chatting</p>

        <form onSubmit={registerHandler} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              style={styles.input}
              required
            />
          </div>

          <div style={styles.row}>
            <div style={{ ...styles.inputGroup, flex: 1 }}>
              <label style={styles.label}>Full Name</label>
              <input
                type="text"
                value={fullname}
                onChange={(e) => setFullname(e.target.value)}
                placeholder="John Doe"
                style={styles.input}
                required
              />
            </div>
            <div style={{ ...styles.inputGroup, flex: 1 }}>
              <label style={styles.label}>Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="johndoe"
                style={styles.input}
                required
              />
            </div>
          </div>

          <div style={styles.row}>
            <div style={{ ...styles.inputGroup, flex: 1 }}>
              <label style={styles.label}>Password</label>
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
              <label style={styles.label}>Confirm</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter password"
                style={styles.input}
                required
                minLength={6}
              />
            </div>
          </div>

          {/* Gender Selection */}
          <div style={styles.inputGroup}>
            <label style={styles.label}>Gender</label>
            <div style={styles.genderRow}>
              <button
                type="button"
                onClick={() => setGender("male")}
                style={{
                  ...styles.genderBtn,
                  ...(gender === "male" ? styles.genderActive : {}),
                }}
              >
                <span style={{ fontSize: "18px" }}>👨</span>
                Male
              </button>
              <button
                type="button"
                onClick={() => setGender("female")}
                style={{
                  ...styles.genderBtn,
                  ...(gender === "female" ? styles.genderActive : {}),
                }}
              >
                <span style={{ fontSize: "18px" }}>👩</span>
                Female
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSigningUp || !gender}
            style={{
              ...styles.button,
              opacity: isSigningUp || !gender ? 0.7 : 1,
              cursor: isSigningUp || !gender ? "not-allowed" : "pointer",
            }}
          >
            {isSigningUp ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <div style={styles.divider}>
          <span style={styles.dividerLine} />
          <span style={styles.dividerText}>OR</span>
          <span style={styles.dividerLine} />
        </div>

        <Link to="/login" style={styles.switchLink}>
          Already have an account?{" "}
          <span style={styles.switchAccent}>Sign In</span>
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
    left: "-100px",
    pointerEvents: "none",
  },
  glowOrb2: {
    position: "absolute",
    width: "300px",
    height: "300px",
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(192,132,252,0.1) 0%, transparent 70%)",
    bottom: "-50px",
    right: "-50px",
    pointerEvents: "none",
  },
  card: {
    width: "100%",
    maxWidth: "480px",
    padding: "36px 40px",
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
    fontSize: "26px",
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
    marginBottom: "28px",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  row: {
    display: "flex",
    gap: "12px",
  },
  inputGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  label: {
    fontSize: "12px",
    fontWeight: "500",
    color: "var(--text-secondary)",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
  },
  input: {
    width: "100%",
    padding: "12px 14px",
    borderRadius: "var(--radius-md)",
    border: "1px solid var(--border-color)",
    background: "var(--bg-glass)",
    color: "var(--text-primary)",
    fontSize: "14px",
    fontFamily: "inherit",
    outline: "none",
    transition: "border-color var(--transition-fast)",
  },
  genderRow: {
    display: "flex",
    gap: "12px",
  },
  genderBtn: {
    flex: 1,
    padding: "12px",
    borderRadius: "var(--radius-md)",
    border: "1px solid var(--border-color)",
    background: "var(--bg-glass)",
    color: "var(--text-secondary)",
    fontSize: "14px",
    fontFamily: "inherit",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    transition: "all var(--transition-fast)",
  },
  genderActive: {
    borderColor: "var(--accent-primary)",
    background: "rgba(108, 99, 255, 0.1)",
    color: "var(--text-primary)",
    boxShadow: "0 0 12px rgba(108, 99, 255, 0.2)",
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
  },
  switchAccent: {
    color: "var(--accent-primary)",
    fontWeight: "600",
  },
};

export default SignUp;
