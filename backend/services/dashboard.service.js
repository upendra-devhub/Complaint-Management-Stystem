const Complaint = require("../models/Complaint");
const User = require("../models/User");
const Department = require("../models/Department");



// Admin Dashboard

const getAdminDashboardService = async () => {


    // Dashboard Cards

    const totalComplaints = await Complaint.countDocuments();

    const totalEmployees = await User.countDocuments({
        role: "employee"
    });

    const totalDepartments = await Department.countDocuments();


    // Complaint Status Statistics

    const statusStats = await Complaint.aggregate([
        {
            $group: {
                _id: "$status",
                count: {
                    $sum: 1
                }
            }
        }
    ]);


    // Priority Statistics

    const priorityStats = await Complaint.aggregate([
        {
            $group: {
                _id: "$priority",
                count: {
                    $sum: 1
                }
            }
        }
    ]);


    // Department Statistics

    const departmentStats = await Complaint.aggregate([
        {
            $lookup: {
                from: "departments",
                localField: "department",
                foreignField: "_id",
                as: "department"
            }
        },
        {
            $unwind: "$department"
        },
        {
            $group: {
                _id: "$department.name",
                count: {
                    $sum: 1
                }
            }
        }
    ]);


    // Recent Complaints

    const recentComplaints = await Complaint.find()
        .populate("createdBy", "name")
        .populate("department", "name")
        .sort({ createdAt: -1 })
        .limit(5);


    // Status Chart

    const statusChart = {
        labels: [
            "Pending",
            "Assigned",
            "In Progress",
            "Resolved"
        ],
        data: [0, 0, 0, 0]
    };

    statusStats.forEach((item) => {

        const index = statusChart.labels.indexOf(item._id);

        if (index !== -1) {
            statusChart.data[index] = item.count;
        }

    });


    // Priority Chart

    const priorityChart = {
        labels: [
            "Low",
            "Medium",
            "High"
        ],
        data: [0, 0, 0]
    };

    priorityStats.forEach((item) => {

        const index = priorityChart.labels.indexOf(item._id);

        if (index !== -1) {
            priorityChart.data[index] = item.count;
        }

    });


    // Department Chart

    const departmentChart = {
        labels: [],
        data: []
    };

    departmentStats.forEach((item) => {

        departmentChart.labels.push(item._id);
        departmentChart.data.push(item.count);

    });

    return {

        cards: {
            totalComplaints,
            totalEmployees,
            totalDepartments
        },

        statusChart,

        priorityChart,

        departmentChart,

        recentComplaints

    };

};


//employee dash

const getEmployeeDashboardService=async(employeeId)=>{
    const assigned=await Complaint.countDocuments({
        assignedTo:employeeId
    })

    const inProgress=await Complaint.countDocuments({
        assignedTo:employeeId,
        status:"In Progress"
    })
    const resolved=await Complaint.countDocuments({
        assignedTo:employeeId,
        status:"Resolved"
    })

    const recentComplaints=await Complaint.find({
        assignedTo:employeeId
    })
    .populate('department','name')
    .populate('createdBy','name')
    .sort({assignedAt:-1})
    .limit(5);

    return {
        cards:
        {
            assigned,
            inProgress,
            resolved
        },
        recentComplaints
    }

}

//citizen dash

const getUserDashboardService=async (userId)=>{
    const totalComplaints=await Complaint.countDocuments({
        createdBy:userId
    })

    const pending=await Complaint.countDocuments({
        createdBy:userId,
        status:'Pending'
    })

        const assigned = await Complaint.countDocuments({
        createdBy: userId,
        status: "Assigned"
    });

    const inProgress = await Complaint.countDocuments({
        createdBy: userId,
        status: "In Progress"
    });

    const resolved = await Complaint.countDocuments({
        createdBy: userId,
        status: "Resolved"
    });

    const recentComplaints = await Complaint.find({
        createdBy: userId
    })
    .populate("department","name")
    .sort({ createdAt: -1 })
    .limit(5);

    return {

        cards: {
            totalComplaints,
            pending,
            assigned,
            inProgress,
            resolved
        },

        recentComplaints

    };

};


module.exports = {
    getAdminDashboardService,
    getEmployeeDashboardService,
    getUserDashboardService
};