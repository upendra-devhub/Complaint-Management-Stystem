const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth.routes");
const departmentRoutes=require('./routes/department.routes')
const employeeRoutes=require('./routes/employee.routes')
const complaintRoutes=require('./routes/complaint.routes')

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/v1/auth", authRoutes);
app.use('/api/v1/departments',departmentRoutes);
app.use('/api/v1/employees',employeeRoutes)
app.use('/api/v1/complaints',complaintRoutes)
module.exports = app;