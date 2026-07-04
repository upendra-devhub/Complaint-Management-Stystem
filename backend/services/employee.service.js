const User = require("../models/User");
const Department = require("../models/Department");
const bcrypt = require("bcrypt");

// ==============================
// Create Employee
// ==============================
const createEmployeeService = async (employeeData) => {
    const {
        name,
        email,
        password,
        phone,
        address,
        department
    } = employeeData;

    // Check if email already exists
    const existingUser = await User.findOne({ email });

    if (existingUser) {
        throw new Error("Employee with this email already exists");
    }

    // Check if department exists
    const existingDepartment = await Department.findById(department);

    if (!existingDepartment) {
        throw new Error("Department not found");
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create employee
    const employee = await User.create({
        name,
        email,
        password: hashedPassword,
        phone,
        address,
        role: "employee",
        department
    });

    employee.password = undefined;

    return employee;
};

// ==============================
// Get All Employees
// ==============================
const getAllEmployeesService = async () => {

    const employees = await User.find({
        role: "employee"
    })
    .populate("department", "name")
    .sort({ createdAt: -1 });

    return employees;
};

// ==============================
// Get Employee By Id
// ==============================
const getEmployeeByIdService = async (id) => {

    const employee = await User.findOne({
        _id: id,
        role: "employee"
    }).populate("department", "name");

    if (!employee) {
        throw new Error("Employee not found");
    }

    return employee;
};

// ==============================
// Update Employee
// ==============================
const updateEmployeeService = async (id, employeeData) => {

    const employee = await User.findOne({
        _id: id,
        role: "employee"
    });

    if (!employee) {
        throw new Error("Employee not found");
    }

    if (employeeData.department) {

        const department = await Department.findById(employeeData.department);

        if (!department) {
            throw new Error("Department not found");
        }

        employee.department = employeeData.department;
    }

    employee.name = employeeData.name || employee.name;
    employee.email = employeeData.email || employee.email;
    employee.phone = employeeData.phone || employee.phone;
    employee.address = employeeData.address || employee.address;

    await employee.save();

    return employee;
};

// ==============================
// Delete Employee
// ==============================
const deleteEmployeeService = async (id) => {

    const employee = await User.findOne({
        _id: id,
        role: "employee"
    });

    if (!employee) {
        throw new Error("Employee not found");
    }

    await employee.deleteOne();

    return;
};

module.exports = {
    createEmployeeService,
    getAllEmployeesService,
    getEmployeeByIdService,
    updateEmployeeService,
    deleteEmployeeService
};