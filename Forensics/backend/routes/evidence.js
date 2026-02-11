const express = require("express");
const Evidence = require("../models/Evidence");
const Analysis = require("../models/Analysis");
const { auth, requireRole } = require("../middleware/auth");
const { addLog } = require("../utils/logger");

const router = express.Router();

// Create / upload evidence (Investigator/Admin)
router.post("/", auth, requireRole("Investigator", "Administrator"), async (req, res) => {
  try {
    const { title, description, type, caseId } = req.body;
    if (!title || !type) return res.status(400).json({ error: "Title and type are required." });

    const evidence = await Evidence.create({
      title,
      description,
      type,
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
  const evidence = await Evidence.find(filter).sort({ createdAt: -1 });
  res.json(evidence);
});

// Add chain-of-custody event
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
  const analysis = await Analysis.create({
    evidence: evidence._id,
    startedBy: req.user._id,
    assignedTo,
    modelUsed: modelUsed || "auto-default",
    status: "processing",
    notes: "Auto-started",
  });

  // Simulate immediate completion for demo purposes
  analysis.status = "completed";
  analysis.findings = `Automated findings for ${evidence.title} using ${analysis.modelUsed}`;
  await analysis.save();

  await addLog({
    actor: req.user._id,
    action: "analysis_started",
    entityType: "Analysis",
    entityId: analysis._id.toString(),
    details: { evidence: evidence._id, modelUsed: analysis.modelUsed },
  });

  res.status(201).json(analysis);
});

// List analyses (role scoped)
router.get("/analyses/all", auth, async (req, res) => {
  let filter = {};
  if (req.user.role === "Investigator") {
    filter.startedBy = req.user._id;
  }
  if (req.user.role === "Analyst") {
    filter.$or = [{ assignedTo: req.user._id }, { assignedTo: null }];
  }
  const analyses = await Analysis.find(filter).populate("evidence");
  res.json(analyses);
});

module.exports = router;
