const express = require("express");
const router = express.Router();
module.exports = router;


const {register}=require("../controllers/auth.controller")

router.post('/register',register);
module.exports=router