// Complaint service database operations




const Complaint=require('../models/Complaint');
const Department=require('../models/Department');

const User=require('../models/User')

const createComplaintService=async(complaintData,userId)=>{

    const{
        title,
        description,
        department,
        location,
        images
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
        images:images||[],
        priority:'Medium',
        status:"Pending"
    });
    return complaint;
}

const getMyComplaintsService=async(userId)=>{
    const complaints=await Complaint.find({
        createdBy:userId
    }).populate('department','name').populate('assignedTo','name email').sort({createdAt:-1});
    return complaints;
}

//getComplaintById

const getComplaintByIdService=async(complaintId)=>{
    const complaint=await Complaint.findById(complaintId)
    .populate('department','name description')
    .populate('createdBy','name email phone')
    .populate('assignedTo','name email phone');

    if(!complaint){
        throw new Error("Complaint not found!")
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

 const assignComplaintService=async(complaintId,employeeId)=>{
    const complaint=await Complaint.findById(complaintId);

    if(!complaint){
        throw new Error("Complaint not found");
    }

    //already assigned?

    if(complaint.status!=='Pending'){
        throw new Error('Complaint is already assigned');
    }

    const employee=await User.findById(employeeId);

    if(!employee){
        throw new Error('Employee not found!');
    }

    if(employee.role!=='employee'){
        throw new Error('Selected user is not an employee');
    }

    complaint.assignedTo=employeeId;
    complaint.status='Assigned';
    complaint.assignedAt=new Date();

    await complaint.save();

    return complaint.populate('assignedTo','name email')
 }

 //get assigned complaints

 const getAssignedComplaintsService=async(employeeId)=>{
    const complaints=await Complaint.find({assignedTo:employeeId})
    .populate('department','name')
    .populate('createdBy','name email phone')
    .sort({assignedAt:-1})
    return complaints;
 }


module.exports={
    createComplaintService,
    getMyComplaintsService,
    getComplaintByIdService,
    getAllComplaintsService,
    assignComplaintService,
    getAssignedComplaintsService
}