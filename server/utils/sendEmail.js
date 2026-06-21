const { Resend } = require('resend');
const resend = new Resend(process.env.RESEND_API_KEY);

async function sendAlertEmail(student, uniqueLink) {
  console.log("STUDENT RECEIVED BY EMAIL FUNCTION:");
  console.dir(student, { depth: null });
  console.log("student.email =", student.email);

  try {
    const result = await resend.emails.send({
      from: 'Attendance Portal <onboarding@resend.dev>',
      to: student.email,
      subject: "Attendance Below 75% - Action Required",
      html: `
        <div style="margin:0;padding:0;background:#080b14;">
          <div style="display:none;max-height:0;overflow:hidden;color:transparent;">
            Your attendance requires immediate action. Submit your excuse letter for HOD review.
          </div>
          <div style="max-width:640px;margin:0 auto;padding:28px 14px;font-family:Inter,Segoe UI,Arial,sans-serif;color:#f7f8ff;">
            <div style="border:1px solid rgba(255,255,255,0.14);border-radius:28px;overflow:hidden;background:#101522;box-shadow:0 24px 80px rgba(0,0,0,0.38);">
              <div style="padding:34px 30px;background:linear-gradient(135deg,#7c5cff,#23d3ee);">
                <div style="display:inline-block;padding:7px 11px;border-radius:999px;background:rgba(255,255,255,0.18);font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;">AttendPortal AI</div>
                <h1 style="margin:18px 0 8px;font-size:30px;line-height:1.1;color:#ffffff;">Attendance Action Required</h1>
                <p style="margin:0;color:rgba(255,255,255,0.86);font-size:15px;line-height:1.6;">Your attendance has dropped below the required threshold. Please submit an excuse letter for review.</p>
              </div>
              <div style="padding:30px;background:#101522;">
                <p style="margin:0 0 18px;color:#d9e1f2;font-size:16px;">Dear <strong style="color:#ffffff;">${student.name}</strong>,</p>
                <div style="border:1px solid rgba(255,255,255,0.12);border-radius:22px;background:rgba(255,255,255,0.06);padding:18px;margin-bottom:20px;">
                  <div style="font-size:12px;text-transform:uppercase;letter-spacing:.08em;color:#9aa6bf;font-weight:700;">Student Details</div>
                  <table role="presentation" style="width:100%;border-collapse:collapse;margin-top:12px;color:#d9e1f2;font-size:14px;">
                    <tr><td style="padding:8px 0;color:#9aa6bf;">Subject</td><td style="padding:8px 0;text-align:right;color:#ffffff;font-weight:700;">${student.subject || "Your subject"}</td></tr>
                    <tr><td style="padding:8px 0;color:#9aa6bf;">Attendance</td><td style="padding:8px 0;text-align:right;color:#ff8fa0;font-weight:800;">${student.percentage}%</td></tr>
                    <tr><td style="padding:8px 0;color:#9aa6bf;">Required</td><td style="padding:8px 0;text-align:right;color:#ffffff;font-weight:700;">75%</td></tr>
                  </table>
                  <div style="height:10px;border-radius:999px;background:rgba(255,255,255,0.1);overflow:hidden;margin-top:12px;">
                    <div style="width:${student.percentage}%;height:10px;border-radius:999px;background:linear-gradient(90deg,#ff5277,#ffd166);"></div>
                  </div>
                </div>
                <a href="${uniqueLink}" style="display:block;text-align:center;padding:15px 20px;border-radius:999px;background:linear-gradient(135deg,#7c5cff,#23d3ee);color:#ffffff;text-decoration:none;font-weight:800;font-size:15px;">
                  Submit Excuse Letter
                </a>
                <p style="margin:18px 0 0;color:#9aa6bf;font-size:13px;line-height:1.6;">If the button does not work, copy and open this secure link:<br><span style="color:#c8d2e5;word-break:break-all;">${uniqueLink}</span></p>
              </div>
              <div style="padding:18px 30px;background:#0b0f1d;color:#7f8ba3;font-size:12px;line-height:1.6;">
                This automated alert was sent by Attendance Portal. Please contact your department office if you believe this message was sent in error.
              </div>
            </div>
          </div>
        </div>
      `,
    });

    console.log("Email sent:", result);

    return {
      success: true,
      message: "Email sent successfully",
      result,
    };
  } catch (error) {
    console.log("Email error:", error.message);
    throw error;
  }
}

module.exports = sendAlertEmail;
