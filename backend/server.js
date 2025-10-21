import express from "express";
import mongoose from "mongoose";
import User from "./models/User.js";
import cors from "cors";
import bodyParser from "body-parser";

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

//Connect to MongoDB
mongoose.connect("mongodb://localhost:27017/YARCoin-database",{
  useNewUrlParser:true,
  useUnifiedTopology:true,
})
.then(() => console.log("Connected to MongoDB Database"))
.catch((err) => console.error("MongoDB connection failed:",err));


// ====================== REGISTER ======================
app.post("/register", async (req, res) => {
  const { firstName, lastName, username, password, role } = req.body;

  if (!firstName || !lastName || !username || !password || !role) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(409).json({ error: "Username already exists" });
    }

    const newUser = new User({ firstName, lastName, username, password, role });
    await newUser.save();

    res.json({ message: "User registered successfully" });
  } catch (err) {
    console.error("Error registering user:", err);
    res.status(500).json({ error: "Database error" });
  }
});



// ====================== LOGIN ======================
app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ success: false, error: "Missing fields" });
  }

  try {
    const user = await User.findOne({ username, password });
    if (!user) {
      return res.status(401).json({ success: false, error: "Invalid credentials" });
    }

    res.json({
      success: true,
      role: user.role,
      username: user.username,
    });
  } catch (err) {
    console.error("Error checking user:", err);
    res.status(500).json({ success: false, error: "Database error" });
  }
});




// ====================== START SERVER ======================
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
