const express = require("express");
const router = express.Router();
const letter = require("../controllers/letter.controller");

router.get("/form/:token", letter.getForm);
router.post("/submit/:token", letter.submitLetter);

module.exports = router;
