const express = require("express");
const fs = require("fs/promises");
const path = require("path");
const Dataset = require("../models/Dataset");
const { auth, requireRole } = require("../middleware/auth");
const { addLog } = require("../utils/logger");

const router = express.Router();
const FACE_IMAGES_DIR = path.resolve(__dirname, "../../frontend/public/datasets/face-images");
const MAX_FACE_IMAGES = 20;


router.post("/", auth, requireRole("Administrator"), async (req, res) => {
  const { name, description, tags = [] } = req.body;
  if (!name) return res.status(400).json({ error: "Name is required" });
  const dataset = await Dataset.create({ name, description, tags, createdBy: req.user._id });
  await addLog({ actor: req.user._id, action: "dataset_created", entityType: "Dataset", entityId: dataset._id.toString() });
  res.status(201).json(dataset);
});


router.get("/", auth, async (_req, res) => {
  const items = await Dataset.find().sort({ createdAt: -1 });
  res.json(items);
});


router.get("/face-images", auth, async (_req, res) => {
  try {
    const entries = await fs.readdir(FACE_IMAGES_DIR, { withFileTypes: true });
    const imageNames = entries
      .filter((e) => e.isFile())
      .map((e) => e.name)
      .filter((name) => /\.(png|jpe?g|webp|bmp|gif)$/i.test(name))
      .slice(0, MAX_FACE_IMAGES);

    const images = imageNames.map((name) => ({
      name,
      url: `/datasets/face-images/${encodeURIComponent(name)}`,
    }));

    res.json({ count: images.length, images });
  } catch (_err) {
    res.json({ count: 0, images: [] });
  }
});


router.put("/:id", auth, requireRole("Administrator"), async (req, res) => {
  const { name, description, tags = [] } = req.body;
  if (!name) return res.status(400).json({ error: "Name is required" });
  const updated = await Dataset.findByIdAndUpdate(
    req.params.id,
    { name, description, tags },
    { new: true }
  );
  if (!updated) return res.status(404).json({ error: "Dataset not found" });
  await addLog({ actor: req.user._id, action: "dataset_updated", entityType: "Dataset", entityId: req.params.id });
  res.json(updated);
});


router.delete("/:id", auth, requireRole("Administrator"), async (req, res) => {
  await Dataset.findByIdAndDelete(req.params.id);
  await addLog({ actor: req.user._id, action: "dataset_deleted", entityType: "Dataset", entityId: req.params.id });
  res.json({ message: "Deleted" });
});

module.exports = router;
