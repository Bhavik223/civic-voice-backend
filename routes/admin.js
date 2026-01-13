const router = require("express").Router();
const Issue = require("../models/Issue");
const auth = require("../middleware/authMiddleware");

router.get("/issues", auth, async (req,res)=>{
  if(req.user.role !== "admin") return res.status(403).json("Forbidden");
  const issues = await Issue.find();
  res.json(issues);
});

router.put("/issues/:id", auth, async (req,res)=>{
  if(req.user.role !== "admin")
    return res.status(403).json("Forbidden");

  await Issue.findByIdAndUpdate(
    req.params.id,
    { status: req.body.status }
  );
  res.json("Updated");
});

module.exports = router;
