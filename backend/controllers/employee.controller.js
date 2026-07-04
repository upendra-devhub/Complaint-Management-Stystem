// Employee controller logic


const {
    createEmployeeService,
    getAllEmployeesService,
    getEmployeeByIdService,
    updateEmployeeService,
    deleteEmployeeService
}=require('../services/employee.service')

const sendResponse=require('../utils/response')


//create employee

const createEmployee=async(req,res)=>{
    try{
        const employee=await createEmployeeService(req.body);
        sendResponse(
            res,
            201,
            true,
            'Employee created successfully',
            employee
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

//get all employees

const getEmployees=async(req,res)=>{
    try{
        const employees=await getAllEmployeesService();
        sendResponse(
             res,
             200,
             true,
             'Employess fetched successfully',
             employees
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

//getEmployeeById

const getEmployeeById=async(req,res)=>{
    try{
        const employee=await getEmployeeByIdService(req.params.id);

        sendResponse(
            res,
            200,
            true,
            'Employee fetched successfully',
            employee
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


//updateEmployee

const updateEmployee=async(req,res)=>{
    try{
        const employee=await updateEmployeeService(req.params.id,req.body);

        sendResponse(
            res,
            200,
            true,
            'Employee details updated successfully',
            employee
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

//deleteEmployee

const deleteEmployee=async(req,res)=>{
    try{
        await deleteEmployeeService(req.params.id);
        sendResponse(
            res,
            200,
            true,
            'Employee deleted successfully'
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
    createEmployee,
    getEmployees,
    getEmployeeById,
    updateEmployee,
    deleteEmployee
};