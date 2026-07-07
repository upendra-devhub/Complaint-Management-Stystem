const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/auth.middleware");
const roleMiddleware = require("../middleware/role.middleware");
const {
    getCurrentAdminProfile,
    updateCurrentAdminProfile
} = require("../controllers/admin.controller");

router.get(
    "/me",
    authMiddleware,
    roleMiddleware("admin"),
    getCurrentAdminProfile
);

router.put(
    "/me",
    authMiddleware,
    roleMiddleware("admin"),
    updateCurrentAdminProfile
);

module.exports = router;
