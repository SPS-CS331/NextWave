import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API_BASE = "http://localhost:5000/api";

const evidenceTypes = [
  { value: "fingerprint recognition", label: "Fingerprint Recognition" },
  { value: "blood analysis", label: "Blood Analysis" },
  { value: "face recognition", label: "Face Recognition" },
];

export default function Home() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [evidence, setEvidence] = useState([]);
  const [analyses, setAnalyses] = useState([]);
  const [datasets, setDatasets] = useState([]);
  const [reports, setReports] = useState([]);
  const [logs, setLogs] = useState([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [adminDatasetView, setAdminDatasetView] = useState("face");

  // Auth header built once from the token saved by the login page
  const authHeaders = useMemo(() => {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, []);

  // Bootstrap the page: fetch current user and dependent data
  useEffect(() => {
    const bootstrap = async () => {
      try {
        const me = await axios.get(`${API_BASE}/auth/me`, { headers: authHeaders });
        setUser(me.data);
        await Promise.all([
          loadEvidence(),
          loadAnalyses(),
          loadDatasets(),
          loadReports(),
          loadLogs(me.data),
        ]);
      } catch (err) {
        localStorage.removeItem("token");
        navigate("/login");
      }
    };
    bootstrap();
  }, []);

  const loadEvidence = async () => {
    const res = await axios.get(`${API_BASE}/evidence`, { headers: authHeaders });
    setEvidence(res.data);
  };

  const loadAnalyses = async () => {
    const res = await axios.get(`${API_BASE}/evidence/analyses/all`, { headers: authHeaders });
    setAnalyses(res.data);
  };

  const loadDatasets = async () => {
    const res = await axios.get(`${API_BASE}/datasets`, { headers: authHeaders });
    setDatasets(res.data);
  };

  const loadReports = async () => {
    const res = await axios.get(`${API_BASE}/reports`, { headers: authHeaders });
    setReports(res.data);
  };

  const loadLogs = async (meOverride) => {
    const currentUser = meOverride || user;
    if (currentUser?.role !== "Administrator") return;
    const res = await axios.get(`${API_BASE}/logs`, { headers: authHeaders });
    setLogs(res.data);
  };

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const handleCreateEvidence = async (event) => {
    event.preventDefault();
    setMessage("");
    setError("");
    const form = new FormData(event.target);
    const payload = {
      title: form.get("title"),
      description: form.get("description"),
      type: form.get("type"),
      caseId: form.get("caseId"),
    };
    try {
      await axios.post(`${API_BASE}/evidence`, payload, { headers: authHeaders });
      setMessage("Evidence uploaded.");
      event.target.reset();
      await loadEvidence();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to upload evidence");
    }
  };

  const handleStartAnalysis = async (event) => {
    event.preventDefault();
    setMessage("");
    setError("");
    const form = new FormData(event.target);
    const evidenceId = form.get("evidenceId");
    const payload = {
      modelUsed: form.get("modelUsed"),
      assignedTo: form.get("assignedTo") || undefined,
    };
    try {
      await axios.post(`${API_BASE}/evidence/${evidenceId}/analysis`, payload, { headers: authHeaders });
      setMessage("Analysis started.");
      event.target.reset();
      await loadAnalyses();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to start analysis");
    }
  };

  const handleCreateDataset = async (event) => {
    event.preventDefault();
    setMessage("");
    setError("");
    const form = new FormData(event.target);
    const payload = {
      name: form.get("name"),
      description: form.get("description"),
      tags: form
        .get("tags")
        ?.split(",")
        .map((t) => t.trim())
        .filter(Boolean) || [],
    };
    try {
      await axios.post(`${API_BASE}/datasets`, payload, { headers: authHeaders });
      setMessage("Dataset created.");
      event.target.reset();
      await loadDatasets();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to create dataset");
    }
  };

  const handleCreateReport = async (event) => {
    event.preventDefault();
    setMessage("");
    setError("");
    const form = new FormData(event.target);
    const analysisId = form.get("analysisId");
    const payload = {
      summary: form.get("summary"),
      content: form.get("content"),
    };
    try {
      await axios.post(`${API_BASE}/reports/${analysisId}`, payload, { headers: authHeaders });
      setMessage("Report generated.");
      event.target.reset();
      await loadReports();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to create report");
    }
  };

  const handleCustody = async (event, id) => {
    event.preventDefault();
    setMessage("");
    setError("");
    const form = new FormData(event.target);
    const payload = { action: form.get("action"), notes: form.get("notes") };
    try {
      await axios.post(`${API_BASE}/evidence/${id}/custody`, payload, { headers: authHeaders });
      setMessage("Custody trail updated.");
      event.target.reset();
      await loadEvidence();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to add custody event");
    }
  };

  if (!user) return <p style={{ padding: 24 }}>Loading...</p>;

  const isAdmin = user.role === "Administrator";
  const isInvestigator = user.role === "Investigator";
  const isAnalyst = user.role === "Analyst";
  const roleId = user.adminId || user.investigatorId || user.analystId || "-";

  const adminDatasetCards = [
    {
      id: "face",
      title: "View Face Recognition Dataset",
      subtitle: "Show datasets related to face recognition.",
    },
    {
      id: "tempering",
      title: "View Temporing Dataset",
      subtitle: "Show datasets related to tampering detection.",
    },
    {
      id: "all",
      title: "Option Three: View All Datasets",
      subtitle: "Show every available dataset.",
    },
  ];

  const filteredAdminDatasets = datasets.filter((d) => {
    if (adminDatasetView === "all") return true;
    const haystack = `${d.name || ""} ${d.description || ""} ${(d.tags || []).join(" ")}`.toLowerCase();
    if (adminDatasetView === "face") {
      return haystack.includes("face") || haystack.includes("recognition");
    }
    if (adminDatasetView === "tempering") {
      return haystack.includes("temper") || haystack.includes("tamper") || haystack.includes("manipulat");
    }
    return true;
  });

  return (
    <div style={styles.page}>
      <div style={styles.backdrop} />
      <header style={styles.header}>
        <div>
          <div style={styles.badge}>{user.role}</div>
          <h1 style={styles.title}>Forensics Control Center</h1>
          <p style={styles.subtle}>Authenticated as {user.email}</p>
        </div>
        <button style={styles.buttonGhost} onClick={logout}>Logout</button>
      </header>

      <section style={styles.card}>
        <h2>User Details</h2>
        <div style={styles.profileGrid}>
          <div><strong>Name:</strong> {user.name}</div>
          <div><strong>Email:</strong> {user.email}</div>
          <div><strong>Role:</strong> {user.role}</div>
          <div><strong>Role ID:</strong> {roleId}</div>
          {user.department && <div><strong>Department:</strong> {user.department}</div>}
          {user.specialization && <div><strong>Specialization:</strong> {user.specialization}</div>}
        </div>
      </section>

      {message && <p style={styles.toastSuccess}>{message}</p>}
      {error && <p style={styles.toastError}>{error}</p>}

      {isAdmin && (
        <section style={styles.card}>
          <h2>Administrator Dataset Modules</h2>
          <div style={styles.adminCardGrid}>
            {adminDatasetCards.map((card) => (
              <button
                key={card.id}
                type="button"
                style={{
                  ...styles.adminOptionCard,
                  ...(adminDatasetView === card.id ? styles.adminOptionCardActive : {}),
                }}
                onClick={() => setAdminDatasetView(card.id)}
              >
                <strong>{card.title}</strong>
                <span style={styles.adminOptionSubtext}>{card.subtitle}</span>
              </button>
            ))}
          </div>
        </section>
      )}

      {(isInvestigator || isAdmin) && (
        <section style={styles.card}>
          <h2>Upload / Register Evidence</h2>
          <form onSubmit={handleCreateEvidence} style={styles.form}>
            <input style={styles.input} name="title" placeholder="Title" required />
            <input style={styles.input} name="caseId" placeholder="Case ID" />
            <div style={styles.typeGroup}>
              <span style={styles.label}>Evidence Type</span>
              {evidenceTypes.map((t) => (
                <label key={t.value} style={styles.radioLabel}>
                  <input type="radio" name="type" value={t.value} required /> {t.label}
                </label>
              ))}
            </div>
            <textarea style={styles.textarea} name="description" placeholder="Description" />
            <button style={styles.buttonPrimary} type="submit">Save Evidence</button>
          </form>
          <div style={styles.list}>
            {evidence.map((ev) => (
              <div key={ev._id} style={styles.item}>
                <strong>{ev.title}</strong> ({ev.type}) - status: {ev.status}
                <form onSubmit={(e) => handleCustody(e, ev._id)} style={styles.inlineForm}>
                  <input style={styles.input} name="action" placeholder="Custody action" required />
                  <input style={styles.input} name="notes" placeholder="Notes" />
                  <button style={styles.buttonSecondary} type="submit">Add Custody</button>
                </form>
              </div>
            ))}
          </div>
        </section>
      )}

      {(isInvestigator || isAdmin) && (
        <section style={styles.card}>
          <h2>Start Analysis</h2>
          <form onSubmit={handleStartAnalysis} style={styles.form}>
            <select style={styles.select} name="evidenceId" required>
              <option value="">Select evidence</option>
              {evidence.map((ev) => (
                <option key={ev._id} value={ev._id}>
                  {ev.title} ({ev.type})
                </option>
              ))}
            </select>
            <input style={styles.input} name="modelUsed" placeholder="Model / method (optional)" />
            <input style={styles.input} name="assignedTo" placeholder="Assign to analyst userId (optional)" />
            <button style={styles.buttonPrimary} type="submit">Start</button>
          </form>
          <div style={styles.list}>
            {analyses.map((a) => (
              <div key={a._id} style={styles.item}>
                <strong>{a.evidence?.title || a.evidenceId}</strong> - {a.status} | findings: {a.findings || "Pending"}
              </div>
            ))}
          </div>
        </section>
      )}

      {(isAnalyst || isAdmin) && (
        <section style={styles.card}>
          <h2>Generate Forensic Report</h2>
          <form onSubmit={handleCreateReport} style={styles.form}>
            <select style={styles.select} name="analysisId" required>
              <option value="">Select analysis</option>
              {analyses.map((a) => (
                <option key={a._id} value={a._id}>
                  {a.evidence?.title} ({a.status})
                </option>
              ))}
            </select>
            <input style={styles.input} name="summary" placeholder="Summary" />
            <textarea style={styles.textarea} name="content" placeholder="Findings / narrative" required />
            <button style={styles.buttonPrimary} type="submit">Create Report</button>
          </form>
          <div style={styles.list}>
            {reports.map((r) => (
              <div key={r._id} style={styles.item}>
                <strong>{r.evidence?.title || "Report"}</strong> - {r.summary || "No summary"} <br />
                <small>Report ID: {r._id}</small>
              </div>
            ))}
          </div>
        </section>
      )}

      {isAdmin && (
        <section style={styles.card}>
          <h2>
            {adminDatasetView === "face" && "Face Recognition Datasets"}
            {adminDatasetView === "tempering" && "Temporing Datasets"}
            {adminDatasetView === "all" && "All Datasets"}
          </h2>
          <form onSubmit={handleCreateDataset} style={styles.form}>
            <input style={styles.input} name="name" placeholder="Dataset name" required />
            <textarea style={styles.textarea} name="description" placeholder="Description" />
            <input style={styles.input} name="tags" placeholder="Tags (comma separated)" />
            <button style={styles.buttonPrimary} type="submit">Add Dataset</button>
          </form>
          <div style={styles.list}>
            {filteredAdminDatasets.map((d) => (
              <div key={d._id} style={styles.item}>
                <strong>{d.name}</strong> - {d.description}
              </div>
            ))}
            {!filteredAdminDatasets.length && (
              <div style={styles.item}>No datasets found for this option.</div>
            )}
          </div>
        </section>
      )}

      {isAdmin && (
        <section style={styles.card}>
          <h2>Integrity Logs</h2>
          <div style={{ maxHeight: "200px", overflow: "auto" }}>
            {logs.map((log) => (
              <div key={log._id} style={styles.item}>
                [{new Date(log.createdAt).toLocaleString()}] {log.action} ({log.entityType})
              </div>
            ))}
          </div>
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
    gap: "20px",
    padding: "28px",
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
  title: {
    margin: 0,
    fontSize: "28px",
    letterSpacing: "-0.02em",
  },
  subtle: { color: "#9fb1d3", marginTop: "4px" },
  card: {
    border: "1px solid rgba(255,255,255,0.07)",
    borderRadius: "14px",
    padding: "18px",
    background: "rgba(255,255,255,0.04)",
    boxShadow: "0 15px 50px rgba(0,0,0,0.25)",
    backdropFilter: "blur(8px)",
  },
  label: { fontWeight: 600, color: "#dbeafe" },
  input: {
    width: "100%",
    padding: "10px 12px",
    borderRadius: "10px",
    border: "1px solid rgba(255,255,255,0.08)",
    background: "rgba(255,255,255,0.06)",
    color: "#e9eef7",
    outline: "none",
    transition: "border-color 0.2s, transform 0.1s",
  },
  textarea: {
    width: "100%",
    padding: "10px 12px",
    minHeight: "80px",
    borderRadius: "10px",
    border: "1px solid rgba(255,255,255,0.08)",
    background: "rgba(255,255,255,0.06)",
    color: "#e9eef7",
    outline: "none",
    resize: "vertical",
  },
  select: {
    width: "100%",
    padding: "10px 12px",
    borderRadius: "10px",
    border: "1px solid #3b82f6",
    background: "#0f172a",
    color: "#e9eef7",
    outline: "none",
    fontWeight: 600,
    appearance: "none",
    WebkitAppearance: "none",
    MozAppearance: "none",
  },
  form: {
    display: "grid",
    gap: "8px",
    marginBottom: "12px",
  },
  list: {
    display: "grid",
    gap: "8px",
  },
  profileGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "8px",
  },
  adminCardGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "10px",
    marginTop: "8px",
  },
  adminOptionCard: {
    border: "1px solid rgba(255,255,255,0.14)",
    borderRadius: "12px",
    background: "rgba(255,255,255,0.03)",
    color: "#e9eef7",
    textAlign: "left",
    padding: "14px",
    display: "grid",
    gap: "6px",
    cursor: "pointer",
  },
  adminOptionCardActive: {
    border: "1px solid rgba(34,211,238,0.75)",
    boxShadow: "0 8px 24px rgba(34,211,238,0.18)",
    background: "rgba(34,211,238,0.08)",
  },
  adminOptionSubtext: {
    color: "#9fb1d3",
    fontSize: "13px",
  },
  item: {
    padding: "10px",
    border: "1px solid rgba(255,255,255,0.07)",
    borderRadius: "10px",
    background: "rgba(255,255,255,0.03)",
  },
  inlineForm: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr auto",
    gap: "6px",
    marginTop: "6px",
  },
  typeGroup: {
    display: "flex",
    gap: "12px",
    flexWrap: "wrap",
    alignItems: "center",
  },
  radioLabel: {
    display: "flex",
    gap: "6px",
    alignItems: "center",
  },
  buttonPrimary: {
    border: "none",
    padding: "10px 14px",
    borderRadius: "10px",
    background: "linear-gradient(90deg, #3b82f6, #22d3ee)",
    color: "#0b1220",
    fontWeight: 700,
    cursor: "pointer",
    transition: "transform 0.1s ease, box-shadow 0.2s ease",
    boxShadow: "0 10px 25px rgba(59,130,246,0.35)",
  },
  buttonSecondary: {
    border: "1px solid rgba(255,255,255,0.15)",
    padding: "9px 12px",
    borderRadius: "10px",
    background: "rgba(255,255,255,0.05)",
    color: "#e9eef7",
    fontWeight: 600,
    cursor: "pointer",
    transition: "transform 0.1s ease, border-color 0.2s ease",
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
