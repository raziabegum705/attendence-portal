// const ExcuseLetter = require("../models/ExcuseLetter");

// exports.getAllLetters = async (req, res) => {
//   const letters = await ExcuseLetter.find().sort({ submittedAt: -1 });
//   res.json(letters);
// };

// exports.updateLetterStatus = async (req, res) => {
//   const { status, hodRemarks } = req.body;
//   if (!["approved", "rejected"].includes(status))
//     return res.status(400).json({ message: "Invalid status." });

//   const letter = await ExcuseLetter.findByIdAndUpdate(
//     req.params.id,
//     { status, hodRemarks, hodId: req.user._id },
//     { new: true }
//   );
//   if (!letter) return res.status(404).json({ message: "Letter not found." });
//   res.json({ message: `Letter ${status}.`, letter });
// };

// exports.getStats = async (req, res) => {
//   const total = await ExcuseLetter.countDocuments();
//   const pending = await ExcuseLetter.countDocuments({ status: "pending" });
//   const approved = await ExcuseLetter.countDocuments({ status: "approved" });
//   const rejected = await ExcuseLetter.countDocuments({ status: "rejected" });
//   res.json({ total, pending, approved, rejected });
// };


const ExcuseLetter = require("../models/ExcuseLetter");
const { Resend } = require('resend');
const resend = new Resend(process.env.RESEND_API_KEY);

exports.getAllLetters = async (req, res) => {
  const letters = await ExcuseLetter.find().sort({ submittedAt: -1 });
  res.json(letters);
};

exports.updateLetterStatus = async (req, res) => {
  const { status, hodRemarks } = req.body;
  if (!["approved", "rejected"].includes(status))
    return res.status(400).json({ message: "Invalid status." });

  const letter = await ExcuseLetter.findByIdAndUpdate(
    req.params.id,
    { status, hodRemarks, hodId: req.user._id },
    { new: true }
  );
  if (!letter) return res.status(404).json({ message: "Letter not found." });

  // 📧 Notify student of HOD decision
  try {
    const isApproved = status === "approved";
    await resend.emails.send({
      from: 'Attendance Portal <onboarding@resend.dev>',
      to: letter.studentEmail,
      subject: isApproved
        ? "✅ Excuse Letter Approved — Exam Eligibility Confirmed"
        : "❌ Excuse Letter Rejected — Exam Eligibility Denied",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f7f8fc; padding: 0;">
          <div style="background: ${isApproved ? '#2e7d32' : '#c62828'}; padding: 24px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 22px;">
              ${isApproved ? "Excuse Letter Approved" : "Excuse Letter Rejected"}
            </h1>
          </div>
          <div style="background: white; padding: 32px;">
            <p style="font-size: 16px;">Dear <strong>${letter.studentName}</strong>,</p>
            <p>Your excuse letter for <strong>${letter.subject}</strong> (${letter.semester}) regarding your attendance of <strong>${letter.attendancePercent}%</strong> has been <strong style="color: ${isApproved ? '#2e7d32' : '#c62828'};">${status.toUpperCase()}</strong> by the HOD.</p>
            
            ${isApproved
              ? `<div style="background: #e8f5e9; border: 1px solid #4caf50; border-radius: 8px; padding: 16px; margin: 20px 0;">
                  <p style="margin: 0; color: #2e7d32;">✅ You are <strong>eligible</strong> to sit for the semester examination.</p>
                </div>`
              : `<div style="background: #ffebee; border: 1px solid #f44336; border-radius: 8px; padding: 16px; margin: 20px 0;">
                  <p style="margin: 0; color: #c62828;">❌ You are <strong>not eligible</strong> to sit for the semester examination at this time.</p>
                </div>`
            }

            ${letter.hodRemarks ? `
              <div style="margin-top: 20px;">
                <p style="font-size: 13px; color: #888; margin-bottom: 4px;">HOD Remarks:</p>
                <p style="background: #f5f5f5; padding: 12px; border-radius: 6px; color: #333;">${letter.hodRemarks}</p>
              </div>
            ` : ""}

            <p style="color: #888; font-size: 13px; margin-top: 24px;">If you have questions, please contact your department office directly.</p>
          </div>
          <div style="background: #f7f8fc; padding: 16px; text-align: center; color: #aaa; font-size: 12px;">
            Student Attendance Alert Portal — Automated System
          </div>
        </div>
      `,
    });
    console.log(`📧 Decision email sent to ${letter.studentEmail}: ${status}`);
  } catch (e) {
    console.error("❌ Failed to send decision email:", e.message);
  }

  res.json({ message: `Letter ${status}.`, letter });
};

exports.getStats = async (req, res) => {
  const total = await ExcuseLetter.countDocuments();
  const pending = await ExcuseLetter.countDocuments({ status: "pending" });
  const approved = await ExcuseLetter.countDocuments({ status: "approved" });
  const rejected = await ExcuseLetter.countDocuments({ status: "rejected" });
  res.json({ total, pending, approved, rejected });
};

module.exports = exports;