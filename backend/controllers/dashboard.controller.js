const{
    getAdminDashboardService,
    getEmployeeDashboardService,
    getUserDashboardService
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


//employee dash

const getEmployeeDashboard=async(req,res)=>{
    try{
        const dashboard=await getEmployeeDashboardService(req.user.id);

        sendResponse(
            res,
            200,
            true,
            'Employee dashboard fetched successfully',
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


const getUserDashboard=async(req,res)=>{
    try{
        const dashboard=await getUserDashboardService(req.user.id);
                sendResponse(
            res,
            200,
            true,
            'User dashboard fetched successfully',
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
    getAdminDashboard,
    getEmployeeDashboard,
    getUserDashboard
}