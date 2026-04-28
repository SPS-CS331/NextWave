const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema(
  {
    analysis: { type: mongoose.Schema.Types.ObjectId, ref: "Analysis", required: true },
    evidence: { type: mongoose.Schema.Types.ObjectId, ref: "Evidence", required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    content: { type: String, required: true },
    summary: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Report", reportSchema);
