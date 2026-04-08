import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useAuthStore from "../store/useAuthStore";
import GlassButton from "../components/ui/GlassButton";

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
      fullname, username, email, password, confirmPassword, gender,
    });
    if (success) navigate("/dashboard");
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.card} className="animate-fade-in-up">
        {/* Logo */}
        <div style={styles.logoSection}>
          <div style={styles.logoIcon}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <line x1="19" y1="8" x2="19" y2="14" />
              <line x1="22" y1="11" x2="16" y2="11" />
            </svg>
          </div>
          <h1 style={styles.logoText}>ChatFlow</h1>
        </div>
        <p style={styles.subtitle}>Create your account</p>

        <form onSubmit={registerHandler} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com" style={styles.input} required />
          </div>

          <div style={styles.row}>
            <div style={{ ...styles.inputGroup, flex: 1 }}>
              <label style={styles.label}>Full Name</label>
              <input type="text" value={fullname} onChange={(e) => setFullname(e.target.value)}
                placeholder="John Doe" style={styles.input} required />
            </div>
            <div style={{ ...styles.inputGroup, flex: 1 }}>
              <label style={styles.label}>Username</label>
              <input type="text" value={username} onChange={(e) => setUsername(e.target.value)}
                placeholder="johndoe" style={styles.input} required />
            </div>
          </div>

          <div style={styles.row}>
            <div style={{ ...styles.inputGroup, flex: 1 }}>
              <label style={styles.label}>Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                placeholder="Min 6 characters" style={styles.input} required minLength={6} />
            </div>
            <div style={{ ...styles.inputGroup, flex: 1 }}>
              <label style={styles.label}>Confirm</label>
              <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter" style={styles.input} required minLength={6} />
            </div>
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Gender</label>
            <div style={styles.genderRow}>
              {["male", "female"].map((g) => (
                <button key={g} type="button" onClick={() => setGender(g)}
                  style={{
                    ...styles.genderBtn,
                    ...(gender === g ? styles.genderActive : {}),
                  }}>
                  {g === "male" ? "Male" : "Female"}
                </button>
              ))}
            </div>
          </div>

          <GlassButton variant="accent" size="lg" loading={isSigningUp}
            disabled={isSigningUp || !gender}
            onClick={registerHandler}
            style={{ width: "100%", marginTop: 4 }}>
            Create Account
          </GlassButton>
        </form>

        <div style={styles.divider}>
          <span style={styles.dividerLine} />
          <span style={styles.dividerText}>or</span>
          <span style={styles.dividerLine} />
        </div>

        <Link to="/login" style={styles.switchLink}>
          Already have an account? <span style={styles.switchAccent}>Sign In</span>
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
    maxWidth: "480px",
    padding: "36px 40px",
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
    width: "44px",
    height: "44px",
    borderRadius: "var(--r-md)",
    background: "var(--accent-dim)",
    border: "1px solid rgba(108,99,255,0.3)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "var(--accent)",
  },
  logoText: {
    fontFamily: "var(--font-display)",
    fontSize: "26px",
    fontWeight: "800",
    color: "var(--text-primary)",
  },
  subtitle: {
    textAlign: "center",
    color: "var(--text-secondary)",
    fontSize: "14px",
    marginBottom: "24px",
  },
  form: { display: "flex", flexDirection: "column", gap: "14px" },
  row: { display: "flex", gap: "12px" },
  inputGroup: { display: "flex", flexDirection: "column", gap: "5px" },
  label: { fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--text-muted)", letterSpacing: "0.05em" },
  input: {
    width: "100%",
    padding: "11px 14px",
    borderRadius: "var(--r-md)",
    border: "1px solid var(--border)",
    background: "var(--surface)",
    color: "var(--text-primary)",
    fontSize: "14px",
    fontFamily: "var(--font-body)",
    outline: "none",
    transition: "border-color var(--dur-normal) var(--ease-smooth)",
  },
  genderRow: { display: "flex", gap: "12px" },
  genderBtn: {
    flex: 1,
    padding: "10px",
    borderRadius: "var(--r-md)",
    border: "1px solid var(--border)",
    background: "var(--surface)",
    color: "var(--text-secondary)",
    fontSize: "13px",
    fontFamily: "var(--font-body)",
    fontWeight: 500,
    cursor: "pointer",
    transition: "all var(--dur-normal) var(--ease-smooth)",
  },
  genderActive: {
    borderColor: "rgba(108,99,255,0.4)",
    background: "var(--accent-dim)",
    color: "var(--accent)",
    boxShadow: "0 0 12px rgba(108,99,255,0.15)",
  },
  divider: { display: "flex", alignItems: "center", gap: "16px", margin: "20px 0" },
  dividerLine: { flex: 1, height: "1px", background: "var(--border)" },
  dividerText: { fontSize: "12px", fontFamily: "var(--font-mono)", color: "var(--text-muted)" },
  switchLink: {
    display: "block",
    textAlign: "center",
    color: "var(--text-secondary)",
    fontSize: "14px",
    textDecoration: "none",
  },
  switchAccent: { color: "var(--accent)", fontWeight: "600" },
};

export default SignUp;
