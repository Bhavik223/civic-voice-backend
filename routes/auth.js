const express = require("express");
const router = express.Router();
const User = require("../models/User");

/* TEST ROUTE */
router.get("/", (req, res) => {
  res.send("Auth API working 🚀");
});

// SIGNUP
router.post("/signup", async (req, res) => {

  try {

    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const user = new User({
      name,
      email,
      password
    });

    await user.save();

    res.json({ message: "Signup successful" });

  } catch (err) {

    console.log(err);
    res.status(500).json({ message: "Server error" });

  }

});


// LOGIN
router.post("/login", async (req, res) => {

  try {

    const { email, password } = req.body;

    const user = await User.findOne({ email, password });

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    res.json({ message: "Login successful", user });

  } catch (err) {

    console.log(err);
    res.status(500).json({ message: "Server error" });

  }

});

module.exports = router;