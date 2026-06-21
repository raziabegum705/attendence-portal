const express = require("express");
const router = express.Router();
const ai = require("../controllers/ai.controller");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

router.post("/draft/:token", ai.generateDraft);
router.get("/insights", authMiddleware, roleMiddleware("hod"), ai.getHODInsights);

module.exports = router;
