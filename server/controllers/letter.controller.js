const { verifyUniqueToken } = require("../utils/generateToken");
const Notification = require("../models/Notification");
const ExcuseLetter = require("../models/ExcuseLetter");

exports.getForm = async (req, res) => {
  const { token } = req.params;
  console.log("🔑 TOKEN RECEIVED:", token);
  console.log("🔑 JWT_SECRET being used:", process.env.JWT_SECRET);
  try {
    const decoded = verifyUniqueToken(token);
    console.log("✅ TOKEN VALID:", decoded);
  } catch (e) {
    console.log("❌ TOKEN VERIFY ERROR:", e.message);
    return res.status(401).json({ message: "This link has expired or is invalid." });
  }
  const notification = await Notification.findOne({ uniqueToken: token });
  if (!notification) return res.status(404).json({ message: "Notification not found." });

  const existingLetter = await ExcuseLetter.findOne({ notificationId: notification._id });
  res.json({ notification, alreadySubmitted: !!existingLetter, existingLetter });
};
exports.submitLetter = async (req, res) => {
  const { token } = req.params;
  try {
    verifyUniqueToken(token);
  } catch {
    return res.status(401).json({ message: "This link has expired or is invalid." });
  }
  const { reason, additionalNote, aiGeneratedDraft } = req.body;
  const notification = await Notification.findOne({ uniqueToken: token });
  if (!notification) return res.status(404).json({ message: "Notification not found." });

  const existing = await ExcuseLetter.findOne({ notificationId: notification._id });
  if (existing) return res.status(400).json({ message: "Letter already submitted." });

  const letter = await ExcuseLetter.create({
    notificationId: notification._id,
    studentName: notification.studentName,
    studentEmail: notification.studentEmail,
    rollNo: notification.rollNo,
    subject: notification.subject,
    semester: notification.semester,
    attendancePercent: notification.attendancePercent,
    reason,
    additionalNote,
    aiGeneratedDraft,
  });

  res.status(201).json({ message: "Excuse letter submitted successfully.", letter });
};