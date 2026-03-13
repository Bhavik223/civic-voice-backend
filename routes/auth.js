const express = require("express");
const router = express.Router();
const User = require("../models/User");
const bcrypt = require("bcryptjs");

/* ---------------- SIGNUP ---------------- */
router.post("/signup", async (req, res) => {
  try {

    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields required" });
    }

    const lowerEmail = email.toLowerCase();

    const userExists = await User.findOne({ email: lowerEmail });

    if (userExists) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email: lowerEmail,
      password: hashedPassword,
      role: "user"
    });

    res.status(201).json({
      message: "Signup successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });

  } catch (error) {
    console.error("Signup Error:", error);
    res.status(500).json({ message: "Server error" });
  }
});


/* ---------------- LOGIN ---------------- */
router.post("/login", async (req, res) => {
  try {

    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "All fields required" });
    }

    const lowerEmail = email.toLowerCase();

    const user = await User.findOne({ email: lowerEmail });

    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    res.cookie("userId", user._id.toString(), {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 24 * 60 * 60 * 1000
    });

    res.json({
      message: "Login successful",
      role: user.role || "user",
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });

  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: "Server error" });
  }
});


/* ---------------- CHECK LOGIN ---------------- */
router.get("/check", async (req, res) => {
  try {

    const userId = req.cookies.userId;

    if (!userId) {
      return res.json({ loggedIn: false });
    }

    const user = await User.findById(userId).select("-password");

    if (!user) {
      return res.json({ loggedIn: false });
    }

    res.json({
      loggedIn: true,
      user: user
    });

  } catch (error) {
    console.error("Check Login Error:", error);
    res.status(500).json({
      loggedIn: false,
      message: "Server error"
    });
  }
});


/* ---------------- LOGOUT ---------------- */
router.post("/logout", (req, res) => {

  res.clearCookie("userId", {
    httpOnly: true,
    secure: true,
    sameSite: "none"
  });

  res.json({ message: "Logged out successfully" });

});


module.exports = router;
