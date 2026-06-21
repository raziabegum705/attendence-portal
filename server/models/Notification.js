const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: "Student" },
  attendanceRecordId: { type: mongoose.Schema.Types.ObjectId, ref: "AttendanceRecord" },
  studentName: String,
  studentEmail: String,
  studentPhone: String,
  rollNo: String,
  subject: String,
  semester: String,
  attendancePercent: String,
  emailSent: { type: Boolean, default: false },
  whatsappSent: { type: Boolean, default: false },
  uniqueToken: { type: String, unique: true },
  sentAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Notification", notificationSchema);
