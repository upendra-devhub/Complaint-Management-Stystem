// Auth controller logic
const {registerUser,loginUser}=require('../services/auth.service');
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

const login=async (req,res)=>{
    try{
        const {email,password}=req.body;
        const data=await loginUser(email,password);

        sendResponse(
            res,
            200,
            true,
            'Login successful',
            data
        )
    }catch(error){
        sendResponse(
            res,
            401,
            false,
            error.message
        )
    }
}
module.exports={
    register,
    login,
}