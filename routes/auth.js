const express = require("express");
const router = express.Router();
const User = require("../models/User");

const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");

/* ================= CLOUDINARY ================= */

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_KEY,
  api_secret: process.env.CLOUD_SECRET
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "profile_pics",
    allowed_formats: ["jpg", "png", "jpeg"]
  }
});

const upload = multer({ storage });

/* ===================================================== */
/* ====================== SIGNUP ========================= */
/* ===================================================== */

router.post("/signup", async (req, res) => {
  try {

    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields required" });
    }

    const lowerEmail = email.toLowerCase();

    const existing = await User.findOne({ email: lowerEmail });

    if (existing) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const user = await User.create({
      name,
      email: lowerEmail,
      password
    });

    res.json({ message: "Signup success" });

  } catch (err) {
    console.log("SIGNUP ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* ===================================================== */
/* ======================= LOGIN ========================= */
/* ===================================================== */

router.post("/login", async (req, res) => {
  try {

    const { email, password } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const match = await user.matchPassword(password);

    if (!match) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    /* COOKIE SET */
    res.cookie("userId", user._id, {
      httpOnly: true,
      secure: true,      // required for Render + Netlify
      sameSite: "none",  // required for cross-site
      maxAge: 86400000
    });

    res.json({
      message: "Login success",
      role: user.role,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profilePic: user.profilePic || ""
      }
    });

  } catch (err) {
    console.log("LOGIN ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* ===================================================== */
/* ===================== CHECK LOGIN ==================== */
/* ===================================================== */

router.get("/check", async (req, res) => {
  try {

    const id = req.cookies.userId;

    if (!id) {
      return res.json({ loggedIn: false });
    }

    const user = await User.findById(id).select("-password");

    if (!user) {
      return res.json({ loggedIn: false });
    }

    res.json({
      loggedIn: true,
      user
    });

  } catch (err) {
    console.log("CHECK ERROR:", err);
    res.status(500).json({ loggedIn: false });
  }
});

/* ===================================================== */
/* ================== UPDATE PROFILE ==================== */
/* ===================================================== */

router.put("/update", upload.single("photo"), async (req, res) => {
  try {

    const userId = req.cookies.userId;

    if (!userId) {
      return res.status(401).json({ message: "Not logged in" });
    }

    const updateData = {};

    if (req.body.name) {
      updateData.name = req.body.name;
    }

    if (req.file) {
      updateData.profilePic = req.file.path;
    }

    const user = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true }
    ).select("-password");

    res.json({
      message: "Profile updated",
      user
    });

  } catch (err) {
    console.log("UPDATE ERROR:", err);
    res.status(500).json({ message: "Update failed" });
  }
});

/* ===================================================== */
/* ======================= LOGOUT ======================= */
/* ===================================================== */

router.post("/logout", (req, res) => {

  res.clearCookie("userId", {
    httpOnly: true,
    secure: true,
    sameSite: "none"
  });

  res.json({ message: "Logged out" });

});

/* ===================================================== */

module.exports = router;