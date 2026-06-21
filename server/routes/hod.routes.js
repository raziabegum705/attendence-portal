const express = require("express");
const router = express.Router();
const hod = require("../controllers/hod.controller");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

router.use(authMiddleware, roleMiddleware("hod"));

router.get("/letters", hod.getAllLetters);
router.patch("/letters/:id", hod.updateLetterStatus);
router.get("/stats", hod.getStats);

module.exports = router;
