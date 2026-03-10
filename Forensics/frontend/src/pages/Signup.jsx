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
    background: "linear-gradient(120deg, rgba(5,10,20,0.45), rgba(5,10,20,0.1)), url('/art/crime-scene.png.png') center/cover no-repeat",
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
    maxWidth: "520px",
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
  select: {
    width: "100%",
    padding: "12px",
    borderRadius: "10px",
    border: "1px solid #5fa8f7",
    background: "#0f172a",
    color: "#f3f6fc",
    fontWeight: 600,
    appearance: "none",
    WebkitAppearance: "none",
    MozAppearance: "none",
  },
  option: { background: "#0f172a", color: "#e9eef7" },
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
  error: {
    color: "#fecdd3",
    background: "rgba(248,113,113,0.12)",
    border: "1px solid rgba(248,113,113,0.32)",
    padding: "10px 12px",
    borderRadius: "10px",
  },
  modalBackdrop: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.55)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 20,
  },
  modal: {
    background: "#0f1a2d",
    color: "#e9eef7",
    padding: "24px",
    borderRadius: "14px",
    border: "1px solid rgba(255,255,255,0.08)",
    width: "320px",
    textAlign: "center",
    boxShadow: "0 18px 50px rgba(0,0,0,0.35)",
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

export default function Signup() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "",
    department: "",
    specialization: "",
  });

  const [showPopup, setShowPopup] = useState(false);
  const [generatedId, setGeneratedId] = useState("");
  const [error, setError] = useState("");

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    try {
      const res = await axios.post(`${API_BASE}/auth/signup`, form);
      setGeneratedId(res.data.roleId);
      setShowPopup(true);
    } catch (err) {
      const message = err.response?.data?.error || "Signup failed. Please try again.";
      setError(message);
    }
  }

  function closePopup() {
    setShowPopup(false);
    navigate("/login");
  }

  return (
    <div style={styles.page}>
      <div style={styles.topBanner}>
        <div style={styles.topBadge}>Forensics Control Center</div>
      </div>
      <style>{`
        @keyframes sweep {
          0% { transform: translateX(-60%) rotate(10deg); opacity: 0.32; }
          50% { opacity: 0.5; }
          100% { transform: translateX(120%) rotate(10deg); opacity: 0.32; }
        }
        @keyframes pulseDots {
          0%, 100% { opacity: 0.12; }
          50% { opacity: 0.26; }
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
          top: "12%",
          left: "-40%",
          width: "185%",
          height: "220px",
          background: "linear-gradient(90deg, rgba(59,130,246,0.18), rgba(34,211,238,0.06))",
          filter: "blur(12px)",
          transform: "rotate(10deg)",
          animation: "sweep 10s linear infinite",
        }} />
        <div style={{
          position: "absolute",
          bottom: "10%",
          right: "8%",
          width: "190px",
          height: "190px",
          background: "radial-gradient(circle, rgba(255,255,255,0.16) 0%, rgba(255,255,255,0) 60%)",
          animation: "pulseDots 3.4s ease-in-out infinite",
        }} />
      </div>

      <div style={styles.hero}>
        <div style={styles.panelImage} />
        <div style={styles.panelForm}>
          <div style={styles.card}>
            <div style={{ fontSize: "13px", letterSpacing: "0.14em", textTransform: "uppercase", color: "#9fb1d3", marginBottom: "6px" }}>
              Forensics Control Center
            </div>
            <h2 style={styles.title}>Create an account</h2>
            <p style={styles.subtitle}>Provision secure access to the Forensics Control Center</p>
            {error && <p style={styles.error}>{error}</p>}

            <form style={styles.form} onSubmit={handleSubmit}>
              <div>
                <div style={styles.label}>Full name</div>
                <input style={styles.input} name="name" placeholder="Jane Doe" onChange={handleChange} required />
              </div>
              <div>
                <div style={styles.label}>Email</div>
                <input style={styles.input} name="email" type="email" placeholder="you@example.com" onChange={handleChange} required />
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
              <div>
                <div style={styles.label}>Role</div>
                <select style={styles.select} name="role" onChange={handleChange} required>
                  <option style={styles.option} value="">Select Role</option>
                  <option style={styles.option} value="Administrator">Administrator</option>
                  <option style={styles.option} value="Investigator">Investigator</option>
                  <option style={styles.option} value="Analyst">Analyst</option>
                </select>
              </div>

            {form.role === "Investigator" && (
              <div>
                <div style={styles.label}>Department</div>

                <select
                  style={styles.select}
                  name="department"
                  onChange={handleChange}
                  required
                >
                  <option style={styles.option} value="">
                    Select Department
                  </option>

                  <option style={styles.option} value="Digital Forensics">
                    Digital Forensics
                  </option>

                  <option style={styles.option} value="Biometric Analysis">
                    Biometric Analysis
                  </option>

                  <option style={styles.option} value="Crime Scene Investigation">
                    Crime Scene Investigation
                  </option>

                </select>

              </div>
            )}

            {form.role === "Analyst" && (
              <div>
                <div style={styles.label}>Specialization</div>

                <select
                  style={styles.select}
                  name="specialization"
                  onChange={handleChange}
                  required
                >
                  <option style={styles.option} value="">
                    Select Specialization
                  </option>

                  <option style={styles.option} value="Fingerprint Analysis">
                    Fingerprint Analysis
                  </option>

                  <option style={styles.option} value="Face Recognition">
                    Face Recognition
                  </option>

                  <option style={styles.option} value="Blood Pattern Analysis">
                    Blood Pattern Analysis
                  </option>

                </select>

              </div>
            )}

              <button style={styles.buttonPrimary} type="submit">Sign Up</button>
            </form>

            <div style={{ marginTop: "14px", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "13px" }}>
              <a style={styles.buttonGhost} href={`${API_BASE.replace("/api", "")}/auth/google`}>
                Sign up with Google
              </a>
              <a style={{ color: "#93c5fd", textDecoration: "none" }} href="/login" onClick={(e) => { e.preventDefault(); navigate("/login"); }}>
                Already registered? Login
              </a>
            </div>
          </div>
        </div>
      </div>

      {showPopup && (
        <div style={styles.modalBackdrop} onClick={closePopup}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ marginTop: 0 }}>Your System Generated ID</h3>
            <p style={{ fontSize: "22px", fontWeight: "bold", letterSpacing: "0.05em" }}>{generatedId}</p>
            <p style={{ color: "#9fb1d3" }}>Please save this ID. You’ll need it to login.</p>
            <button style={styles.buttonPrimary} onClick={closePopup}>Got it</button>
          </div>
        </div>
      )}
    </div>
  );
}
