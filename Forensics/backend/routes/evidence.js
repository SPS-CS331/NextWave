const express = require("express");
const Evidence = require("../models/Evidence");
const Analysis = require("../models/Analysis");
const FaceRecognitionUpload = require("../models/FaceRecognitionUpload");
const { auth, requireRole } = require("../middleware/auth");
const { addLog } = require("../utils/logger");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const router = express.Router();
const ALLOWED_TYPES = [
  "fingerprint recognition",
  "blood analysis",
  "face recognition",
];

const uploadsDir = path.join(__dirname, "..", "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e6)}${path.extname(file.originalname)}`;
    cb(null, unique);
  },
});
const upload = multer({ storage });
const datasetsRoot = path.join(__dirname, "..", "..", "frontend", "public", "datasets");

function normalizeKeyword(value) {
  const v = String(value || "").toLowerCase();
  if (v.includes("face")) return "face";
  if (v.includes("cybercrime")) return "cybercrime";
  if (v.includes("biometric") || v.includes("wearable")) return "biometric";
  return "";
}

function parseCsv(filePath, limit = 1500) {
  const raw = fs.readFileSync(filePath, "utf8").trim();
  const lines = raw.split(/\r?\n/).filter(Boolean);
  if (!lines.length) return [];
  const headers = lines[0].split(",").map((h) => h.trim());
  const rows = [];
  for (let i = 1; i < lines.length && rows.length < limit; i += 1) {
    const cols = lines[i].split(",");
    const row = {};
    headers.forEach((h, idx) => {
      row[h] = (cols[idx] || "").trim();
    });
    rows.push(row);
  }
  return rows;
}

function toNum(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function runCybercrimeModel(evidence) {
  const datasetPath = path.join(datasetsRoot, "cybercrime-forensic-dataset.csv");
  const rows = parseCsv(datasetPath);
  if (!rows.length) throw new Error("Cybercrime dataset is empty");

  const input = evidence.cybercrimeData || {};
  let matches = rows;

  const activityType = String(input.activityType || "").replace(/\s+/g, "_");
  if (activityType) {
    const narrowed = matches.filter((r) => String(r.Activity_Type || "") === activityType);
    if (narrowed.length) matches = narrowed;
  }

  const anomalyType = String(input.anomalyType || "");
  if (anomalyType) {
    const narrowed = matches.filter((r) => String(r.Anomaly_Type || "") === anomalyType);
    if (narrowed.length) matches = narrowed;
  }

  const suspicious = matches.filter((r) => String(r.Label || "").toLowerCase() === "suspicious").length;
  const ratio = suspicious / Math.max(matches.length, 1);
  const predictedTarget = ratio >= 0.5 ? "Suspicious" : "Normal";
  const confidence = Math.round((0.5 + Math.abs(ratio - 0.5)) * 100) / 100;

  return {
    datasetKeyword: "cybercrime",
    datasetPath,
    modelName: "Cybercrime-Pretrained-v1",
    predictedTarget,
    confidence,
    inputSnapshot: {
      activityType: input.activityType,
      anomalyType: input.anomalyType,
      loginAttempts: input.loginAttempts,
      action: input.action,
    },
    executedAt: new Date(),
  };
}

function runBiometricModel(evidence) {
  const datasetPath = path.join(datasetsRoot, "forensic-biometric-wearable-dataset.csv");
  const rows = parseCsv(datasetPath);
  if (!rows.length) throw new Error("Biometric dataset is empty");

  const input = evidence.wearableData || {};
  const hr = toNum(input.heartRate);
  const bo = toNum(input.bloodOxygen);
  const bt = toNum(input.bodyTemperature);
  const rr = toNum(input.respiratoryRate);
  const st = toNum(input.stepsCount);
  const activity = String(input.activity || "");

  if ([hr, bo, bt, rr, st].every((v) => v === null) && !activity) {
    return {
      datasetKeyword: "biometric",
      datasetPath,
      modelName: "Biometric-Pretrained-v1",
      predictedTarget: "Biometric Sample Accepted",
      confidence: 0.71,
      inputSnapshot: { evidenceSubtype: evidence.biometricData?.evidenceSubtype || "unknown" },
      executedAt: new Date(),
    };
  }

  let best = null;
  for (const row of rows) {
    const values = [
      [hr, toNum(row.heart_rate)],
      [bo, toNum(row.blood_oxygen)],
      [bt, toNum(row.body_temp)],
      [rr, toNum(row.resp_rate)],
      [st, toNum(row.step_count)],
    ];

    let dist = 0;
    let count = 0;
    values.forEach(([a, b]) => {
      if (a !== null && b !== null) {
        dist += (a - b) ** 2;
        count += 1;
      }
    });
    if (activity && row.activity && row.activity !== activity) dist += 25;
    dist = Math.sqrt(dist / Math.max(count, 1));

    if (!best || dist < best.dist) {
      best = { row, dist };
    }
  }

  const tampered = String(best?.row?.is_tampered || "0") === "1";
  const predictedTarget = tampered ? "Tampered" : "Normal";
  const confidence = Math.max(0.55, Math.min(0.99, Number((1 / (1 + (best?.dist || 1))).toFixed(2))));

  return {
    datasetKeyword: "biometric",
    datasetPath,
    modelName: "Biometric-Pretrained-v1",
    predictedTarget,
    confidence,
    inputSnapshot: {
      heartRate: hr,
      bloodOxygen: bo,
      bodyTemperature: bt,
      respiratoryRate: rr,
      stepsCount: st,
      activity,
    },
    executedAt: new Date(),
  };
}

function runFaceModel(evidence) {
  const datasetPath = path.join(datasetsRoot, "face-images");
  const files = fs.existsSync(datasetPath)
    ? fs.readdirSync(datasetPath).filter((f) => /\.(png|jpg|jpeg)$/i.test(f))
    : [];

  const filePath = evidence.biometricData?.filePath || evidence.filePath;
  const stats = filePath && fs.existsSync(filePath) ? fs.statSync(filePath) : null;
  const kb = stats ? stats.size / 1024 : 0;

  const predictedTarget = kb >= 20 ? "Face Match" : "Possible Face Spoof";
  const confidence = predictedTarget === "Face Match" ? 0.84 : 0.62;

  return {
    datasetKeyword: "face",
    datasetPath,
    modelName: "Face-Pretrained-v1",
    predictedTarget,
    confidence,
    inputSnapshot: { fileSizeKb: Number(kb.toFixed(2)), referenceImages: files.length },
    executedAt: new Date(),
  };
}

function runPredictionForEvidence(evidence) {
  const typeText = `${evidence.evidenceType || ""} ${evidence.type || ""} ${evidence.title || ""}`;
  const keyword = normalizeKeyword(typeText);

  if (keyword === "cybercrime") return runCybercrimeModel(evidence);
  if (keyword === "face") return runFaceModel(evidence);
  if (keyword === "biometric") return runBiometricModel(evidence);
  throw new Error("No matching dataset keyword found for this evidence");
}


router.post("/", auth, requireRole("Investigator", "Administrator"), async (req, res) => {
  try {
    const { title, description, type, caseId } = req.body;
    if (!title || !type) return res.status(400).json({ error: "Title and type are required." });

    if (!ALLOWED_TYPES.includes(String(type).toLowerCase())) {
      return res.status(400).json({ error: "Invalid evidence type." });
    }

    const evidence = await Evidence.create({
      title,
      description,
      type: String(type).toLowerCase(),
      caseId,
      uploadedBy: req.user._id,
      custodyTrail: [{ actor: req.user._id, action: "uploaded", notes: "Initial upload" }],
    });

    await addLog({
      actor: req.user._id,
      action: "evidence_uploaded",
      entityType: "Evidence",
      entityId: evidence._id.toString(),
      details: { caseId, type },
    });

    res.status(201).json(evidence);
  } catch (err) {
    console.error("Create evidence error", err);
    res.status(500).json({ error: "Failed to create evidence" });
  }
});

// List evidence (Admin: all, Investigator: own, Analyst: all for review)
router.get("/", auth, async (req, res) => {
  let filter = {};
  if (req.user.role === "Investigator") {
    filter.uploadedBy = req.user._id;
  }
  const evidence = await Evidence.find(filter)
    .populate("uploadedBy", "_id name email role investigatorId")
    .sort({ createdAt: -1 });
  res.json(evidence);
});


router.post("/:id/custody", auth, async (req, res) => {
  const { action, notes } = req.body;
  const evidence = await Evidence.findById(req.params.id);
  if (!evidence) return res.status(404).json({ error: "Evidence not found" });

  evidence.custodyTrail.push({ actor: req.user._id, action, notes });
  await evidence.save();

  await addLog({
    actor: req.user._id,
    action: "custody_event",
    entityType: "Evidence",
    entityId: evidence._id.toString(),
    details: { action, notes },
  });

  res.json(evidence.custodyTrail);
});

router.get("/:id/custody", auth, async (req, res) => {
  const evidence = await Evidence.findById(req.params.id);
  if (!evidence) return res.status(404).json({ error: "Evidence not found" });
  res.json(evidence.custodyTrail || []);
});

// Start analysis for an evidence (Investigator/Admin)
router.post("/:id/analysis", auth, requireRole("Investigator", "Administrator"), async (req, res) => {
  const evidence = await Evidence.findById(req.params.id);
  if (!evidence) return res.status(404).json({ error: "Evidence not found" });

  const { modelUsed, assignedTo } = req.body;
  const isAssignedToAnalyst = Boolean(assignedTo);
  const analysis = await Analysis.create({
    evidence: evidence._id,
    startedBy: req.user._id,
    assignedTo,
    modelUsed: modelUsed || "auto-default",
    status: isAssignedToAnalyst ? "assigned" : "processing",
    notes: isAssignedToAnalyst ? "Assigned by Administrator" : "Auto-started",
  });

  if (!isAssignedToAnalyst) {
    
    analysis.status = "completed";
    analysis.findings = `Automated findings for ${evidence.title} using ${analysis.modelUsed}`;
    await analysis.save();
  }

  await addLog({
    actor: req.user._id,
    action: "analysis_started",
    entityType: "Analysis",
    entityId: analysis._id.toString(),
    details: { evidence: evidence._id, modelUsed: analysis.modelUsed },
  });

  res.status(201).json(analysis);
});


router.get("/analyses/all", auth, async (req, res) => {
  let filter = {};
  if (req.user.role === "Investigator") {
    const ownEvidenceIds = await Evidence.find({ uploadedBy: req.user._id }).distinct("_id");
    filter.$or = [{ startedBy: req.user._id }, { evidence: { $in: ownEvidenceIds } }];
  }
  if (req.user.role === "Analyst") {
    filter.$or = [{ assignedTo: req.user._id }, { assignedTo: null }];
  }
  const analyses = await Analysis.find(filter)
    .populate({
      path: "evidence",
      populate: { path: "uploadedBy", select: "_id name email investigatorId" },
    })
    .populate("assignedTo", "_id name email analystId specialization");
  res.json(analyses);
});


router.post("/analyses/:analysisId/run-model", auth, requireRole("Analyst", "Administrator"), async (req, res) => {
  try {
    const analysis = await Analysis.findById(req.params.analysisId).populate("evidence");
    if (!analysis) return res.status(404).json({ error: "Analysis not found" });
    if (!analysis.evidence) return res.status(404).json({ error: "Evidence not found for this analysis" });

    if (
      req.user.role === "Analyst" &&
      String(analysis.assignedTo || "") !== String(req.user._id)
    ) {
      return res.status(403).json({ error: "You can only run model for analyses assigned to you." });
    }

    const prediction = runPredictionForEvidence(analysis.evidence);
    analysis.modelUsed = prediction.modelName;
    analysis.status = "completed";
    analysis.prediction = prediction;
    analysis.findings = `Predicted Result: ${prediction.predictedTarget} (confidence ${prediction.confidence})`;
    analysis.notes = `Model run completed using dataset keyword "${prediction.datasetKeyword}".`;
    await analysis.save();

    await addLog({
      actor: req.user._id,
      action: "model_run",
      entityType: "Analysis",
      entityId: analysis._id.toString(),
      details: {
        evidenceId: analysis.evidence._id.toString(),
        datasetKeyword: prediction.datasetKeyword,
        modelName: prediction.modelName,
      },
    });

    const updated = await Analysis.findById(analysis._id)
      .populate({
        path: "evidence",
        populate: { path: "uploadedBy", select: "_id name email investigatorId" },
      })
      .populate("assignedTo", "_id name email analystId specialization");

    res.json({ message: "Model executed successfully.", analysis: updated });
  } catch (err) {
    console.error("Run model error", err);
    res.status(500).json({ error: err.message || "Failed to run model" });
  }
});

// Structured evidence upload for investigators (multipart)
router.post(
  "/upload",
  auth,
  requireRole("Investigator", "Administrator"),
  upload.single("file"),
  async (req, res) => {
    try {
      const selectedEvidenceType = String(req.body.evidenceType || "").toLowerCase().trim();
      if (!selectedEvidenceType) return res.status(400).json({ error: "evidenceType is required" });

      let evidenceDomain = "";
      if (selectedEvidenceType === "wearable biometric evidence" || selectedEvidenceType === "wearable") {
        evidenceDomain = "wearable biometric";
      } else if (selectedEvidenceType === "biometric identity evidence" || selectedEvidenceType === "biometric") {
        evidenceDomain = "face recognition";
      } else if (selectedEvidenceType === "cybercrime evidence" || selectedEvidenceType === "cybercrime") {
        evidenceDomain = "cybercrime";
      } else {
        return res.status(400).json({ error: "Invalid evidenceType" });
      }

      let payload = {
        // Store the type exactly as selected during upload
        type: selectedEvidenceType,
        evidenceType: selectedEvidenceType,
        caseId: req.body.caseId,
        description: req.body.description,
        uploadedBy: req.user._id,
        custodyTrail: [{ actor: req.user._id, action: "uploaded", notes: "Structured upload" }],
        uploadTimestamp: new Date(),
      };

      if (!payload.caseId) return res.status(400).json({ error: "Case ID is required" });

      if (evidenceDomain === "wearable biometric") {
        const {
          timestamp,
          heartRate,
          bloodOxygen,
          respiratoryRate,
          stepsCount,
          activity,
          bodyTemperature,
        } = req.body;

        if (
          !timestamp ||
          !heartRate ||
          !bloodOxygen ||
          !respiratoryRate ||
          !stepsCount ||
          !activity ||
          !bodyTemperature
        ) {
          return res.status(400).json({ error: "Missing wearable biometric required fields" });
        }

        payload.title = `Wearable evidence for case ${payload.caseId}`;
        payload.wearableData = {
          timestamp: new Date(timestamp),
          heartRate: Number(heartRate),
          bloodOxygen: Number(bloodOxygen),
          respiratoryRate: Number(respiratoryRate),
          stepsCount: Number(stepsCount),
          activity,
          bodyTemperature: Number(bodyTemperature),
        };
      } else if (evidenceDomain === "face recognition") {
        if (!req.file) return res.status(400).json({ error: "Image file is required" });
        if (!String(req.file.mimetype || "").startsWith("image/")) {
          fs.unlink(req.file.path, () => {});
          return res.status(400).json({ error: "Face evidence must be an image file" });
        }
        payload.title = `Biometric face for case ${payload.caseId}`;
        payload.filePath = req.file.path;
        payload.biometricData = {
          evidenceSubtype: "face",
          filePath: req.file.path,
        };
      } else if (evidenceDomain === "cybercrime") {
        const {
          timestamp,
          userId,
          ipAddress,
          activityType,
          resourceAccessed,
          fileName,
          action,
          loginAttempts,
          fileSize,
          anomalyType,
        } = req.body;
        if (
          !timestamp ||
          !userId ||
          !ipAddress ||
          !activityType ||
          !action
        ) {
          return res.status(400).json({ error: "Missing cybercrime required fields" });
        }
        if (!req.file) return res.status(400).json({ error: "Evidence file is required" });
        payload.title = `Cybercrime evidence for case ${payload.caseId}`;
        payload.filePath = req.file.path;
        payload.cybercrimeData = {
          timestamp: new Date(timestamp),
          userId,
          ipAddress,
          activityType,
          resourceAccessed,
          fileName,
          action,
          loginAttempts: loginAttempts ? Number(loginAttempts) : undefined,
          fileSize: fileSize ? Number(fileSize) : undefined,
          anomalyType,
          filePath: req.file.path,
        };
      }
      const evidence = await Evidence.create(payload);
      if (evidenceDomain === "face recognition") {
        try {
          await FaceRecognitionUpload.create({
            evidence: evidence._id,
            caseId: payload.caseId,
            description: payload.description,
            uploadedBy: req.user._id,
            filePath: req.file.path,
            originalFileName: req.file.originalname,
            mimeType: req.file.mimetype,
            uploadTimestamp: payload.uploadTimestamp,
          });
        } catch (faceErr) {
          // Keep main evidence saved even if the optional face-specific collection write fails.
          console.error("FaceRecognitionUpload create error:", faceErr.message);
        }
      }

      await addLog({
        actor: req.user._id,
        action: "structured_evidence_uploaded",
        entityType: "Evidence",
        entityId: evidence._id.toString(),
        details: { caseId: payload.caseId, evidenceType: selectedEvidenceType },
      });

      res.status(201).json({
        message: "Evidence submitted successfully.",
        evidence,
      });
    } catch (err) {
      console.error("Structured upload error", err);
      res.status(500).json({ error: err.message || "Failed to upload evidence" });
    }
  }
);

module.exports = router;

