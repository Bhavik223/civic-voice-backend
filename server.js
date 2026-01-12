const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(express.json());
app.use(cors());

mongoose.connect(process.env.MONGO_URI)
.then(()=>console.log("✅ MongoDB Connected"))
.catch(err=>console.log(err));

app.use("/api/auth", require("./routes/auth"));
app.use("/api/issues", require("./routes/issues"));
app.use("/api/admin", require("./routes/admin"));

app.listen(process.env.PORT, () =>
  console.log("🚀 Server running")
);
