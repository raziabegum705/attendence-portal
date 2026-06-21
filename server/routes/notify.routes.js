const express = require("express");
const router = express.Router();
const notify = require("../controllers/notify.controller");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/send", authMiddleware, notify.sendNotifications);
router.get("/status/:uploadId", authMiddleware, notify.getStatus);
router.patch("/resend/:studentId", authMiddleware, notify.resendNotification);

module.exports = router;
