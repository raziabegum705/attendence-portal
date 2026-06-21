const AttendanceRecord = require("../models/AttendanceRecord");
const Notification = require("../models/Notification");
const sendAlertEmail = require("../utils/sendEmail");
const sendWhatsApp = require("../utils/sendWhatsApp");
const { generateUniqueToken } = require("../utils/generateToken");

function withTimeout(promise, ms, label) {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error(`${label} timeout after ${ms}ms`)), ms)
    ),
  ]);
}

exports.sendNotifications = async (req, res) => {
  try {
    const { uploadId } = req.body;

    const record = await AttendanceRecord.findById(uploadId);
    if (!record)
      return res.status(404).json({ message: "Upload record not found." });

    const results = await Promise.allSettled(
      record.defaulters.map(async (defaulter) => {
        console.log("🔍 DEFAULTER FULL:");
        console.dir(defaulter, { depth: null });
        console.log("📧 EMAIL FIELD =", defaulter.email);

        const attendance = Number(defaulter.percentage);

        const token = generateUniqueToken(
          defaulter.rollNo,
          record._id.toString()
        );

        const uniqueLink = `${process.env.CLIENT_URL}/letter/${token}`;

        const notification = await Notification.create({
          attendanceRecordId: record._id,
          studentName: defaulter.name,
          studentEmail: defaulter.email,
          studentPhone: defaulter.phone,
          rollNo: defaulter.rollNo,
          subject: record.subject,
          semester: record.semester,
          attendancePercent: attendance,
          uniqueToken: token,
        });

        let emailSent = false;
        let whatsappSent = false;

        // 📩 EMAIL (ONLY < 75%)
        if (attendance < 75) {
          try {
            await withTimeout(
              sendAlertEmail(
                { ...defaulter._doc, subject: record.subject },
                uniqueLink
              ),
              10000,
              "Email"
            );

            console.log("📩 Email sent to:", defaulter.email);
            emailSent = true;

            await Notification.findByIdAndUpdate(notification._id, {
              emailSent: true,
            });
          } catch (e) {
            console.error(`❌ Email failed for ${defaulter.email}:`, e.message);
          }
        }

        // 📱 WHATSAPP
        if (defaulter.phone) {
          try {
            await withTimeout(
              sendWhatsApp(
                { ...defaulter, subject: record.subject },
                uniqueLink
              ),
              10000,
              "WhatsApp"
            );

            console.log("📱 WhatsApp sent to:", defaulter.phone);
            whatsappSent = true;

            await Notification.findByIdAndUpdate(notification._id, {
              whatsappSent: true,
            });
          } catch (e) {
            console.error(`❌ WhatsApp failed for ${defaulter.phone}:`, e.message);
          }
        }

        return {
          name: defaulter.name,
          email: defaulter.email,
          emailSent,
          whatsappSent,
        };
      })
    );

    res.json({
      message: "Notifications processed successfully.",
      results: results.map((r) =>
        r.status === "fulfilled" ? r.value : { error: r.reason?.message }
      ),
    });
  } catch (error) {
    console.log("❌ Controller error:", error.message);
    res.status(500).json({ message: error.message });
  }
};

exports.getStatus = async (req, res) => {
  const notifications = await Notification.find({
    attendanceRecordId: req.params.uploadId,
  });
  res.json(notifications);
};

exports.resendNotification = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.studentId);
    if (!notification)
      return res.status(404).json({ message: "Notification not found." });

    const uniqueLink = `${process.env.CLIENT_URL}/letter/${notification.uniqueToken}`;

    await sendAlertEmail(
      {
        name: notification.studentName,
        email: notification.studentEmail,
        percentage: notification.attendancePercent,
        subject: notification.subject,
      },
      uniqueLink
    );

    res.json({ message: "Notification resent." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};