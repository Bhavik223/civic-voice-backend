const express = require("express");
const router = express.Router();
const Issue = require("../models/Issue");
const multer = require("multer");

/* ---------- CLOUDINARY SETUP ---------- */
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_KEY,
  api_secret: process.env.CLOUD_SECRET
});

/* ---------- MULTER CLOUDINARY STORAGE ---------- */
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    return {
      folder: "civic_voice",
      format: file.mimetype.split("/")[1], // jpg/png
      public_id: Date.now().toString()
    };
  }
});

const upload = multer({ storage });

/* ---------- GET ALL ISSUES ---------- */
router.get("/", async (req, res) => {
  try {
    const issues = await Issue.find().sort({ createdAt: -1 });
    res.json(issues);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server error" });
  }
});

/* ---------- CREATE ISSUE ---------- */
router.post("/", upload.single("photo"), async (req, res) => {
  try {
    console.log("BODY:", req.body);
    console.log("FILE:", req.file);

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
      photo: req.file?.path || "", // Cloudinary URL
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
    console.log("🔥 ERROR:", err);
    res.status(500).json({ message: "Server error creating issue" });
  }
});

module.exports = router;