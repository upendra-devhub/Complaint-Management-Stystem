const Complaint=require('../models/Complaint')
const User=require('../models/User')
const Department=require('../models/Department')

//admin dashboard


const getAdminDashboardService=async ()=>{
    const totalComplaints=await Complaint.countDocuments();

    const totalEmployees=await User.countDocuments({role:'employee'});
    

    const totalDepartments=await Department.countDocuments();

    const statusStats=await Complaint.aggregate([
        {
            $group:{
                _id:'$status',
                count:{
                    $sum:1
                }
            }
        }
    ])

    //priority stats

    const priorityStats=await Complaint.aggregate([
        {
            $group:{
                _id:'$priority',
                count:{
                    $sum:1
                }
            }
        }
    ])

    //department stats

    const departmentStats=await Complaint.aggregate([
        {
            $lookup:{
                from:'departments',
                localField:'department',
                foreignField:"_id",
                as:"department"
            }
        },{
            $unwind:"$department"
        },{
            $group:{
                _id:"$department.name",
                count:{
                    $sum:1
                }
            }
        }
    ])

    return {
        cards:{
            totalComplaints,
            totalEmployees,
            totalDepartments
        },
        statusStats,
        priorityStats,
        departmentStats
    }
}

module.exports={
    getAdminDashboardService
}