const express = require("express");
const router = express.Router();

const authMiddleware=require('../middleware/auth.middleware');
const roleMiddleware=require('../middleware/role.middleware')
const upload=require('../middleware/upload.middleware');

const { 
    createComplaint,
    getMyComplaints,
    getComplaintById,
    getAllComplaints,
    assignComplaint,
    getAssignedComplaints,
    updateComplaintStatus
 }=require('../controllers/complaint.controller');


router.post(
    '/',
    authMiddleware,
    roleMiddleware('user'),
    upload.array('images',5),
    createComplaint
)

router.get('/my',authMiddleware,getMyComplaints)

router.get('/assigned',authMiddleware,roleMiddleware('employee'),getAssignedComplaints)

router.get('/:id',authMiddleware,getComplaintById)

router.get('/',authMiddleware,roleMiddleware('admin'),getAllComplaints);

router.put('/:id/assign',authMiddleware,roleMiddleware('admin'),assignComplaint)

router.put('/:id/status',authMiddleware,roleMiddleware('employee'),updateComplaintStatus)

module.exports = router;
