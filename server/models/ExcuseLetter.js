const mongoose = require("mongoose");

const excuseLetterSchema = new mongoose.Schema({
  notificationId: { type: mongoose.Schema.Types.ObjectId, ref: "Notification", required: true },
  studentName: String,
  studentEmail: String,
  rollNo: String,
  subject: String,
  semester: String,
  attendancePercent: String,
  reason: { type: String, required: true },
  additionalNote: String,
  aiGeneratedDraft: String,
  submittedAt: { type: Date, default: Date.now },
  status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
  hodRemarks: String,
  hodId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
});

module.exports = mongoose.model("ExcuseLetter", excuseLetterSchema);
