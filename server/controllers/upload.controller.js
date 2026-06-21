const AttendanceRecord = require("../models/AttendanceRecord");
const parseAttendance = require("../utils/parseExcel");
const fs = require("fs");

// =========================
// 📤 UPLOAD ATTENDANCE
// =========================
exports.uploadAttendance = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded." });
    }

    const { subject, semester } = req.body;

    if (!subject || !semester) {
      return res.status(400).json({
        message: "Subject and semester are required.",
      });
    }

    // ✅ CRITICAL FIX (NO ENOENT EVER)
    const filePath = req.file.path;

    if (!fs.existsSync(filePath)) {
      return res.status(400).json({
        message: "Uploaded file not found on server.",
      });
    }

    const rows = parseAttendance(filePath);

    const defaulters = rows.filter((r) => r.isDefaulter);

    const record = await AttendanceRecord.create({
      uploadedBy: req.user._id,
      subject,
      semester,
      fileUrl: filePath,
      totalStudents: rows.length,
      defaultersCount: defaulters.length,
      defaulters: defaulters.map((d) => ({
        rollNo: d.rollNo,
        name: d.name,
        email: d.email,
        phone: d.phone,
        attended: d.attended,
        total: d.total,
        percentage: d.percentage,
      })),
    });

    res.status(201).json({
      message: `Upload successful. ${defaulters.length} defaulters found.`,
      record,
    });
  } catch (error) {
    console.error("UPLOAD ERROR:", error);
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// =========================
// 📜 HISTORY
// =========================
exports.getHistory = async (req, res) => {
  try {
    const records = await AttendanceRecord.find({
      uploadedBy: req.user._id,
    }).sort({ createdAt: -1 });

    res.json(records);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// =========================
// 🚨 DEFAULTERS
// =========================
exports.getDefaulters = async (req, res) => {
  try {
    const record = await AttendanceRecord.findById(req.params.id);

    if (!record) {
      return res.status(404).json({
        message: "Record not found",
      });
    }

    res.json(record); // ✅ full record
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};