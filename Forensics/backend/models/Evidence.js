const mongoose = require("mongoose");

const custodyEventSchema = new mongoose.Schema(
  {
    actor: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    action: String,
    notes: String,
    timestamp: { type: Date, default: Date.now },
  },
  { _id: false }
);

const evidenceSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: String,
    type: { type: String, required: true }, // e.g., "image", "video", "disk", etc.
    caseId: String,
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    status: { type: String, default: "uploaded" },
    custodyTrail: [custodyEventSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Evidence", evidenceSchema);
