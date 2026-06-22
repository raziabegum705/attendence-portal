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