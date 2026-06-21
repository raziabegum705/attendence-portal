const mongoose = require("mongoose");

const attendanceRecordSchema = new mongoose.Schema({
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  subject: { type: String, required: true },
  semester: { type: String, required: true },
  uploadedAt: { type: Date, default: Date.now },
  fileUrl: { type: String },
  totalStudents: { type: Number, default: 0 },
  defaultersCount: { type: Number, default: 0 },
  defaulters: [
    {
      rollNo: String,
      name: String,
      email: String,
      phone: String,
      attended: Number,
      total: Number,
      percentage: String,
    },
  ],
});

module.exports = mongoose.model("AttendanceRecord", attendanceRecordSchema);
