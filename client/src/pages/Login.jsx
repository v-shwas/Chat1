import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useAuthStore from "../store/useAuthStore";
import GlassButton from "../components/ui/GlassButton";
import { Lock, ShieldCheck, User } from "lucide-react";

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
    <main style={styles.wrapper}>
      <section style={styles.card} className="animate-fade-in-up">
        <div style={styles.logoIcon}>
          <ShieldCheck size={30} />
        </div>
        <h1 style={styles.logoText}>Aurum</h1>
        <p style={styles.subtitle}>Private messaging with a calmer surface.</p>

        <form onSubmit={submitHandler} style={styles.form}>
          <label style={styles.inputGroup}>
            <span style={styles.label}>Identity</span>
            <div style={styles.inputShell}>
              <User size={16} style={styles.inputIcon} />
              <input
                type="text"
                value={userInfo}
                onChange={(e) => setUserInfo(e.target.value)}
                placeholder="Email or username"
                style={styles.input}
                required
              />
            </div>
          </label>

          <label style={styles.inputGroup}>
            <span style={styles.label}>Passphrase</span>
            <div style={styles.inputShell}>
              <Lock size={16} style={styles.inputIcon} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                style={styles.input}
                required
              />
            </div>
          </label>

          <GlassButton
            variant="accent"
            size="lg"
            loading={isLoggingIn}
            disabled={isLoggingIn}
            onClick={submitHandler}
            style={{ width: "100%", marginTop: 6, borderRadius: "var(--r-full)" }}
          >
            Open Aurum
          </GlassButton>
        </form>

        <div style={styles.switchRow}>
          <span style={styles.switchText}>New secure workspace?</span>
          <Link to="/signup" style={styles.switchLink}>Create account</Link>
        </div>
      </section>
    </main>
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
    padding: "24px",
  },
  card: {
    width: "100%",
    maxWidth: "430px",
    padding: "38px",
    borderRadius: "var(--r-2xl)",
    background: "rgba(28,27,26,0.84)",
    backdropFilter: "blur(20px)",
    WebkitBackdropFilter: "blur(20px)",
    border: "1px solid rgba(153,144,124,0.14)",
    boxShadow: "0 24px 70px rgba(0,0,0,0.46)",
    textAlign: "center",
  },
  logoIcon: {
    width: "58px",
    height: "58px",
    borderRadius: "var(--r-xl)",
    background: "linear-gradient(135deg, var(--accent-soft), var(--accent-strong))",
    color: "#241a00",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 16px",
    boxShadow: "0 16px 36px rgba(212,175,55,0.20)",
  },
  logoText: {
    fontFamily: "var(--font-display)",
    fontSize: "34px",
    lineHeight: 1,
    fontWeight: 800,
    letterSpacing: "-0.02em",
    color: "var(--text-primary)",
  },
  subtitle: {
    color: "var(--text-muted)",
    fontSize: "14px",
    marginTop: "10px",
    marginBottom: "30px",
  },
  form: { display: "flex", flexDirection: "column", gap: "16px", textAlign: "left" },
  inputGroup: { display: "flex", flexDirection: "column", gap: "7px" },
  label: {
    fontFamily: "var(--font-mono)",
    fontSize: "11px",
    color: "var(--text-muted)",
    letterSpacing: "0.10em",
    textTransform: "uppercase",
  },
  inputShell: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "0 14px",
    borderRadius: "var(--r-xl)",
    border: "1px solid var(--border)",
    background: "rgba(53,53,52,0.32)",
  },
  inputIcon: { color: "var(--text-muted)", flexShrink: 0 },
  input: {
    width: "100%",
    height: "46px",
    border: "none",
    background: "transparent",
    color: "var(--text-primary)",
    fontSize: "14px",
    fontFamily: "var(--font-body)",
    outline: "none",
  },
  switchRow: {
    display: "flex",
    justifyContent: "center",
    gap: "8px",
    marginTop: "24px",
    fontSize: "14px",
  },
  switchText: { color: "var(--text-muted)" },
  switchLink: { color: "var(--accent)", textDecoration: "none", fontWeight: 700 },
};

export default Login;
