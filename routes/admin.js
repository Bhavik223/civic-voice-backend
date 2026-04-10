const express = require("express");
const router = express.Router();
const Issue = require("../models/Issue");
const User = require("../models/User");

/* ADMIN AUTH CHECK */
router.use(async (req,res,next)=>{

  const userId = req.cookies.userId;

  if(!userId){
    return res.status(401).json({message:"Not logged in"});
  }

  const user = await User.findById(userId);

  if(!user || user.role !== "admin"){
    return res.status(403).json({message:"Not admin"});
  }

  next();
});

/* GET ALL ISSUES */
router.get("/all", async (req,res)=>{
  const issues = await Issue.find().sort({createdAt:-1});
  res.json(issues);
});

/* UPDATE STATUS */
router.put("/status/:id", async (req,res)=>{
  await Issue.findByIdAndUpdate(req.params.id,{
    status: req.body.status
  });
  res.json({message:"Updated"});
});

module.exports = router;