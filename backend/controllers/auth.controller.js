// Auth controller logic
const {registerUser}=require('../services/auth.service');
const sendResponse=require('../utils/response');


const register=async(req,res)=>{
    try{
        const user=await registerUser(req.body);
        sendResponse(
            res,
            201,
            true,
            'User registered successfully',
            user
        )
    }catch(error){
        sendResponse(
            res,
            400,
            false,
            error.message
        );
    }
}

module.exports={
    register,
}