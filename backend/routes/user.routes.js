const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/auth.middleware");
const {
    getCurrentUserProfile,
    updateCurrentUserProfile
} = require("../controllers/user.controller");

router.get("/me", authMiddleware, getCurrentUserProfile);
router.put("/me", authMiddleware, updateCurrentUserProfile);

module.exports = router;
