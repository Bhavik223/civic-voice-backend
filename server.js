const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const path = require("path");
require("dotenv").config();

const app = express();
const adminRoutes = require("./routes/admin");
app.use("/api/admin", adminRoutes);
/* ---------- MIDDLEWARE ---------- */

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors({
  origin: [
    "https://civicvoice2.netlify.app",
    "http://localhost:5500",
    "http://127.0.0.1:5500"
  ],
  credentials: true
}));

app.use(cookieParser());

/* ---------- STATIC FILES ---------- */

app.use("/uploads", express.static("uploads"));

/* ---------- MONGODB ---------- */

mongoose.connect(process.env.MONGO_URI)
.then(()=>console.log("✅ MongoDB Connected"))
.catch(err=>console.log("Mongo Error:",err));

/* ---------- ROUTES ---------- */

app.get("/",(req,res)=>{
res.send("Civic Voice Backend Running");
});

app.use("/api/auth",require("./routes/auth"));
app.use("/api/issues",require("./routes/issues"));
app.use("/api/admin",require("./routes/admin"));

/* ---------- ERROR HANDLER ---------- */

app.use((err,req,res,next)=>{
console.error(err);
res.status(500).json({message:"Server error"});
});

/* ---------- SERVER ---------- */

const PORT=process.env.PORT||5000;

app.listen(PORT,()=>{
console.log("Server running on port "+PORT);
});
