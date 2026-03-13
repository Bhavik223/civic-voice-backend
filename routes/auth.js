const express=require("express");
const router=express.Router();
const User=require("../models/User");

/* SIGNUP */

router.post("/signup",async(req,res)=>{

try{

const {name,email,password}=req.body;

if(!name || !email || !password){
return res.status(400).json({message:"All fields required"});
}

const lowerEmail=email.toLowerCase();

const existing=await User.findOne({email:lowerEmail});

if(existing){
return res.status(400).json({message:"Email already exists"});
}

const user=await User.create({
name,
email:lowerEmail,
password
});

res.json({message:"Signup success"});

}catch(err){

console.log(err);
res.status(500).json({message:"Server error"});

}

});

/* LOGIN */

router.post("/login",async(req,res)=>{

try{

const {email,password}=req.body;

const user=await User.findOne({email:email.toLowerCase()});

if(!user){
return res.status(400).json({message:"Invalid credentials"});
}

const match=await user.matchPassword(password);

if(!match){
return res.status(400).json({message:"Invalid credentials"});
}

res.cookie("userId",user._id,{
httpOnly:true,
secure:true,
sameSite:"none",
maxAge:86400000
});

res.json({
message:"Login success",
role:user.role,
user:user
});

}catch(err){

console.log(err);
res.status(500).json({message:"Server error"});

}

});

/* CHECK LOGIN */

router.get("/check",async(req,res)=>{

try{

const id=req.cookies.userId;

if(!id){
return res.json({loggedIn:false});
}

const user=await User.findById(id).select("-password");

if(!user){
return res.json({loggedIn:false});
}

res.json({
loggedIn:true,
user
});

}catch(err){

res.status(500).json({loggedIn:false});

}

});

/* LOGOUT */

router.post("/logout",(req,res)=>{

res.clearCookie("userId",{
httpOnly:true,
secure:true,
sameSite:"none"
});

res.json({message:"Logged out"});

});

module.exports=router;
