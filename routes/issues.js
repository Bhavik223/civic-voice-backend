const router = require("express").Router();
const Issue = require("../models/Issue");
const auth = require("../middleware/authMiddleware");

// Report Issue
router.post("/", auth, async (req,res)=>{
  const issue = new Issue({...req.body, userId:req.user.id});
  await issue.save();
  res.json("Issue Reported");
});

// My Issues
router.get("/my", auth, async (req,res)=>{
  const issues = await Issue.find({userId:req.user.id});
  res.json(issues);
});

module.exports = router;
