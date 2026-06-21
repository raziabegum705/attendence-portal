require("dotenv").config();
require("express-async-errors");
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const path = require("path");

const app = express();

// Connect Database
connectDB();

// Middleware
app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:5173", credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use("/api/auth", require("./routes/auth.routes"));
app.use("/api/upload", require("./routes/upload.routes"));
app.use("/api/notify", require("./routes/notify.routes"));
app.use("/api/letter", require("./routes/letter.routes"));
app.use("/api/hod", require("./routes/hod.routes"));
app.use("/api/ai", require("./routes/ai.routes"));

// Health check
app.get("/", (req, res) => res.json({ message: "Student Attendance Alert Portal API Running ✅" }));

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: err.message || "Internal Server Error" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
