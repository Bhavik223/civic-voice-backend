const router = require("express").Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

router.post("/signup", async (req,res)=>{
  const hashed = await bcrypt.hash(req.body.password,10);
  const user = new User({...req.body, password: hashed});
  await user.save();
  res.json("User Registered");
});

router.post("/login", async (req,res)=>{
  const user = await User.findOne({email:req.body.email});
  if(!user) return res.status(400).json("Invalid");

  const match = await bcrypt.compare(req.body.password, user.password);
  if(!match) return res.status(400).json("Invalid");

  const token = jwt.sign(
    {id:user._id, role:user.role},
    process.env.JWT_SECRET
  );

  res.json({token, role:user.role});
});

module.exports = router;
