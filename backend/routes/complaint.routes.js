const express = require("express");
const router = express.Router();

const authMiddleware=require('../middleware/auth.middleware');
const roleMiddleware=require('../middleware/role.middleware')

const { 
    createComplaint,
    getMyComplaints,
    getComplaintById,
    getAllComplaints,
    assignComplaint,
    getAssignedComplaints
 }=require('../controllers/complaint.controller');


router.post(
    '/',authMiddleware,createComplaint
)

router.get('/my',authMiddleware,getMyComplaints)

router.get('/assigned',authMiddleware,roleMiddleware('employee'),getAssignedComplaints)

router.get('/:id',authMiddleware,getComplaintById)

router.get('/',authMiddleware,roleMiddleware('admin'),getAllComplaints);

router.put('/:id/assign',authMiddleware,roleMiddleware('admin'),assignComplaint)

module.exports = router;
