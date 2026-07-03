// Auth service database operations

const User=require('../models/User'
)
const bcrypt=require('bcrypt')

const registerUser=async(userData)=>{
    const {name,email,password, phone, address}=userData

    const existingUser=await User.findOne({email});

    if(existingUser){
        throw new console.error("Email already exists");
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

module.exports={
    registerUser,
}