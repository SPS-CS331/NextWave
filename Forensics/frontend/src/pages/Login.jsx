import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API_BASE = "http://localhost:5000/api";

const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "radial-gradient(circle at 20% 20%, rgba(96,165,250,0.12), transparent 32%), linear-gradient(135deg, #050a14 0%, #0a1020 50%, #0f1a30 100%)",
    color: "#f3f6fc",
    padding: "28px",
  },
  hero: {
    display: "flex",
    width: "100%",
    maxWidth: "1400px",
    minHeight: "620px",
    borderRadius: "18px",
    overflow: "hidden",
    boxShadow: "0 28px 80px rgba(0,0,0,0.45)",
    border: "1px solid rgba(255,255,255,0.08)",
    background: "rgba(10,14,24,0.82)",
  },
  panelImage: {
    flex: "1 1 50%",
    minWidth: "50%",
    background: "linear-gradient(120deg, rgba(5,10,20,0.45), rgba(5,10,20,0.1)), url('/art/detective.png.png') center/cover no-repeat",
  },
  panelForm: {
    flex: "1 1 50%",
    minWidth: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "48px 36px",
  },
  card: {
    width: "100%",
    maxWidth: "420px",
    background: "rgba(10,14,24,0.94)",
    border: "1px solid rgba(255,255,255,0.18)",
    borderRadius: "16px",
    padding: "28px",
    boxShadow: "0 20px 60px rgba(0,0,0,0.38)",
    backdropFilter: "blur(10px)",
  },
  title: { margin: 0, fontSize: "26px", letterSpacing: "-0.02em" },
  subtitle: { color: "#c8d6f3", marginTop: "6px", marginBottom: "18px" },
  form: { display: "grid", gap: "12px" },
  label: { fontWeight: 600, color: "#dbeafe", fontSize: "13px" },
  input: {
    width: "100%",
    padding: "12px",
    borderRadius: "10px",
    border: "1px solid rgba(255,255,255,0.22)",
    background: "rgba(9,14,26,0.65)",
    color: "#f3f6fc",
  },
  buttonPrimary: {
    border: "none",
    padding: "12px",
    borderRadius: "10px",
    background: "linear-gradient(120deg, #60a5fa, #38bdf8)",
    color: "#0a0f1d",
    fontWeight: 800,
    cursor: "pointer",
    boxShadow: "0 14px 32px rgba(96,165,250,0.35)",
  },
  buttonGhost: {
    display: "inline-block",
    textAlign: "center",
    padding: "11px 12px",
    borderRadius: "10px",
    border: "1px solid rgba(255,255,255,0.28)",
    color: "#f3f6fc",
    textDecoration: "none",
    fontWeight: 600,
  },
  footer: { marginTop: "14px", display: "flex", justifyContent: "space-between", fontSize: "13px" },
  error: {
    color: "#fecdd3",
    background: "rgba(248,113,113,0.12)",
    border: "1px solid rgba(248,113,113,0.32)",
    padding: "10px 12px",
    borderRadius: "10px",
  },
  topBanner: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    padding: "16px 28px",
    display: "flex",
    justifyContent: "center",
    pointerEvents: "none",
    zIndex: 2,
  },
  topBadge: {
    background: "rgba(10,14,24,0.86)",
    border: "1px solid rgba(255,255,255,0.14)",
    color: "#e5edff",
    padding: "10px 18px",
    borderRadius: "14px",
    fontSize: "18px",
    fontWeight: 800,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    boxShadow: "0 12px 40px rgba(0,0,0,0.35)",
  },
};

export default function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
    roleId: "",
  });
  const [error, setError] = useState("");

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    try {
      const res = await axios.post(`${API_BASE}/auth/login`, form);

      localStorage.setItem("token", res.data.token);
      navigate("/home");
    } catch (err) {
      const message = err.response?.data?.error || "Login failed. Please try again.";
      setError(message);
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.topBanner}>
        <div style={styles.topBadge}>Forensics Control Center</div>
      </div>
      <div style={styles.hero}>
        <div style={styles.panelImage} />
        <div style={styles.panelForm}>
      <style>{`
        @keyframes sweep {
          0% { transform: translateX(-50%) rotate(12deg); opacity: 0.35; }
          50% { opacity: 0.55; }
          100% { transform: translateX(120%) rotate(12deg); opacity: 0.35; }
        }
        @keyframes pulseDots {
          0%, 100% { opacity: 0.12; }
          50% { opacity: 0.28; }
        }
      `}</style>
      <div style={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        pointerEvents: "none",
        zIndex: 0,
      }}>
        <div style={{
          position: "absolute",
          top: "10%",
          left: "-40%",
          width: "180%",
          height: "220px",
          background: "linear-gradient(90deg, rgba(59,130,246,0.18), rgba(34,211,238,0.06))",
          filter: "blur(12px)",
          transform: "rotate(12deg)",
          animation: "sweep 9s linear infinite",
        }} />
        <div style={{
          position: "absolute",
          bottom: "8%",
          right: "6%",
          width: "180px",
          height: "180px",
          background: "radial-gradient(circle, rgba(255,255,255,0.16) 0%, rgba(255,255,255,0) 60%)",
          animation: "pulseDots 3.2s ease-in-out infinite",
        }} />
      </div>

      <div style={styles.card}>
        <div style={{ fontSize: "13px", letterSpacing: "0.14em", textTransform: "uppercase", color: "#9fb1d3", marginBottom: "6px" }}>
          Forensics Control Center
        </div>
        <h2 style={styles.title}>Welcome back</h2>
        <p style={styles.subtitle}>Sign in to access the Forensics Control Center</p>

        {error && <p style={styles.error}>{error}</p>}

        <form style={styles.form} onSubmit={handleSubmit}>
          <div>
            <div style={styles.label}>Email</div>
            <input style={styles.input} name="email" type="email" placeholder="you@example.com" onChange={handleChange} required />
          </div>
          <div>
            <div style={styles.label}>Role ID</div>
            <input style={styles.input} name="roleId" placeholder="ADM / INV / ANL id" onChange={handleChange} required />
          </div>
          <div>
            <div style={styles.label}>Password</div>
            <input
              style={styles.input}
              name="password"
              type="password"
              placeholder="••••••••"
              onChange={handleChange}
              required
            />
          </div>

          <button style={styles.buttonPrimary} type="submit">Login</button>
        </form>

        <div style={styles.footer}>
          <a style={styles.buttonGhost} href={`${API_BASE.replace("/api", "")}/auth/google`}>Login with Google</a>
          <a style={{ color: "#93c5fd", textDecoration: "none", alignSelf: "center" }} href="/login" onClick={(e) => { e.preventDefault(); navigate("/"); }}>
            Create account
          </a>
        </div>
      </div>
        </div>
      </div>
    </div>
  );
}
