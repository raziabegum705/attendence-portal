const { GoogleGenerativeAI } = require("@google/generative-ai");
const { verifyUniqueToken } = require("../utils/generateToken");
const Notification = require("../models/Notification");

exports.generateDraft = async (req, res) => {
  const { token } = req.params;

  try {
    verifyUniqueToken(token);
  } catch {
    return res.status(401).json({
      message: "Invalid or expired token."
    });
  }

  const notification = await Notification.findOne({
    uniqueToken: token
  });

  if (!notification) {
    return res.status(404).json({
      message: "Notification not found."
    });
  }

  const { reason } = req.body;

  if (!reason) {
    return res.status(400).json({
      message: "Reason is required for AI draft."
    });
  }

  try {
    const genAI = new GoogleGenerativeAI(
      process.env.GEMINI_API_KEY
    );

    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash"
    });

    const prompt = `
Write a formal excuse letter to the HOD on behalf of student ${notification.studentName}
(Roll No: ${notification.rollNo})
whose attendance in ${notification.subject}
(Semester ${notification.semester})
is ${notification.attendancePercent}%.

The student's reason is:
"${reason}"

Keep it polite, professional and under 150 words.
Start with "Respected HOD,"
and end with "Yours sincerely,"
followed by the student's name.
`;

    const result = await model.generateContent(prompt);

    return res.json({
      draft: result.response.text()
    });

  } catch (err) {

    console.error("Gemini error:", err.message);

    const draft = `
Respected HOD,

I am ${notification.studentName} (Roll No: ${notification.rollNo}) studying in Semester ${notification.semester}. My attendance in ${notification.subject} has fallen to ${notification.attendancePercent}% due to the reason mentioned above.

I sincerely apologize for the shortage in attendance and request you to kindly consider my situation. I assure you that I will improve my attendance and academic performance in the coming weeks.

I request you to accept my explanation and grant me permission to continue attending classes.

Yours sincerely,
${notification.studentName}
Roll No: ${notification.rollNo}
`;

    return res.json({ draft });
  }
};

exports.getHODInsights = async (req, res) => {
  try {
    const ExcuseLetter = require("../models/ExcuseLetter");

    const letters = await ExcuseLetter.find();

    console.log("ALL LETTERS:");

    letters.forEach(letter => {
      console.log(
        letter.studentName,
        "| Status =",
        letter.status
      );
    });

    if (letters.length === 0) {
      return res.json({
        insights: "No attendance data available."
      });
    }

    const total = letters.length;

    const approved = letters.filter(
      l => l.status?.toLowerCase() === "approved"
    ).length;

    const pending = letters.filter(
      l => l.status?.toLowerCase() === "pending"
    ).length;

    const rejected = letters.filter(
      l => l.status?.toLowerCase() === "rejected"
    ).length;

    const avgAttendance = (
      letters.reduce(
        (sum, l) =>
          sum + Number(l.attendancePercent || 0),
        0
      ) / total
    ).toFixed(2);

    const insights = `
📊 Attendance Analytics Report

• Total excuse letters submitted: ${total}
• Approved requests: ${approved}
• Pending requests: ${pending}
• Rejected requests: ${rejected}
• Average attendance of defaulters: ${avgAttendance}%

Recommendation:
Students with attendance below 75% should be monitored closely and encouraged to submit valid explanations on time.
`;

    return res.json({ insights });

  } catch (err) {

    console.error("Insights Error:", err);

    return res.status(500).json({
      message: "Failed to load AI insights."
    });
  }
};