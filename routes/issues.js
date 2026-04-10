router.post("/", upload.single("photo"), async (req, res) => {
  try {

    console.log("ENV:", process.env.CLOUD_NAME);
    console.log("BODY:", req.body);
    console.log("FILE:", req.file);

    const { name, email, location, category, description, latitude, longitude } = req.body;

    if (!name || !location || !category || !description) {
      return res.status(400).json({ message: "All fields required" });
    }

    let photoUrl = "";

    // ✅ SAFE IMAGE HANDLING
    if (req.file && req.file.path) {
      photoUrl = req.file.path;
    } else {
      console.log("⚠️ No image uploaded or Cloudinary failed");
    }

    const newIssue = new Issue({
      name,
      email,
      location,
      category,
      description,
      photo: photoUrl,
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
    console.log("🔥 FULL ERROR:", err);
    res.status(500).json({
      message: err.message || "Server error creating issue"
    });
  }
});