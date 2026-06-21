const twilio = require("twilio");

async function sendWhatsApp(student, uniqueLink) {
  const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
  const message = `⚠️ *Attendance Alert*\n\nDear *${student.name}*,\n\nYour attendance is *${student.percentage}%* which is below 75%.\n\nSubject: ${student.subject || "N/A"}\n\nPlease submit your excuse letter:\n${uniqueLink}\n\n_This link expires in 7 days._`;

  await client.messages.create({
    from: process.env.TWILIO_WHATSAPP_FROM,
    to: `whatsapp:+91${student.phone}`,
    body: message,
  });
}

module.exports = sendWhatsApp;
