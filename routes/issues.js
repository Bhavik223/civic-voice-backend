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
router.post("/", upload.single("photo"), async (req, res) => {
  try {
    const { name, email, location, category, description, latitude, longitude } = req.body;

    if (!name || !location || !category || !description) {
      return res.status(400).json({ message: "All fields required" });
    }

    const newIssue = new Issue({
      name,
      email,
      location,
      category,
      description,
      photo: req.file?.path || "",
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
    console.log("ERROR:", err); // 👈 ADD THIS FOR DEBUG
    res.status(500).json({ message: "Server error creating issue" });
  }
});
  } catch (err) {
    res.status(500).json({ message: "Server error creating issue" });
  }
});

module.exports = router;