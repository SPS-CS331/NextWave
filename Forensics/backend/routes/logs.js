const express = require("express");
const Log = require("../models/Log");
const { auth, requireRole } = require("../middleware/auth");

const router = express.Router();

router.get("/", auth, requireRole("Administrator"), async (_req, res) => {
  const logs = await Log.find().sort({ createdAt: -1 }).limit(200);
  res.json(logs);
});

module.exports = router;
