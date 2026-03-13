const express = require("express");
const router = express.Router();
const Issue = require("../models/Issue");
const User = require("../models/User");
const multer = require("multer");
const path = require("path");

/* ---------------- PHOTO UPLOAD SETUP ---------------- */

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    const uniqueName = Date.now() + path.extname(file.originalname);
    cb(null, uniqueName);
  }
});

const upload = multer({ storage });

/* ---------------- AUTH MIDDLEWARE ---------------- */

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

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Authentication error" });
  }
};

/* ---------------- GET ALL ISSUES (PUBLIC) ---------------- */

router.get("/", async (req, res) => {
  try {

    const issues = await Issue.find().sort({ createdAt: -1 });

    res.json(issues);

  } catch (err) {

    console.error(err);

    res.status(500).json({
      message: "Server error fetching issues"
    });

  }
});

/* ---------------- CREATE NEW ISSUE ---------------- */

router.post("/", authMiddleware, upload.single("photo"), async (req, res) => {

  const {
    name,
    email,
    location,
    category,
    description,
    latitude,
    longitude
  } = req.body;

  if (!location || !category || !description) {
    return res.status(400).json({
      message: "Location, category and description are required"
    });
  }

  try {

    const newIssue = await Issue.create({

      name: name || req.user.name,

      email: email || req.user.email,

      location,

      category,

      description,

      photo: req.file ? req.file.filename : "",

      latitude,

      longitude,

      status: "Pending"

    });

    res.status(201).json({
      message: "Issue reported successfully",
      issue: newIssue
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      message: "Server error creating issue"
    });

  }

});

/* ---------------- GET USER ISSUES ---------------- */

router.get("/my", authMiddleware, async (req, res) => {

  try {

    const myIssues = await Issue.find({
      email: req.user.email
    }).sort({ createdAt: -1 });

    res.json(myIssues);

  } catch (err) {

    console.error(err);

    res.status(500).json({
      message: "Server error fetching your issues"
    });

  }

});

/* ---------------- ADMIN UPDATE ISSUE STATUS ---------------- */

router.put("/:id", authMiddleware, async (req, res) => {

  const { status } = req.body;

  try {

    const updatedIssue = await Issue.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!updatedIssue) {
      return res.status(404).json({
        message: "Issue not found"
      });
    }

    res.json({
      message: "Issue status updated",
      issue: updatedIssue
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      message: "Server error updating issue"
    });

  }

});

module.exports = router;