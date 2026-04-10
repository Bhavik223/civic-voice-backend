const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");
require("dotenv").config();

const app = express();

/* ---------- MIDDLEWARE ---------- */

app.use(cors({
  origin: ture
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
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