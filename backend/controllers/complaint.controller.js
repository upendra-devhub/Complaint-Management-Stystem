// Complaint controller logic



const {
    createComplaintService,
    getMyComplaintsService,
    getComplaintByIdService
}=require('../services/complaint.service')

const sendResponse=require('../utils/response');

//create complaint

const createComplaint=async (req,res)=>{
    try{
        const complaint=await createComplaintService(req.body, req.user.id);

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
module.exports={
    createComplaint,
    getMyComplaints,
    getComplaintById
}