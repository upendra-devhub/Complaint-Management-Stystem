const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/auth.middleware");
const roleMiddleware = require("../middleware/role.middleware");

const {
    getAdminDashboard,
    getEmployeeDashboard,
    getUserDashboard
} = require("../controllers/dashboard.controller");

router.get(
    "/admin",
    authMiddleware,
    roleMiddleware("admin"),
    getAdminDashboard
);

router.get(
    "/employee",
    authMiddleware,
    roleMiddleware("employee"),
    getEmployeeDashboard
);

router.get(
    "/user",
    authMiddleware,
    roleMiddleware("user"),
    getUserDashboard
);

module.exports = router;