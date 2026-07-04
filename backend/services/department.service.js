const Department = require("../models/Department");

//createDepartment

const createDepartmentService = async (departmentData) => {
    const { name, description } = departmentData;

    const existingDepartment = await Department.findOne({
        name: name.trim()
    });

    if (existingDepartment) {
        throw new Error("Department with this name already exists");
    }

    const department = await Department.create({
        name: name.trim(),
        description
    });

    return department;
};


// Get All Departments

const getAllDepartmentsService = async () => {
    const departments = await Department
        .find()
        .sort({ createdAt: -1 });

    return departments;
};


// Get Department By Id

const getDepartmentByIdService = async (id) => {

    const department = await Department.findById(id);

    if (!department) {
        throw new Error("Department not found");
    }

    return department;
};


// Update Department

const updateDepartmentService = async (id, departmentData) => {

    const department = await Department.findById(id);

    if (!department) {
        throw new Error("Department not found");
    }

    department.name = departmentData.name || department.name;
    department.description =
        departmentData.description || department.description;

    await department.save();

    return department;
};


// Delete Department

const deleteDepartmentService = async (id) => {

    const department = await Department.findById(id);

    if (!department) {
        throw new Error("Department not found");
    }

    await department.deleteOne();

    return;
};

module.exports = {
    createDepartmentService,
    getAllDepartmentsService,
    getDepartmentByIdService,
    updateDepartmentService,
    deleteDepartmentService
};