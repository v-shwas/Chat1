import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useAuthStore from "../store/useAuthStore";
import GlassButton from "../components/ui/GlassButton";
import { AtSign, Lock, Mail, ShieldCheck, User } from "lucide-react";

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
    const success = await signup({ fullname, username, email, password, confirmPassword, gender });
    if (success) navigate("/dashboard");
  };

  return (
    <main style={styles.wrapper}>
      <section style={styles.card} className="animate-fade-in-up">
        <div style={styles.logoIcon}>
          <ShieldCheck size={28} />
        </div>
        <h1 style={styles.logoText}>Join Aurum</h1>
        <p style={styles.subtitle}>Create a private identity for secure conversations.</p>

        <form onSubmit={registerHandler} style={styles.form}>
          <Field icon={<Mail size={16} />} label="Email">
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" style={styles.input} required />
          </Field>

          <div style={styles.row}>
            <Field icon={<User size={16} />} label="Full name">
              <input type="text" value={fullname} onChange={(e) => setFullname(e.target.value)} placeholder="Your name" style={styles.input} required />
            </Field>
            <Field icon={<AtSign size={16} />} label="Username">
              <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="handle" style={styles.input} required />
            </Field>
          </div>

          <div style={styles.row}>
            <Field icon={<Lock size={16} />} label="Password">
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Minimum 6" style={styles.input} required minLength={6} />
            </Field>
            <Field icon={<Lock size={16} />} label="Confirm">
              <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Repeat" style={styles.input} required minLength={6} />
            </Field>
          </div>

          <div style={styles.inputGroup}>
            <span style={styles.label}>Profile type</span>
            <div style={styles.genderRow}>
              {["male", "female"].map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setGender(g)}
                  style={{ ...styles.genderBtn, ...(gender === g ? styles.genderActive : {}) }}
                >
                  {g === "male" ? "Classic" : "Refined"}
                </button>
              ))}
            </div>
          </div>

          <GlassButton
            variant="accent"
            size="lg"
            loading={isSigningUp}
            disabled={isSigningUp || !gender}
            onClick={registerHandler}
            style={{ width: "100%", marginTop: 6, borderRadius: "var(--r-full)" }}
          >
            Create secure account
          </GlassButton>
        </form>

        <div style={styles.switchRow}>
          <span style={styles.switchText}>Already inside?</span>
          <Link to="/login" style={styles.switchLink}>Sign in</Link>
        </div>
      </section>
    </main>
  );
};

const Field = ({ label, icon, children }) => (
  <label style={styles.inputGroup}>
    <span style={styles.label}>{label}</span>
    <div style={styles.inputShell}>
      <span style={styles.inputIcon}>{icon}</span>
      {children}
    </div>
  </label>
);

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
    maxWidth: "540px",
    padding: "34px 38px",
    borderRadius: "var(--r-2xl)",
    background: "rgba(28,27,26,0.84)",
    backdropFilter: "blur(20px)",
    WebkitBackdropFilter: "blur(20px)",
    border: "1px solid rgba(153,144,124,0.14)",
    boxShadow: "0 24px 70px rgba(0,0,0,0.46)",
    textAlign: "center",
  },
  logoIcon: {
    width: "54px",
    height: "54px",
    borderRadius: "var(--r-xl)",
    background: "linear-gradient(135deg, var(--accent-soft), var(--accent-strong))",
    color: "#241a00",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 14px",
  },
  logoText: { fontFamily: "var(--font-display)", fontSize: "30px", lineHeight: 1, fontWeight: 800, color: "var(--text-primary)" },
  subtitle: { color: "var(--text-muted)", fontSize: "14px", marginTop: "10px", marginBottom: "26px" },
  form: { display: "flex", flexDirection: "column", gap: "14px", textAlign: "left" },
  row: { display: "flex", gap: "12px" },
  inputGroup: { display: "flex", flexDirection: "column", gap: "7px", flex: 1, minWidth: 0 },
  label: { fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--text-muted)", letterSpacing: "0.10em", textTransform: "uppercase" },
  inputShell: { display: "flex", alignItems: "center", gap: "10px", padding: "0 14px", borderRadius: "var(--r-xl)", border: "1px solid var(--border)", background: "rgba(53,53,52,0.32)" },
  inputIcon: { color: "var(--text-muted)", display: "inline-flex", flexShrink: 0 },
  input: { width: "100%", height: "44px", border: "none", background: "transparent", color: "var(--text-primary)", fontSize: "14px", fontFamily: "var(--font-body)", outline: "none", minWidth: 0 },
  genderRow: { display: "flex", gap: "10px" },
  genderBtn: { flex: 1, padding: "11px", borderRadius: "var(--r-xl)", border: "1px solid var(--border)", background: "rgba(53,53,52,0.32)", color: "var(--text-secondary)", fontSize: "13px", fontFamily: "var(--font-body)", fontWeight: 700 },
  genderActive: { borderColor: "rgba(242,202,80,0.30)", background: "var(--accent-dim)", color: "var(--accent)" },
  switchRow: { display: "flex", justifyContent: "center", gap: "8px", marginTop: "22px", fontSize: "14px" },
  switchText: { color: "var(--text-muted)" },
  switchLink: { color: "var(--accent)", textDecoration: "none", fontWeight: 700 },
};

export default SignUp;
