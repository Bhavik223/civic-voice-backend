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

/* ---------- MULTER STORAGE ---------- */
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => ({
    folder: "civic_voice",
    format: file.mimetype.split("/")[1],
    public_id: Date.now().toString()
  })
});

const upload = multer({ storage });

/* ===================================================== */
/* ================== GET MY ISSUES ===================== */
/* ===================================================== */

router.get("/my", async (req, res) => {
  try {
    const userId = req.cookies.userId;

    if (!userId) {
      return res.status(401).json([]);
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json([]);
    }

    const issues = await Issue.find({ email: user.email })
      .sort({ createdAt: -1 });

    res.json(issues);

  } catch (err) {
    console.log("MY ISSUES ERROR:", err);
    res.status(500).json([]);
  }
});

/* ===================================================== */
/* ================== GET ALL ISSUES ==================== */
/* ===================================================== */

router.get("/", async (req, res) => {
  try {
    const issues = await Issue.find()
      .sort({ createdAt: -1 });

    res.json(issues);

  } catch (err) {
    console.log("GET ALL ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* ===================================================== */
/* ================== CREATE ISSUE ====================== */
/* ===================================================== */

router.post("/", upload.single("photo"), async (req, res) => {
  try {

    console.log("BODY:", req.body);
    console.log("FILE:", req.file);

    const {
      name,
      email,
      location,
      category,
      description,
      latitude,
      longitude
    } = req.body;

    /* VALIDATION */
    if (!name || !location || !category || !description) {
      return res.status(400).json({
        message: "All fields required"
      });
    }

    /* IMAGE URL */
    let photoUrl = "";

    if (req.file && req.file.path) {
      photoUrl = req.file.path; // Cloudinary URL
    }

    /* CREATE ISSUE */
    const newIssue = new Issue({
      name,
      email,
      location,
      category,
      description,
      photo: photoUrl,
      latitude: latitude || "",
      longitude: longitude || "",
      status: "Pending"
    });

    await newIssue.save();

    res.status(201).json({
      message: "Issue submitted",
      issue: newIssue
    });

  } catch (err) {
    console.log("CREATE ISSUE ERROR:", err);
    res.status(500).json({
      message: err.message || "Server error creating issue"
    });
  }
});

/* ===================================================== */

module.exports = router;