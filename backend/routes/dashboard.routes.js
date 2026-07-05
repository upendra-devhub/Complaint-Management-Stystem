const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/auth.middleware");
const roleMiddleware = require("../middleware/role.middleware");

const {
    getAdminDashboard
} = require("../controllers/dashboard.controller");

router.get(
    "/admin",
    authMiddleware,
    roleMiddleware("admin"),
    getAdminDashboard
);

module.exports = router;