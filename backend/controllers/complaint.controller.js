// Complaint controller logic



const {
    createComplaintService,
    getMyComplaintsService,
    getComplaintByIdService,
    getAllComplaintsService,
    assignComplaintService,
    getAssignedComplaintsService,
    updateComplaintStatusService
}=require('../services/complaint.service')

const sendResponse=require('../utils/response');

//create complaint

const createComplaint=async (req,res)=>{
    try{
        const imageUrls=req.files?req.files.map(file=>file.path):[];

        const complaint=await createComplaintService(req.body, req.user.id, imageUrls);

        sendResponse(
            res,
            200,
            true,
            'Complaint created successfully',
            complaint
        );
    }catch(error){
        sendResponse(
            res,
            400,
            false,
            error.message
        )
    }
}


const getMyComplaints=async(req,res)=>
{
    try{
        const complaints=await getMyComplaintsService(req.user.id);
        sendResponse(
            res,
            200,
            true,
            'Complaints Fetched succesfully',
            complaints
        )
    }catch(error){
        sendResponse(
            res,
            500,
            false,
            error.message
        )
    }
}

// get complaint by id

const getComplaintById=async(req,res)=>{
    try{
        const complaint=await getComplaintByIdService(req.params.id);

        sendResponse(
            res,
            200,
            true,
            'Complaint fetched successfully',
            complaint
        )
    }catch(error){
        sendResponse(
            res,
            404,
            false,
            error.message
        )
    }
}

//get all complaints

const getAllComplaints=async(req,res)=>{
    try{
        const complaints=await getAllComplaintsService();
        sendResponse(
            res,
            200,
            true,
            'Complaints fetched successfully',
            complaints
        )
    }catch(error){
        sendResponse(
            res,
            500,
            false,
            error.message
        )
    }
}

// assigning complaints

const assignComplaint=async(req,res)=>{
    try{
        const {employeeId}=req.body;

        const complaint=await assignComplaintService(req.params.id,employeeId);

        sendResponse(
            res,
            200,
            true,
            'Complaint assigned successfully',
            complaint
        )
    }catch(error){
        sendResponse(
            res,
            400,
            false,
            error.message
        )
    }
}


// get assigned complaints

const getAssignedComplaints=async(req,res)=>{
    try{
        const complaints=await getAssignedComplaintsService(req.user.id);
        sendResponse(
            res,
            200,
            true,
            'Assigned complaints fetched successfully',
            complaints
        )
    }catch(error){
        sendResponse(
            res,
            500,
            false,
            error.message
        )
    }
}

//updating the status 

const updateComplaintStatus=async(req,res)=>{
    try{
        const{status,employeeRemark}=req.body;
        const complaint=await updateComplaintStatusService(
            req.params.id,
            req.user.id,
            status,
            employeeRemark
        );

        sendResponse(
            res,
            200,
            true,
            'Complaint status updated successfully',
            complaint
        )
    }catch(error){
        sendResponse(
            res,
            400,
            false,
            error.message
        )
    }
}

module.exports={
    createComplaint,
    getMyComplaints,
    getComplaintById,
    getAllComplaints,
    assignComplaint,
    getAssignedComplaints,
    updateComplaintStatus
}