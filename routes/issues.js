const express=require("express");
const router=express.Router();
const Issue=require("../models/Issue");
const User=require("../models/User");
const multer=require("multer");
const path=require("path");
const fs=require("fs");

/* ---------- CREATE UPLOAD FOLDER ---------- */

const uploadPath="uploads";

if(!fs.existsSync(uploadPath)){
fs.mkdirSync(uploadPath);
}

/* ---------- MULTER STORAGE ---------- */

const storage=multer.diskStorage({

destination:function(req,file,cb){
cb(null,uploadPath);
},

filename:function(req,file,cb){
const uniqueName=Date.now()+path.extname(file.originalname);
cb(null,uniqueName);
}

});

const upload=multer({storage});

/* ---------- AUTH ---------- */

const authMiddleware=async(req,res,next)=>{

try{

const userId=req.cookies.userId;

if(!userId){
return res.status(401).json({message:"Not logged in"});
}

const user=await User.findById(userId);

if(!user){
return res.status(401).json({message:"Invalid user"});
}

req.user=user;

next();

}catch(err){

console.log(err);
res.status(500).json({message:"Auth error"});

}

};

/* ---------- GET ALL ISSUES ---------- */

router.get("/",async(req,res)=>{

try{

const issues=await Issue.find().sort({createdAt:-1});

res.json(issues);

}catch(err){

console.log(err);
res.status(500).json({message:"Server error"});

}

});

/* ---------- CREATE ISSUE ---------- */

router.post("/",authMiddleware,upload.single("photo"),async(req,res)=>{

try{

const {name,email,location,category,description,latitude,longitude}=req.body;

if(!location || !category || !description){
return res.status(400).json({message:"Required fields missing"});
}

const newIssue=new Issue({

name:name || req.user.name,
email:email || req.user.email,
location,
category,
description,
photo:req.file ? "/uploads/"+req.file.filename : "",
latitude,
longitude,
status:"Pending"

});

await newIssue.save();

res.status(201).json({
message:"Issue submitted",
issue:newIssue
});

}catch(err){

console.log(err);
res.status(500).json({message:"Server error creating issue"});

}

});

/* ---------- USER ISSUES ---------- */

router.get("/my",authMiddleware,async(req,res)=>{

try{

const issues=await Issue.find({
email:req.user.email
}).sort({createdAt:-1});

res.json(issues);

}catch(err){

console.log(err);
res.status(500).json({message:"Server error"});

}

});

/* ---------- UPDATE STATUS ---------- */

router.put("/:id",authMiddleware,async(req,res)=>{

try{

const {status}=req.body;

const issue=await Issue.findByIdAndUpdate(
req.params.id,
{status},
{new:true}
);

res.json(issue);

}catch(err){

console.log(err);
res.status(500).json({message:"Server error"});

}

});

module.exports=router;
