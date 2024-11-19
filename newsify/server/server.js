import express from "express";
import axios from "axios";
import cors from "cors";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken"; // Import jwt for generating the token
import dotenv from "dotenv";

dotenv.config();
const app = express();
const FLASK_API_URL = "http://127.0.0.1:4000";
const MONGO_URI = process.env.MONGO_URI;
const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret"; // Add a fallback JWT secret

app.use(cors());
app.use(express.json());

mongoose
  .connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch((error) => console.error("MongoDB connection error:", error));

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

const User = mongoose.model("User", userSchema);

const fetchAIResponse = async (title, url, description, urlToImage) => {
  try {
    const response = await axios.post(`${FLASK_API_URL}/api/ai-summary`, {
      title,
      url,
      description,
      urlToImage,
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching AI summary:", error.message);
    throw error;
  }
};

const fetchNewsData = async (query) => {
  try {
    const response = await axios.get(`${FLASK_API_URL}/api/search-news`, {
      params: { query },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching news:", error.message);
    throw error;
  }
};

app.post("/api/register", async (req, res) => {
  const { username, email, password } = req.body;

  try {
    const existingUser = await User.findOne({
      $or: [{ username }, { email }],
    });
    if (existingUser) {
      if (existingUser.username === username) {
        return res.status(400).send("Username already exists");
      }
      if (existingUser.email === email) {
        return res.status(400).send("Email already registered");
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, email, password: hashedPassword });
    await newUser.save();
    res.status(201).send("User registered successfully");
  } catch (error) {
    console.error("Registration error:", error.message);
    res.status(500).send("Error registering user");
  }
});

app.post("/api/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });
    if (!user) return res.status(400).send("Invalid credentials");

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).send("Invalid credentials");

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, username: user.username },
      JWT_SECRET,
      { expiresIn: "1h" }
    );
    res.json({ token, username: user.username }); // Send username along with token
  } catch (error) {
    console.error("Login error:", error.message);
    res.status(500).send("Error logging in");
  }
});

app.post("/api/ai-summary", async (req, res) => {
  const { title, url, description, urlToImage } = req.body;
  try {
    const aiSummary = await fetchAIResponse(
      title,
      url,
      description,
      urlToImage
    );
    res.json(aiSummary);
  } catch (error) {
    res.status(500).send("Error generating AI summary.");
  }
});

app.get("/api/search", async (req, res) => {
  const { query } = req.query;
  try {
    const { articles, aiResponse } = await fetchNewsData(query);
    res.json({ articles, aiResponse });
  } catch (error) {
    res.status(500).send("Error fetching news.");
  }
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Express server running on port ${PORT}`);
});
