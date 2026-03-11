const express = require("express");
const router = express.Router();

/* GET ALL ISSUES */
router.get("/", (req, res) => {
  res.json({
    message: "List of civic issues",
    issues: []
  });
});

/* CREATE ISSUE */
router.post("/", (req, res) => {

  const { title, description } = req.body;

  if (!title || !description) {
    return res.status(400).json({
      message: "Title and description required"
    });
  }

  res.json({
    message: "Issue reported successfully",
    issue: { title, description }
  });

});

module.exports = router;