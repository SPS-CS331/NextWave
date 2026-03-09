import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API_BASE = "http://localhost:5000/api";

export default function Dashboard() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [evidence, setEvidence] = useState([]);
  const [analyses, setAnalyses] = useState([]);
  const [datasets, setDatasets] = useState([]);
  const [reports, setReports] = useState([]);
  const [logs, setLogs] = useState([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [activeAdminTab, setActiveAdminTab] = useState("dashboard");
  const [adminDatasetView, setAdminDatasetView] = useState("face");
  const [editingDatasetId, setEditingDatasetId] = useState("");
  const [editDatasetForm, setEditDatasetForm] = useState({
    name: "",
    description: "",
    tags: "",
  });

  const authHeaders = useMemo(() => {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, []);

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
      } catch {
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

  const handleStartAnalysis = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    const form = new FormData(e.target);
    const evidenceId = form.get("evidenceId");

    const payload = {
      modelUsed: form.get("modelUsed"),
      assignedTo: form.get("assignedTo") || undefined,
    };

    try {
      await axios.post(`${API_BASE}/evidence/${evidenceId}/analysis`, payload, { headers: authHeaders });
      setMessage("Analysis started.");
      e.target.reset();
      await loadAnalyses();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to start analysis");
    }
  };

  const handleCreateReport = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    const form = new FormData(e.target);
    const analysisId = form.get("analysisId");

    const payload = {
      summary: form.get("summary"),
      content: form.get("content"),
    };

    try {
      await axios.post(`${API_BASE}/reports/${analysisId}`, payload, { headers: authHeaders });
      setMessage("Report generated.");
      e.target.reset();
      await loadReports();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to create report");
    }
  };

  const handleCreateDataset = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    const form = new FormData(e.target);
    const payload = {
      name: form.get("name"),
      description: form.get("description"),
      tags:
        form
          .get("tags")
          ?.split(",")
          .map((t) => t.trim())
          .filter(Boolean) || [],
    };

    try {
      await axios.post(`${API_BASE}/datasets`, payload, { headers: authHeaders });
      setMessage("Dataset created.");
      e.target.reset();
      await loadDatasets();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to create dataset");
    }
  };

  const handleDeleteDataset = async (datasetId) => {
    setMessage("");
    setError("");
    try {
      await axios.delete(`${API_BASE}/datasets/${datasetId}`, { headers: authHeaders });
      setMessage("Dataset deleted.");
      await loadDatasets();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to delete dataset");
    }
  };

  const beginEditDataset = (dataset) => {
    setEditingDatasetId(dataset._id);
    setEditDatasetForm({
      name: dataset.name || "",
      description: dataset.description || "",
      tags: (dataset.tags || []).join(", "),
    });
  };

  const cancelEditDataset = () => {
    setEditingDatasetId("");
    setEditDatasetForm({ name: "", description: "", tags: "" });
  };

  const handleUpdateDataset = async (e, datasetId) => {
    e.preventDefault();
    setMessage("");
    setError("");

    const payload = {
      name: editDatasetForm.name,
      description: editDatasetForm.description,
      tags: editDatasetForm.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
    };

    try {
      await axios.put(`${API_BASE}/datasets/${datasetId}`, payload, { headers: authHeaders });
      setMessage("Dataset updated.");
      cancelEditDataset();
      await loadDatasets();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to update dataset");
    }
  };

  const triggerCsvDownload = (csvFile) => {
    if (!csvFile) return;
    const link = document.createElement("a");
    link.href = csvFile;
    link.download = "";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!user) return <p style={{ padding: 24 }}>Loading...</p>;

  const role = (user.role || "").toLowerCase();
  const isAdmin = role === "administrator";
  const isInvestigator = role === "investigator";
  const isAnalyst = role === "analyst";
  const roleId = user.adminId || user.investigatorId || user.analystId || "-";

  const showAdminDatasetsTab = isAdmin && activeAdminTab === "viewDatasets";
  const showMainWorkTab = !isAdmin || activeAdminTab === "dashboard";

  const adminDatasetCards = [
    {
      id: "face",
      title: "View Face Recognition Dataset",
      subtitle: "Open face image dataset viewer.",
      href: "/datasets/view?dataset=face",
      csvFile: "",
    },
    {
      id: "tempering",
      title: "View Tampering Dataset",
      subtitle: "Open and download tampering dataset CSV.",
      href: "/datasets/view?dataset=tempering",
      csvFile: "/datasets/forensic-biometric-wearable-dataset.csv",
    },
    {
      id: "all",
      title: "Option Three: View All Datasets",
      subtitle: "Open and download cybercrime dataset CSV.",
      href: "/datasets/view?dataset=all",
      csvFile: "/datasets/cybercrime-forensic-dataset.csv",
    },
  ];

  const filteredAdminDatasets = datasets.filter((d) => {
    if (adminDatasetView === "all") return true;

    const haystack = `${d.name || ""} ${d.description || ""} ${(d.tags || []).join(" ")}`.toLowerCase();

    if (adminDatasetView === "face") {
      return haystack.includes("face") || haystack.includes("recognition");
    }

    if (adminDatasetView === "tempering") {
      return haystack.includes("tamper") || haystack.includes("manipulat");
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

        <div style={{ display: "flex", gap: "10px" }}>
          {isInvestigator && (
            <button style={styles.buttonGhost} onClick={() => navigate("/upload-evidence")}>
              Upload Evidence
            </button>
          )}
          <button style={styles.buttonGhost} onClick={logout}>Logout</button>
        </div>
      </header>

      {isAdmin && (
        <section style={styles.adminTabs}>
          <button
            type="button"
            style={{ ...styles.adminTabButton, ...(activeAdminTab === "dashboard" ? styles.adminTabButtonActive : {}) }}
            onClick={() => setActiveAdminTab("dashboard")}
          >
            Dashboard
          </button>
          <button
            type="button"
            style={{ ...styles.adminTabButton, ...(activeAdminTab === "viewDatasets" ? styles.adminTabButtonActive : {}) }}
            onClick={() => setActiveAdminTab("viewDatasets")}
          >
            View Datasets
          </button>
        </section>
      )}

      <section style={styles.card}>
        <h2>User Details</h2>
        <div style={styles.profileGrid}>
          <div><strong>Name:</strong> {user.name}</div>
          <div><strong>Email:</strong> {user.email}</div>
          <div><strong>Role:</strong> {user.role}</div>
          <div><strong>Role ID:</strong> {roleId}</div>
        </div>
      </section>

      {message && <p style={styles.toastSuccess}>{message}</p>}
      {error && <p style={styles.toastError}>{error}</p>}

      {showAdminDatasetsTab && (
        <section style={styles.card}>
          <h2>Administrator Dataset Modules</h2>

          <div style={styles.adminCardGrid}>
            {adminDatasetCards.map((card) => (
              <div
                key={card.id}
                style={{
                  ...styles.adminOptionCard,
                  ...(adminDatasetView === card.id ? styles.adminOptionCardActive : {}),
                }}
                onClick={() => setAdminDatasetView(card.id)}
              >
                <strong>{card.title}</strong>
                <span style={styles.adminOptionSubtext}>{card.subtitle}</span>
                <a
                  href={card.href}
                  target="_blank"
                  rel="noreferrer"
                  style={styles.cardLink}
                  onClick={(e) => {
                    e.stopPropagation();
                    triggerCsvDownload(card.csvFile);
                  }}
                >
                  Open Dataset
                </a>
              </div>
            ))}
          </div>
        </section>
      )}

      {showMainWorkTab && isInvestigator && (
        <section style={styles.card}>
          <h2>Recent My Evidence</h2>
          <div style={styles.list}>
            {evidence.slice(0, 5).map((ev) => (
              <div key={ev._id} style={styles.item}>
                <strong>{ev.title}</strong> ({ev.type}) - status: {ev.status}
              </div>
            ))}
          </div>
        </section>
      )}

      {showMainWorkTab && (isInvestigator || isAdmin) && (
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
            <input style={styles.input} name="modelUsed" placeholder="Model / method" />
            <input style={styles.input} name="assignedTo" placeholder="Assign analyst userId" />
            <button style={styles.buttonPrimary}>Start</button>
          </form>
        </section>
      )}

      {showMainWorkTab && (isAnalyst || isAdmin) && (
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
            <textarea style={styles.textarea} name="content" required />
            <button style={styles.buttonPrimary}>Create Report</button>
          </form>
        </section>
      )}

      {showAdminDatasetsTab && (
        <section style={styles.card}>
          <h2>
            {adminDatasetView === "face" && "Face Recognition Datasets"}
            {adminDatasetView === "tempering" && "Tampering Datasets"}
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
                {editingDatasetId === d._id ? (
                  <form onSubmit={(e) => handleUpdateDataset(e, d._id)} style={styles.form}>
                    <input
                      style={styles.input}
                      value={editDatasetForm.name}
                      onChange={(e) => setEditDatasetForm((prev) => ({ ...prev, name: e.target.value }))}
                      placeholder="Dataset name"
                      required
                    />
                    <textarea
                      style={styles.textarea}
                      value={editDatasetForm.description}
                      onChange={(e) => setEditDatasetForm((prev) => ({ ...prev, description: e.target.value }))}
                      placeholder="Description"
                    />
                    <input
                      style={styles.input}
                      value={editDatasetForm.tags}
                      onChange={(e) => setEditDatasetForm((prev) => ({ ...prev, tags: e.target.value }))}
                      placeholder="Tags (comma separated)"
                    />
                    <div style={styles.datasetActionRow}>
                      <button style={styles.buttonPrimary} type="submit">Save</button>
                      <button style={styles.buttonSecondary} type="button" onClick={cancelEditDataset}>Cancel</button>
                    </div>
                  </form>
                ) : (
                  <>
                    <strong>{d.name}</strong> - {d.description}
                    <div style={styles.datasetActionRow}>
                      <button style={styles.buttonSecondary} type="button" onClick={() => beginEditDataset(d)}>Edit</button>
                      <button style={styles.deleteButton} type="button" onClick={() => handleDeleteDataset(d._id)}>Delete</button>
                    </div>
                  </>
                )}
              </div>
            ))}

            {!filteredAdminDatasets.length && <div style={styles.item}>No datasets found for this option.</div>}
          </div>
        </section>
      )}

      {showMainWorkTab && isAdmin && (
        <section style={styles.card}>
          <h2>Integrity Logs</h2>
          <div style={{ maxHeight: "200px", overflow: "auto" }}>
            {logs.map((log) => (
              <div key={log._id} style={styles.item}>
                [{new Date(log.createdAt).toLocaleString()}] {log.action}
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
    padding: "28px",
    color: "#e9eef7",
    background: "radial-gradient(circle at 20% 20%, rgba(52, 141, 255, 0.12), transparent 35%), linear-gradient(135deg, #0c111b 0%, #0b1626 45%, #0f1f38 100%)",
  },
  backdrop: { position: "absolute", inset: 0, pointerEvents: "none" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px", flexWrap: "wrap" },
  adminTabs: { display: "flex", gap: "10px" },
  adminTabButton: {
    border: "1px solid rgba(255,255,255,0.18)",
    background: "rgba(255,255,255,0.03)",
    color: "#dbeafe",
    borderRadius: "10px",
    padding: "9px 14px",
    cursor: "pointer",
    fontWeight: 700,
  },
  adminTabButtonActive: {
    border: "1px solid rgba(34,211,238,0.75)",
    background: "rgba(34,211,238,0.12)",
    color: "#ecfeff",
  },
  card: {
    border: "1px solid rgba(255,255,255,0.07)",
    borderRadius: "14px",
    padding: "18px",
    marginTop: "14px",
    background: "rgba(255,255,255,0.04)",
  },
  badge: { padding: "4px 10px", background: "#3b82f6", borderRadius: "999px", width: "fit-content" },
  title: { margin: 0, fontSize: "28px" },
  subtle: { color: "#9fb1d3" },
  profileGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "8px" },
  form: { display: "grid", gap: "8px", marginBottom: "12px" },
  input: {
    padding: "10px",
    borderRadius: "10px",
    border: "1px solid rgba(255,255,255,0.2)",
    background: "rgba(255,255,255,0.05)",
    color: "#e9eef7",
  },
  textarea: {
    padding: "10px",
    borderRadius: "10px",
    border: "1px solid rgba(255,255,255,0.2)",
    background: "rgba(255,255,255,0.05)",
    color: "#e9eef7",
    resize: "vertical",
    minHeight: "80px",
  },
  select: {
    padding: "10px",
    borderRadius: "10px",
    border: "1px solid rgba(255,255,255,0.2)",
    background: "rgba(255,255,255,0.05)",
    color: "#e9eef7",
  },
  buttonPrimary: {
    padding: "10px",
    borderRadius: "10px",
    border: "none",
    background: "linear-gradient(90deg, #3b82f6, #22d3ee)",
    color: "#0b1220",
    fontWeight: 700,
    cursor: "pointer",
  },
  buttonSecondary: {
    padding: "9px",
    borderRadius: "10px",
    border: "1px solid rgba(255,255,255,0.2)",
    background: "rgba(255,255,255,0.05)",
    color: "#e9eef7",
    cursor: "pointer",
  },
  buttonGhost: {
    padding: "9px",
    borderRadius: "10px",
    background: "transparent",
    border: "1px solid rgba(255,255,255,0.2)",
    color: "#e9eef7",
    cursor: "pointer",
  },
  list: { display: "grid", gap: "8px" },
  item: { padding: "10px", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "10px" },
  adminCardGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "10px", marginTop: "8px" },
  adminOptionCard: {
    border: "1px solid rgba(255,255,255,0.14)",
    borderRadius: "12px",
    background: "rgba(255,255,255,0.03)",
    padding: "12px",
    display: "grid",
    gap: "6px",
    cursor: "pointer",
  },
  adminOptionCardActive: {
    border: "1px solid rgba(34,211,238,0.75)",
    background: "rgba(34,211,238,0.08)",
  },
  adminOptionSubtext: { color: "#9fb1d3", fontSize: "13px" },
  cardLink: { color: "#7dd3fc", textDecoration: "none", fontWeight: 600, width: "fit-content" },
  datasetActionRow: { display: "flex", gap: "8px", marginTop: "10px" },
  deleteButton: {
    border: "1px solid rgba(248,113,113,0.45)",
    padding: "9px 12px",
    borderRadius: "10px",
    background: "rgba(248,113,113,0.12)",
    color: "#fecaca",
    fontWeight: 700,
    cursor: "pointer",
  },
  toastSuccess: { color: "#34d399" },
  toastError: { color: "#f87171" },
};
