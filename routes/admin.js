const express = require("express");
const router = express.Router();

/* ADMIN DASHBOARD */
router.get("/", (req, res) => {
  res.json({
    message: "Admin dashboard working"
  });
});

/* VIEW ALL ISSUES */
router.get("/issues", (req, res) => {
  res.json({
    message: "Admin viewing all issues"
  });
});

module.exports = router;