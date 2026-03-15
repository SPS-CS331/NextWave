import { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API_BASE = "http://localhost:5000/api";

const evidenceOptions = [
  { value: "wearable biometric evidence", label: "Wearable Biometric Evidence" },
  { value: "biometric identity evidence", label: "Biometric Identity Evidence (Face / Fingerprint)" },
  { value: "cybercrime evidence", label: "Cybercrime Evidence" },
];

const activityTypes = ["Walking", "Running", "Sleeping", "Resting"];
const cyberActivityTypes = [
  "Login",
  "File Access",
  "File Modification",
  "File Deletion",
  "Network Traffic",
  "Remote Login",
  "USB Insert",
];
const anomalyTypes = ["Brute_Force", "DDoS_Attempt", "Data_Exfil", "USB_Access", "None"];

export default function UploadEvidence() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [evidenceType, setEvidenceType] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const authHeaders = useMemo(() => {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, []);

  useEffect(() => {
    const bootstrap = async () => {
      try {
        const me = await axios.get(`${API_BASE}/auth/me`, { headers: authHeaders });
        if ((me.data.role || "").toLowerCase() !== "investigator") {
          navigate("/home");
          return;
        }
        setUser(me.data);
      } catch (_err) {
        localStorage.removeItem("token");
        navigate("/login");
      }
    };
    bootstrap();
  
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");
    setError("");
    setSubmitting(true);

    const form = event.target;
    const fd = new FormData(form);
    fd.set("evidenceType", evidenceType);

    try {
      await axios.post(`${API_BASE}/evidence/upload`, fd, {
        headers: { ...authHeaders, "Content-Type": "multipart/form-data" },
      });
      setMessage("Evidence uploaded successfully.");
      form.reset();
      setEvidenceType("");
    } catch (err) {
      setError(err.response?.data?.error || "Failed to upload evidence");
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) return <p style={{ padding: 24 }}>Loading...</p>;

  return (
    <div style={styles.page}>
      <div style={styles.backdrop} />
      <header style={styles.header}>
        <div>
          <div style={styles.badge}>Investigator</div>
          <h1 style={styles.title}>Upload Evidence</h1>
          <p style={styles.subtle}>Structured upload for wearable, biometric, and cybercrime evidence.</p>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <button style={styles.buttonGhost} onClick={() => navigate("/home")}>Back to Dashboard</button>
          <button style={styles.buttonGhost} onClick={() => { localStorage.removeItem("token"); navigate("/login"); }}>Logout</button>
        </div>
      </header>

      {message && <p style={styles.toastSuccess}>{message}</p>}
      {error && <p style={styles.toastError}>{error}</p>}

      <section style={styles.card}>
        <h2>Evidence Type</h2>
        <select
          style={styles.select}
          value={evidenceType}
          onChange={(e) => setEvidenceType(e.target.value)}
          required
        >
          <option value="">Select evidence type</option>
          {evidenceOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </section>

      {evidenceType && (
        <section style={styles.card}>
          <h2>Details</h2>
          <form style={styles.form} onSubmit={handleSubmit}>
            <input style={styles.input} name="caseId" placeholder="Case ID" required />
            <textarea style={styles.textarea} name="description" placeholder="Description" />

            {evidenceType === "wearable biometric evidence" && (
              <>
                <label style={styles.label}>Timestamp</label>
                <input style={styles.input} type="datetime-local" name="timestamp" required />
                <input style={styles.input} name="heartRate" type="number" placeholder="Heart Rate (bpm)" required />
                <input style={styles.input} name="bloodOxygen" type="number" step="0.1" placeholder="Blood Oxygen (%)" required />
                <input style={styles.input} name="bodyTemperature" type="number" step="0.1" placeholder="Body Temperature (�C)" required />
                <input style={styles.input} name="respiratoryRate" type="number" step="0.1" placeholder="Respiratory Rate (breaths/min)" required />
                <input style={styles.input} name="stepsCount" type="number" placeholder="Steps Count" required />
                <label style={styles.label}>Activity</label>
                <select style={styles.select} name="activity" required defaultValue="">
                  <option value="">Select</option>
                  {activityTypes.map((a) => <option key={a} value={a}>{a}</option>)}
                </select>
              </>
            )}

            {evidenceType === "biometric identity evidence" && (
              <>
                <label style={styles.label}>Face Image (PNG)</label>
                <input style={styles.input} type="file" name="file" accept="image/png,image/*" required />
              </>
            )}

            {evidenceType === "cybercrime evidence" && (
              <>
                <label style={styles.label}>Timestamp</label>
                <input style={styles.input} type="datetime-local" name="timestamp" required />
                <input style={styles.input} name="userId" placeholder="User ID" required />
                <input style={styles.input} name="ipAddress" placeholder="IP Address" required />
                <label style={styles.label}>Activity Type</label>
                <select style={styles.select} name="activityType" required defaultValue="">
                  <option value="">Select</option>
                  {cyberActivityTypes.map((a) => <option key={a} value={a}>{a}</option>)}
                </select>
                <input style={styles.input} name="resourceAccessed" placeholder="Resource Accessed" required />
                <input style={styles.input} name="fileName" placeholder="File Name (if applicable)" />
                <input style={styles.input} name="action" placeholder="Action / Outcome" required />
                <input style={styles.input} name="loginAttempts" type="number" placeholder="Login Attempts (if applicable)" />
                <input style={styles.input} name="fileSize" type="number" placeholder="File Size (bytes)" />
                <label style={styles.label}>Anomaly Type</label>
                <select style={styles.select} name="anomalyType" required defaultValue="">
                  <option value="">Select</option>
                  {anomalyTypes.map((a) => <option key={a} value={a}>{a}</option>)}
                </select>
                <label style={styles.label}>Evidence File Upload</label>
                <input style={styles.input} type="file" name="file" required />
              </>
            )}

            <button style={styles.buttonPrimary} type="submit" disabled={submitting}>
              {submitting ? "Uploading..." : "Upload Evidence"}
            </button>
          </form>
        </section>
      )}
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    gap: "16px",
    padding: "24px",
    position: "relative",
    background: "radial-gradient(circle at 20% 20%, rgba(52, 141, 255, 0.12), transparent 35%), radial-gradient(circle at 80% 10%, rgba(111, 66, 193, 0.12), transparent 25%), linear-gradient(135deg, #0c111b 0%, #0b1626 45%, #0f1f38 100%)",
    color: "#e9eef7",
  },
  backdrop: {
    position: "absolute",
    inset: 0,
    background: "linear-gradient(120deg, rgba(255,255,255,0.04), rgba(255,255,255,0))",
    pointerEvents: "none",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    position: "relative",
    zIndex: 1,
  },
  badge: {
    display: "inline-block",
    padding: "4px 10px",
    background: "linear-gradient(90deg, #3b82f6, #22d3ee)",
    color: "#0b1220",
    borderRadius: "999px",
    fontSize: "12px",
    marginBottom: "6px",
    width: "fit-content",
    fontWeight: 700,
  },
  title: { margin: 0, fontSize: "26px", letterSpacing: "-0.02em" },
  subtle: { color: "#9fb1d3", marginTop: "4px" },
  card: {
    border: "1px solid rgba(255,255,255,0.07)",
    borderRadius: "14px",
    padding: "18px",
    background: "rgba(255,255,255,0.04)",
    boxShadow: "0 15px 50px rgba(0,0,0,0.25)",
    backdropFilter: "blur(8px)",
  },
  form: {
    display: "grid",
    gap: "10px",
    marginTop: "12px",
  },
  input: {
    width: "100%",
    padding: "10px 12px",
    borderRadius: "10px",
    border: "1px solid rgba(255,255,255,0.08)",
    background: "rgba(255,255,255,0.06)",
    color: "#e9eef7",
  },
  select: {
    width: "100%",
    padding: "10px 12px",
    borderRadius: "10px",
    border: "1px solid #3b82f6",
    background: "#0f172a",
    color: "#e9eef7",
    fontWeight: 600,
    appearance: "none",
    WebkitAppearance: "none",
    MozAppearance: "none",
  },
  textarea: {
    width: "100%",
    padding: "10px 12px",
    minHeight: "80px",
    borderRadius: "10px",
    border: "1px solid rgba(255,255,255,0.08)",
    background: "rgba(255,255,255,0.06)",
    color: "#e9eef7",
  },
  label: { fontWeight: 600, color: "#dbeafe" },
  row: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "8px",
  },
  buttonPrimary: {
    border: "none",
    padding: "10px 14px",
    borderRadius: "10px",
    background: "linear-gradient(90deg, #3b82f6, #22d3ee)",
    color: "#0b1220",
    fontWeight: 700,
    cursor: "pointer",
    boxShadow: "0 10px 25px rgba(59,130,246,0.35)",
  },
  buttonGhost: {
    border: "1px solid rgba(255,255,255,0.2)",
    padding: "9px 12px",
    borderRadius: "10px",
    background: "transparent",
    color: "#e9eef7",
    cursor: "pointer",
    fontWeight: 600,
  },
  toastSuccess: {
    color: "#34d399",
    background: "rgba(52, 211, 153, 0.08)",
    border: "1px solid rgba(52, 211, 153, 0.3)",
    padding: "8px 12px",
    borderRadius: "10px",
  },
  toastError: {
    color: "#f87171",
    background: "rgba(248, 113, 113, 0.08)",
    border: "1px solid rgba(248, 113, 113, 0.3)",
    padding: "8px 12px",
    borderRadius: "10px",
  },
};

