const express = require("express");
const router = express.Router();

const authMiddleware=require('../middleware/auth.middleware');
const roleMiddleware=require('../middleware/role.middleware');

const {
    createEmployee,
    getEmployees,
    getEmployeeById,
    updateEmployee,
    deleteEmployee
}=require('../controllers/employee.controller');

//admin only
router.post('/',authMiddleware,roleMiddleware('admin'),createEmployee)


router.get('/',authMiddleware,roleMiddleware('admin'),getEmployees);

router.get('/:id',authMiddleware,roleMiddleware('admin'),getEmployeeById);

router.put('/:id',authMiddleware,roleMiddleware('admin'),updateEmployee);

router.delete('/:id',authMiddleware,roleMiddleware('admin'),deleteEmployee);

module.exports = router;
