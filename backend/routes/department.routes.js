const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/auth.middleware");
const roleMiddleware = require("../middleware/role.middleware");

const {
    createDepartment,
    getDepartments,
    getDepartmentById,
    updateDepartment,
    deleteDepartment
} = require("../controllers/department.controller");

// Public Routes
router.get("/", getDepartments);
router.get("/:id", getDepartmentById);

// Admin Routes
router.post(
    "/",
    authMiddleware,
    roleMiddleware("admin"),
    createDepartment
);

router.put(
    "/:id",
    authMiddleware,
    roleMiddleware("admin"),
    updateDepartment
);

router.delete(
    "/:id",
    authMiddleware,
    roleMiddleware("admin"),
    deleteDepartment
);

module.exports = router;