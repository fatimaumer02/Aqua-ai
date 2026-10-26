const express = require("express");
const router = express.Router();
const { signup, signin, me } = require("../controllers/authController");
const { requireAuth } = require("../middleware/auth");

router.post("/signup", signup);
router.post("/signin", signin);
router.get("/me", requireAuth, me);

module.exports = router;
