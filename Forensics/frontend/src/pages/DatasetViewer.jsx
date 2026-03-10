import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

const API_BASE = "http://localhost:5000/api";
const MAX_CSV_ROWS = 100;
const MAX_FACE_IMAGES = 20;

const DATASET_MAP = {
  face: {
    title: "Face Recognition Dataset",
    type: "images",
  },
  tempering: {
    title: "Temporing Dataset",
    type: "csv",
    file: "/datasets/forensic-biometric-wearable-dataset.csv",
  },
  all: {
    title: "All Datasets (Cybercrime)",
    type: "csv",
    file: "/datasets/cybercrime-forensic-dataset.csv",
  },
};

function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    const next = text[i + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        field += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === "," && !inQuotes) {
      row.push(field);
      field = "";
      continue;
    }

    if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && next === "\n") i += 1;
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
      continue;
    }

    field += char;
  }

  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  return rows;
}

export default function DatasetViewer() {
  const [searchParams] = useSearchParams();
  const datasetKey = searchParams.get("dataset") || "";
  const dataset = DATASET_MAP[datasetKey];
  const [rows, setRows] = useState([]);
  const [faceImages, setFaceImages] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDataset = async () => {
      setLoading(true);
      setError("");
      setRows([]);
      setFaceImages([]);
      if (!dataset) {
        setError("Invalid dataset option.");
        setLoading(false);
        return;
      }
      try {
        if (dataset.type === "images") {
          const token = localStorage.getItem("token");
          const res = await fetch(`${API_BASE}/datasets/face-images`, {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          });
          if (!res.ok) throw new Error("failed to load face images");
          const payload = await res.json();
          setFaceImages((payload.images || []).slice(0, MAX_FACE_IMAGES));
          return;
        }

        const res = await fetch(dataset.file);
        if (!res.ok) throw new Error("file not found");
        const csvText = await res.text();
        const parsed = parseCsv(csvText);
        // Keep header + first 100 data rows only.
        const limited = parsed.length > 1 ? [parsed[0], ...parsed.slice(1, MAX_CSV_ROWS + 1)] : parsed;
        setRows(limited);
      } catch (_err) {
        if (dataset.type === "images") {
          setError("Unable to load face image gallery.");
        } else {
          setError(`Unable to load CSV file: ${dataset.file}`);
        }
      } finally {
        setLoading(false);
      }
    };
    loadDataset();
  }, [dataset]);

  const headers = useMemo(() => (rows.length ? rows[0] : []), [rows]);
  const dataRows = useMemo(() => (rows.length > 1 ? rows.slice(1) : []), [rows]);

  return (
    <div style={styles.page}>
      <div style={styles.topRow}>
        <h1 style={styles.title}>{dataset?.title || "Dataset Viewer"}</h1>
        <Link to="/home" style={styles.backLink}>Back to Home</Link>
      </div>

      {loading && <p>{dataset?.type === "images" ? "Loading images..." : "Loading CSV..."}</p>}
      {error && <p style={styles.error}>{error}</p>}

      {!loading && !error && dataset?.type === "images" && faceImages.length === 0 && (
        <p>No images found. Add photos to `frontend/public/datasets/face-images`.</p>
      )}

      {!loading && !error && dataset?.type === "images" && faceImages.length > 0 && (
        <div style={styles.galleryGrid}>
          {faceImages.map((img) => (
            <div key={img.name} style={styles.imageCard}>
              <img src={img.url} alt={img.name} style={styles.image} />
              <div style={styles.imageCaption} title={img.name}>{img.name}</div>
            </div>
          ))}
        </div>
      )}

      {!loading && !error && dataset?.type === "csv" && rows.length === 0 && <p>No data found in CSV.</p>}

      {!loading && !error && dataset?.type === "csv" && rows.length > 0 && (
        <div style={styles.tableWrap}>
          <table style={styles.table}>
            <thead>
              <tr>
                {headers.map((h, idx) => (
                  <th key={`${h}-${idx}`} style={styles.th}>{h || `Column ${idx + 1}`}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {dataRows.map((r, rowIdx) => (
                <tr key={`row-${rowIdx}`}>
                  {headers.map((_h, colIdx) => (
                    <td key={`cell-${rowIdx}-${colIdx}`} style={styles.td}>
                      {r[colIdx] || ""}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    padding: "20px",
    background: "#0f172a",
    color: "#e5e7eb",
  },
  topRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "16px",
  },
  title: {
    margin: 0,
    fontSize: "24px",
  },
  backLink: {
    color: "#7dd3fc",
    textDecoration: "none",
    fontWeight: 700,
  },
  error: {
    color: "#fecaca",
    background: "rgba(248,113,113,0.12)",
    border: "1px solid rgba(248,113,113,0.35)",
    padding: "10px",
    borderRadius: "8px",
  },
  tableWrap: {
    overflow: "auto",
    border: "1px solid rgba(255,255,255,0.15)",
    borderRadius: "10px",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    background: "rgba(255,255,255,0.03)",
  },
  th: {
    textAlign: "left",
    padding: "10px",
    borderBottom: "1px solid rgba(255,255,255,0.2)",
    position: "sticky",
    top: 0,
    background: "#0b1220",
  },
  td: {
    padding: "8px 10px",
    borderBottom: "1px solid rgba(255,255,255,0.08)",
    whiteSpace: "nowrap",
  },
  galleryGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(200px, 200px))",
    gap: "12px",
  },
  imageCard: {
    border: "1px solid rgba(255,255,255,0.15)",
    borderRadius: "10px",
    overflow: "hidden",
    background: "rgba(255,255,255,0.03)",
  },
  image: {
    width: "200px",
    height: "200px",
    objectFit: "cover",
    display: "block",
  },
  imageCaption: {
    padding: "8px",
    fontSize: "12px",
    color: "#cbd5e1",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
};
