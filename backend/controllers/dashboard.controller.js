const{
    getAdminDashboardService
}=require('../services/dashboard.service');

const sendResponse=require('../utils/response');


// admin dash


const getAdminDashboard=async(req,res)=>{
    try{
        const dashboard=await getAdminDashboardService();
        sendResponse(
            res,
            200,
            true,
            'Dashboard fetched successfully',
            dashboard
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

module.exports={
    getAdminDashboard
}