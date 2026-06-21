const User = require("../models/User");
const jwt = require("jsonwebtoken");

const generateToken = (user) =>
  jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "7d" });

exports.register = async (req, res) => {
  const { name, email, password, role, department } = req.body;
  const exists = await User.findOne({ email });
  if (exists) return res.status(400).json({ message: "Email already registered." });
  const user = await User.create({ name, email, passwordHash: password, role, department });
  const token = generateToken(user);
  res.status(201).json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role, department: user.department } });
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user || !(await user.comparePassword(password)))
    return res.status(401).json({ message: "Invalid email or password." });
  const token = generateToken(user);
  res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role, department: user.department } });
};

exports.getMe = async (req, res) => {
  res.json(req.user);
};
