const express = require("express");
const Report = require("../models/Report");
const Analysis = require("../models/Analysis");
const Evidence = require("../models/Evidence");
const { auth, requireRole } = require("../middleware/auth");
const { addLog } = require("../utils/logger");

const router = express.Router();

// Generate report from an analysis (Analyst/Admin)
router.post("/:analysisId", auth, requireRole("Analyst", "Administrator"), async (req, res) => {
  const { content, summary } = req.body;
  const analysis = await Analysis.findById(req.params.analysisId);
  if (!analysis) return res.status(404).json({ error: "Analysis not found" });

  const evidence = await Evidence.findById(analysis.evidence);
  if (!evidence) return res.status(404).json({ error: "Evidence not found" });

  const report = await Report.create({
    analysis: analysis._id,
    evidence: evidence._id,
    createdBy: req.user._id,
    content: content || "Report content pending",
    summary,
  });

  await addLog({
    actor: req.user._id,
    action: "report_created",
    entityType: "Report",
    entityId: report._id.toString(),
    details: { analysis: analysis._id },
  });

  res.status(201).json(report);
});

// List reports (Admin all, Analyst their own, Investigator see related evidence)
router.get("/", auth, async (req, res) => {
  let filter = {};
  if (req.user.role === "Analyst") {
    filter.createdBy = req.user._id;
  }
  const reports = await Report.find(filter).populate("analysis").populate("evidence");
  res.json(reports);
});

module.exports = router;
