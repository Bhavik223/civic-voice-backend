const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const path = require("path");
require("dotenv").config();

const app = express();

/* ---------- MIDDLEWARE ---------- */

// Parse JSON
app.use(express.json());

// CORS configuration
app.use(cors({
  origin: [
    "https://civicvoice2.netlify.app",
    "http://localhost:5500",
    "http://127.0.0.1:5500"
  ],
  credentials: true
}));

// Cookie parser
app.use(cookieParser());

/* ---------- STATIC FILES ---------- */

// Serve uploaded images
app.use("/uploads", express.static("uploads"));
/* ---------- MONGODB CONNECTION ---------- */

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log("✅ MongoDB Connected");
})
.catch((err) => {
  console.error("❌ MongoDB connection error:", err);
});

/* ---------- BASIC TEST ROUTE ---------- */

app.get("/", (req, res) => {
  res.send("🚀 Civic Voice Backend is Running");
});

/* ---------- API ROUTES ---------- */

app.use("/api/auth", require("./routes/auth"));
app.use("/api/issues", require("./routes/issues"));
app.use("/api/admin", require("./routes/admin"));

/* ---------- 404 API HANDLER ---------- */

app.use("/api", (req, res) => {
  res.status(404).json({
    error: "API route not found"
  });
});

/* ---------- GLOBAL ERROR HANDLER ---------- */

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: "Internal Server Error"
  });
});

/* ---------- SERVER ---------- */

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});