const express = require("express");
const router = express.Router();
const Issue = require("../models/Issue");
const User = require("../models/User");
const multer = require("multer");

/* ---------- CLOUDINARY SETUP ---------- */
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_KEY,
  api_secret: process.env.CLOUD_SECRET
});

/* ---------- MULTER CLOUD STORAGE ---------- */
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "civic_voice",
    allowed_formats: ["jpg", "png", "jpeg"]
  }
});

const upload = multer({ storage });

/* ---------- AUTH ---------- */
const authMiddleware = async (req, res, next) => {
  try {
    const userId = req.cookies.userId;

    if (!userId) {
      return res.status(401).json({ message: "Not logged in" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(401).json({ message: "Invalid user" });
    }

    req.user = user;
    next();

  } catch (err) {
    res.status(500).json({ message: "Auth error" });
  }
};

/* ---------- GET ALL ISSUES ---------- */
router.get("/", async (req, res) => {
  try {
    const issues = await Issue.find().sort({ createdAt: -1 });
    res.json(issues);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

/* ---------- CREATE ISSUE ---------- */
router.post("/", authMiddleware, upload.single("photo"), async (req, res) => {
  try {
    const { name, email, location, category, description, latitude, longitude } = req.body;

    const newIssue = new Issue({
      name: name || req.user.name,
      email: email || req.user.email,
      location,
      category,
      description,
      photo: req.file ? req.file.path : "", // 🔥 CLOUDINARY URL
      latitude,
      longitude,
      status: "Pending"
    });

    await newIssue.save();

    res.status(201).json({
      message: "Issue submitted",
      issue: newIssue
    });

  } catch (err) {
    res.status(500).json({ message: "Server error creating issue" });
  }
});

module.exports = router;