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
    evidenceId: { type: String, unique: true },
    title: { type: String, required: true },
    description: String,
    type: { type: String, required: true }, // evidence type/category
    evidenceType: { type: String, required: true }, // wearable | biometric | cybercrime
    caseId: { type: String, required: true },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    uploadTimestamp: { type: Date, default: Date.now },
    status: { type: String, default: "uploaded" },
    custodyTrail: [custodyEventSchema],
    wearableData: {
      timestamp: Date,
      heartRate: Number,
      bloodOxygen: Number,
      bodyTemperature: Number,
      respiratoryRate: Number,
      stepsCount: Number,
      activity: String,
    },
    biometricData: {
      evidenceSubtype: String, // face
      filePath: String,
    },
    cybercrimeData: {
      timestamp: Date,
      userId: String,
      ipAddress: String,
      activityType: String,
      resourceAccessed: String,
      fileName: String,
      action: String,
      loginAttempts: Number,
      fileSize: Number,
      anomalyType: String,
      filePath: String,
    },
    filePath: String, // general reference for uploaded files
  },
  { timestamps: true }
);

evidenceSchema.pre("save", function setEvidenceId() {
  if (!this.evidenceId) {
    this.evidenceId = this._id.toString();
  }
});

module.exports = mongoose.model("Evidence", evidenceSchema);
