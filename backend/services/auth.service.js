// Auth service database operations

const User=require('../models/User'
)
const bcrypt=require('bcrypt')

const generateToken = require("../utils/generateToken");

const registerUser=async(userData)=>{
    const {name,email,password, phone, address}=userData

    const existingUser=await User.findOne({email});

    if(existingUser){
        throw new Error("Email already exists");
    }

    const salt=await bcrypt.genSalt(10);

    const hashedPassword=await bcrypt.hash(password,salt)

    const user=await User.create({
        name,
        email,
        password:hashedPassword,
        phone,
        address,
        role:'user'
    });

    user.password=undefined;
    return user;
}


const loginUser=async(email,password)=>{
    const user=await User.findOne({email})

    if(!user){
        throw new Error("Invalid email or password")
    }

    const isMatch=await bcrypt.compare(password,user.password);

    if(!isMatch){
        throw new Error('Invalid email or password');
    }

    const token =generateToken(user._id,user.role);

    user.password=undefined;
    return {token,user}
}
module.exports={
    registerUser,loginUser
}