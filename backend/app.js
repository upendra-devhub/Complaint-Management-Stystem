const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth.routes");
const departmentRoutes=require('./routes/department.routes')
const employeeRoutes=require('./routes/employee.routes')
const complaintRoutes=require('./routes/complaint.routes')
const dashboardRoutes=require('./routes/dashboard.routes')
const userRoutes = require("./routes/user.routes");
const adminRoutes = require("./routes/admin.routes");
const errorMiddleware = require("./middleware/error.middleware");

const app = express();

app.use(cors({
  origin: [
    "http://localhost:5500",
    "http://127.0.0.1:5500",
    "https://complaint-management-stystem.vercel.app"
  ],
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Complaint Management System API is running 🚀"
  });
});

app.use("/api/v1/auth", authRoutes);
app.use('/api/v1/departments',departmentRoutes);
app.use('/api/v1/employees',employeeRoutes)
app.use('/api/v1/complaints',complaintRoutes)
app.use('/api/v1/dashboard',dashboardRoutes)
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/admin", adminRoutes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found"
  });
});

app.use(errorMiddleware);

module.exports = app;
