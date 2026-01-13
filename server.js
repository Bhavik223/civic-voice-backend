const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(express.json());
app.use(cors());

mongoose.connect(process.env.mongodb+srv://civicvoice:<Bhavik0223>@civicvoice.mrlvfql.mongodb.net/?appName=CivicVoice
)
.then(()=>console.log("✅ MongoDB Connected"))
.catch(err=>console.log(err));

app.get("/", (req, res) => {
  res.send("Civic Voice Backend is Running 🚀");
});

app.use("/api/auth", require("./routes/auth"));
app.use("/api/issues", require("./routes/issues"));
app.use("/api/admin", require("./routes/admin"));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log("🚀 Server running on port " + PORT);
});
