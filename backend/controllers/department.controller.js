const {
    createDepartmentService,
    getAllDepartmentsService,
    getDepartmentByIdService,
    updateDepartmentService,
    deleteDepartmentService
} = require("../services/department.service");

const sendResponse = require("../utils/response");

// ==============================
// Create
// ==============================
const createDepartment = async (req, res) => {
    try {

        const department = await createDepartmentService(req.body);

        sendResponse(
            res,
            201,
            true,
            "Department created successfully",
            department
        );

    } catch (error) {

        sendResponse(
            res,
            400,
            false,
            error.message
        );

    }
};

// ==============================
// Get All
// ==============================
const getDepartments = async (req, res) => {
    try {

        const departments = await getAllDepartmentsService();

        sendResponse(
            res,
            200,
            true,
            "Departments fetched successfully",
            departments
        );

    } catch (error) {

        sendResponse(
            res,
            500,
            false,
            error.message
        );

    }
};

// ==============================
// Get By Id
// ==============================
const getDepartmentById = async (req, res) => {
    try {

        const department = await getDepartmentByIdService(req.params.id);

        sendResponse(
            res,
            200,
            true,
            "Department fetched successfully",
            department
        );

    } catch (error) {

        sendResponse(
            res,
            404,
            false,
            error.message
        );

    }
};

// ==============================
// Update
// ==============================
const updateDepartment = async (req, res) => {
    try {

        const department = await updateDepartmentService(
            req.params.id,
            req.body
        );

        sendResponse(
            res,
            200,
            true,
            "Department updated successfully",
            department
        );

    } catch (error) {

        sendResponse(
            res,
            400,
            false,
            error.message
        );

    }
};

// ==============================
// Delete
// ==============================
const deleteDepartment = async (req, res) => {
    try {

        await deleteDepartmentService(req.params.id);

        sendResponse(
            res,
            200,
            true,
            "Department deleted successfully"
        );

    } catch (error) {

        sendResponse(
            res,
            400,
            false,
            error.message
        );

    }
};

module.exports = {
    createDepartment,
    getDepartments,
    getDepartmentById,
    updateDepartment,
    deleteDepartment
};