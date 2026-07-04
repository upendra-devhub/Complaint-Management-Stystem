const express = require("express");
const router = express.Router();

const authMiddleware=require('../middleware/auth.middleware');

const { 
    createComplaint,
    getMyComplaints,
    getComplaintById
 }=require('../controllers/complaint.controller');


router.post(
    '/',authMiddleware,createComplaint
)

router.get('/my',authMiddleware,getMyComplaints)

router.get('/:id',authMiddleware,getComplaintById)
module.exports = router;
