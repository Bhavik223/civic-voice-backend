router.post("/", upload.single("photo"), async (req, res) => {
  try {

    console.log("BODY:", req.body);
    console.log("FILE:", req.file);

    const { name, email, location, category, description, latitude, longitude } = req.body;

    if (!name || !location || !category || !description) {
      return res.status(400).json({ message: "All fields required" });
    }

    const newIssue = new Issue({
      name,
      email,
      location,
      category,
      description,
      photo: req.file?.path || "",
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
    console.log("🔥 ERROR:", err);   // VERY IMPORTANT
    res.status(500).json({ message: "Server error creating issue" });
  }
});