const ExcuseLetter = require("../models/ExcuseLetter");

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
  res.json({ message: `Letter ${status}.`, letter });
};

exports.getStats = async (req, res) => {
  const total = await ExcuseLetter.countDocuments();
  const pending = await ExcuseLetter.countDocuments({ status: "pending" });
  const approved = await ExcuseLetter.countDocuments({ status: "approved" });
  const rejected = await ExcuseLetter.countDocuments({ status: "rejected" });
  res.json({ total, pending, approved, rejected });
};
