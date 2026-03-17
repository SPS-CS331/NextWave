const mongoose = require("mongoose");

const logSchema = new mongoose.Schema(
  {
    actor: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    action: String,
    entityType: String,
    entityId: String,
    details: Object,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Log", logSchema);
