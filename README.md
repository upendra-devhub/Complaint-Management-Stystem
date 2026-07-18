# Complaint Management System (CMS)

A comprehensive role-based Complaint Management System designed to bridge the gap between citizens, employees, and administrators. This platform allows citizens to file and track grievances, employees to receive and resolve assigned tasks, and administrators to oversee the entire operation through a dynamic dashboard.

## 🚀 Main Features

### Role-Based Access Control
The platform supports three distinct user roles with tailored interfaces and capabilities:
- **Citizens (Users):** Can register, file new complaints, view their complaint history, and track real-time resolution progress.
- **Employees:** Can view complaints assigned directly to them, update complaint statuses (e.g., In Progress, Resolved), and leave resolution remarks.
- **Administrators:** Can view all complaints across the system, assign complaints to specific employees, manage departments, manage employees, and access system-wide analytics.

### Real-Time Updates
Powered by `Socket.io`, the system pushes real-time notifications and UI updates to clients whenever a complaint's status changes or a new complaint is assigned, eliminating the need for manual page refreshes.

### Dynamic Dashboards & Analytics
Administrators have access to a rich dashboard with interactive charts (using Chart.js) that display insights such as:
- Complaints by status (Pending, Assigned, In Progress, Resolved)
- Complaints distribution by department
- Employee distribution across departments
- Recent complaint activity

### Responsive & Premium UI
Built with vanilla HTML, CSS, and JavaScript, the frontend features a modern, clean, and highly responsive glassmorphism aesthetic with micro-animations and intuitive navigation.

---

## 🛠️ Technology Stack

**Frontend:**
- HTML5, Vanilla CSS3 (Custom Design System, Flexbox/Grid)
- Vanilla JavaScript (ES6+)
- Chart.js (Data Visualization)
- Bootstrap Icons

**Backend:**
- Node.js & Express.js
- MongoDB & Mongoose (Database & ORM)
- Socket.io (Real-time WebSocket communication)
- JSON Web Tokens (JWT) & Bcrypt (Authentication & Security)
- Cloudinary & Multer (Image uploads & storage)

---

## 🔄 User Workflows

### 1. Citizen Workflow
1. **Sign Up / Login:** User creates an account.
2. **File Complaint:** User navigates to "New Complaint," fills in the details (title, description, location), selects a relevant department, and optionally uploads supporting images.
3. **Track Status:** The user's dashboard shows the complaint in a "Pending" state. As the admin assigns it and the employee resolves it, the user sees a visual progress tracker update in real-time.

### 2. Administrator Workflow
1. **Monitor Dashboard:** Admin logs in and views the high-level metrics and recent incoming complaints.
2. **Assign Complaints:** Admin navigates to the Complaints list, reviews "Pending" issues, and assigns them to an appropriate employee based on department.
3. **Manage Organization:** Admin can add new departments or onboard new employees via the Departments and Employees panels.

### 3. Employee Workflow
1. **Receive Assignment:** Employee logs in and sees complaints assigned to them in their queue.
2. **Take Action:** Employee opens a complaint, investigates the issue, and updates the status to "In Progress."
3. **Resolve:** Once fixed, the employee updates the status to "Resolved" and adds a closing remark, which immediately notifies the citizen.

---

## 📡 API Endpoints

The backend exposes a RESTful API under the `/api/v1` prefix.

### Authentication (`/api/v1/auth`)
- `POST /register` - Register a new user
- `POST /login` - Authenticate a user and receive a JWT token
- `GET /me` - Get current logged-in user details

### Complaints (`/api/v1/complaints`)
- `POST /` - Create a new complaint (Citizen)
- `GET /` - Get all complaints (Admin) or user-specific complaints
- `GET /:id` - Get complaint details
- `PUT /:id/assign` - Assign a complaint to an employee (Admin)
- `PUT /:id/status` - Update complaint status (Employee)

### Departments & Employees (`/api/v1/departments`, `/api/v1/employees`)
- `GET /departments` - List all departments
- `POST /departments` - Create a new department (Admin)
- `GET /employees` - List all employees
- `POST /employees` - Onboard a new employee (Admin)

### Dashboard (`/api/v1/dashboard`)
- `GET /admin` - Fetch aggregated analytics for the admin dashboard
- `GET /employee` - Fetch task summaries for the employee dashboard
- `GET /user` - Fetch personal complaint summaries for a citizen

---

## 📂 Project Structure

```text
Complaint-Management-System/
├── backend/
│   ├── config/          # Database configuration
│   ├── controllers/     # Route handlers and business logic
│   ├── middleware/      # Auth guards, error handling, upload handling
│   ├── models/          # Mongoose schemas (User, Complaint, Department)
│   ├── routes/          # Express route definitions
│   ├── socket/          # Socket.io realtime event configurations
│   ├── app.js           # Express application setup
│   └── server.js        # Node.js server entry point
├── frontend/
│   ├── assets/
│   │   ├── css/         # Modular CSS files (global, dashboard, form, table, etc.)
│   │   └── js/          # Frontend logic (api, authGuard, dashboard, profile, realtime)
│   └── pages/           # HTML templates for Admin, Employee, and User views
└── README.md
```

## ⚙️ Setup & Installation

1. **Clone the repository:**
   ```bash
   git clone <repo-url>
   cd Complaint-Management-System
   ```

2. **Backend Setup:**
   ```bash
   cd backend
   npm install
   ```
   Create a `.env` file in the `backend` directory with your environment variables:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   CLOUDINARY_CLOUD_NAME=your_cloudinary_name
   CLOUDINARY_API_KEY=your_cloudinary_key
   CLOUDINARY_API_SECRET=your_cloudinary_secret
   ```
   Start the backend server:
   ```bash
   npm run dev
   ```

3. **Frontend Setup:**
   The frontend is purely static HTML/CSS/JS. You can serve it using any static file server like Live Server (VS Code), Python's `http.server`, or serve.
   ```bash
   cd frontend
   npx serve .
   ```
   By default, the frontend API config points to `http://localhost:5000/api/v1`.
