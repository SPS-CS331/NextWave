const express = require("express");
const Report = require("../models/Report");
const Analysis = require("../models/Analysis");
const Evidence = require("../models/Evidence");
const { auth, requireRole } = require("../middleware/auth");
const { addLog } = require("../utils/logger");

const router = express.Router();


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


router.get("/", auth, async (req, res) => {
  let filter = {};
  if (req.user.role === "Analyst") {
    filter.createdBy = req.user._id;
  }
  if (req.user.role === "Investigator") {
    const ownEvidenceIds = await Evidence.find({ uploadedBy: req.user._id }).distinct("_id");
    filter.evidence = { $in: ownEvidenceIds };
  }
  const reports = await Report.find(filter).populate("analysis").populate("evidence");
  res.json(reports);
});


router.get("/:reportId/download", auth, async (req, res) => {
  const report = await Report.findById(req.params.reportId).populate("evidence").populate("createdBy");
  if (!report) return res.status(404).json({ error: "Report not found" });

  const canAccess =
    req.user.role === "Administrator" ||
    (req.user.role === "Analyst" && String(report.createdBy?._id || report.createdBy) === String(req.user._id)) ||
    (req.user.role === "Investigator" && String(report.evidence?.uploadedBy || "") === String(req.user._id));

  if (!canAccess) return res.status(403).json({ error: "Forbidden" });

  const text =
    `Report ID: ${report._id}\n` +
    `Evidence ID: ${report.evidence?._id || report.evidence}\n` +
    `Summary: ${report.summary || "N/A"}\n` +
    `Generated: ${new Date(report.createdAt).toLocaleString()}\n\n` +
    `${report.content || "No report content available."}\n`;

  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  res.setHeader("Content-Disposition", `attachment; filename=\"report-${report._id}.txt\"`);
  res.send(text);
});

module.exports = router;
