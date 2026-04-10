const Issue = require("../models/Issue");
const express = require("express");
const router = express.Router();

/* ADMIN DASHBOARD */
router.get("/", (req, res) => {
  res.json({
    message: "Admin dashboard working"
  });
});

/* VIEW ALL ISSUES */
router.get("/issues", (req, res) => {
  res.json({
    message: "Admin viewing all issues"
  });
});


router.get("/all", async (req,res)=>{
const issues = await Issue.find().sort({createdAt:-1});
res.json(issues);
});

router.put("/status/:id", async (req,res)=>{
await Issue.findByIdAndUpdate(req.params.id,{
status:req.body.status
});
res.json({message:"Updated"});
});

module.exports = router;