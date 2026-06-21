const jwt = require("jsonwebtoken");

function generateUniqueToken(studentId, notificationId) {
  return jwt.sign(
    { studentId, notificationId },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
}

function verifyUniqueToken(token) {
  return jwt.verify(token, process.env.JWT_SECRET);
}

module.exports = { generateUniqueToken, verifyUniqueToken };
