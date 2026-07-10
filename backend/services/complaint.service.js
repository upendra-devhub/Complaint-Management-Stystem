// Complaint service database operations




const Complaint=require('../models/Complaint');
const Department=require('../models/Department');

const User=require('../models/User')
const { emitComplaintChanged } = require("../socket/realtime");

const createComplaintService=async(complaintData,userId,imageUrls=[])=>{

    const{
        title,
        description,
        department,
        location
    }=complaintData;


    const existingDepartment=await Department.findById(department);

    if(!existingDepartment){
        throw new Error('Department not found!!')
    }

    //generating the complaint id

    const year=new Date().getFullYear();
    const totalComplaints=await Complaint.countDocuments();
    const complaintId=`CMP-${year}-${String(totalComplaints+1).padStart(4,"0")}`

    //create Complaint

    const complaint=await Complaint.create({
        complaintId,
        title,
        description,
        department,
        createdBy: userId,
        location,
        images:imageUrls,
        priority:'Medium',
        status:"Pending"
    });

    const populatedComplaint = await complaint.populate([
        {
            path: "department",
            select: "name"
        },
        {
            path: "createdBy",
            select: "name email phone"
        },
        {
            path: "assignedTo",
            select: "name email phone"
        }
    ]);

    emitComplaintChanged("created", populatedComplaint);

    return populatedComplaint;
}

const getMyComplaintsService=async(userId)=>{
    const complaints=await Complaint.find({
        createdBy:userId
    }).populate('department','name').populate('assignedTo','name email').sort({createdAt:-1});
    return complaints;
}

//getComplaintById

const getComplaintByIdService=async(complaintId, user)=>{
    const complaint=await Complaint.findById(complaintId)
    .populate('department','name description')
    .populate('createdBy','name email phone')
    .populate('assignedTo','name email phone');

    if(!complaint){
        const error = new Error("Complaint not found!");
        error.statusCode = 404;
        throw error;
    }

    if (user.role === 'user' && complaint.createdBy._id.toString() !== user.id) {
        const error = new Error("Access denied");
        error.statusCode = 403;
        throw error;
    }

    if (
        user.role === 'employee' &&
        (!complaint.assignedTo || complaint.assignedTo._id.toString() !== user.id)
    ) {
        const error = new Error("Access denied");
        error.statusCode = 403;
        throw error;
    }

    return complaint
}

//get all complaints (admin)

 const getAllComplaintsService=async()=>{
    const complaints=await Complaint.find()
    .populate('department','name')
    .populate('createdBy','name email phone')
    .populate('assignedTo','name email')
    .sort({createdAt:-1});
    return complaints;
 }


 //assigning the complaint to the employee

const assignComplaintService = async (complaintId, employeeId) => {

    // Check Complaint
    const complaint = await Complaint.findById(complaintId);

    if (!complaint) {
        throw new Error("Complaint not found");
    }

    // Check if complaint is already assigned
    if (complaint.assignedTo) {
        throw new Error("Complaint is already assigned.");
    }

    // Complaint must be in Pending state
    if (complaint.status !== "Pending") {
        throw new Error("Only pending complaints can be assigned.");
    }

    // Check Employee
    const employee = await User.findById(employeeId);

    if (!employee) {
        throw new Error("Employee not found");
    }

    // Ensure selected user is an employee
    if (employee.role !== "employee") {
        throw new Error("Selected user is not an employee");
    }

    if (!employee.department) {
        throw new Error("Selected employee is not assigned to any department.");
    }

    // Ensure employee belongs to the same department
    if (employee.department.toString() !== complaint.department.toString()) {
        throw new Error(
            "Employee does not belong to the complaint's department."
        );
    }

    // Assign complaint
    complaint.assignedTo = employeeId;
    complaint.status = "Assigned";
    complaint.assignedAt = new Date();

    await complaint.save();

    const populatedComplaint = await complaint.populate([
        {
            path: "department",
            select: "name"
        },
        {
            path: "createdBy",
            select: "name email"
        },
        {
            path: "assignedTo",
            select: "name email"
        }
    ]);

    emitComplaintChanged("assigned", populatedComplaint);

    return populatedComplaint;
};
 //get assigned complaints

 const getAssignedComplaintsService=async(employeeId)=>{
    const complaints=await Complaint.find({assignedTo:employeeId})
    .populate('department','name')
    .populate('createdBy','name email phone')
    .sort({assignedAt:-1})
    return complaints;
 }

 //update complaint status

const updateComplaintStatusService = async (
    complaintId,
    employeeId,
    status,
    employeeRemark
) => {

    const complaint = await Complaint.findById(complaintId);

    if (!complaint) {
        throw new Error("Complaint not found");
    }

    // Make sure this complaint is assigned to this employee
    if (
        !complaint.assignedTo ||
        complaint.assignedTo.toString() !== employeeId
    ) {
        throw new Error("You are not assigned to this complaint");
    }

    // Only these statuses can be updated by employee
    const allowedStatuses = [
        "In Progress",
        "Resolved"
    ];

    if (!allowedStatuses.includes(status)) {
        throw new Error("Invalid status");
    }


    // Workflow Validation


    // Assigned -> In Progress
    if (
        complaint.status === "Assigned" &&
        status !== "In Progress"
    ) {
        throw new Error(
            "Complaint must first be marked as In Progress."
        );
    }

    // In Progress -> Resolved
    if (
        complaint.status === "In Progress" &&
        status !== "Resolved"
    ) {
        throw new Error(
            "Complaint can only be marked as Resolved."
        );
    }

    // Already Resolved
    if (complaint.status === "Resolved") {
        throw new Error(
            "Complaint has already been resolved."
        );
    }


    // Update Status


    complaint.status = status;

    if (employeeRemark) {
        complaint.employeeRemark = employeeRemark;
    }

    if (status === "In Progress") {
        complaint.inProgressAt = new Date();
    }

    if (status === "Resolved") {
        complaint.resolvedAt = new Date();
    }

    await complaint.save();

    const populatedComplaint = await complaint.populate([
        {
            path: "department",
            select: "name"
        },
        {
            path: "createdBy",
            select: "name email"
        },
        {
            path: "assignedTo",
            select: "name email"
        }
    ]);

    emitComplaintChanged("updated", populatedComplaint);

    return populatedComplaint;
};


module.exports={
    createComplaintService,
    getMyComplaintsService,
    getComplaintByIdService,
    getAllComplaintsService,
    assignComplaintService,
    getAssignedComplaintsService,
    updateComplaintStatusService
}
