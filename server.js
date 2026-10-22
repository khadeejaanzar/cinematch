const dns = require("node:dns");
dns.setServers(["1.1.1.1", "8.8.8.8"]);

require("dotenv").config();

const path = require("node:path");
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const Movie = require("./models/Movie");
const User = require("./models/User");
const Review = require("./models/Review");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: "20kb" }));

// The frontend is served by this same app in production, so only these
// three files are exposed publicly (never server.js, models/, or .env).
const PUBLIC_FILES = ["style.css", "script.js"];

app.get("/", (req, res) => res.sendFile(path.join(__dirname, "index.html")));
for (const file of PUBLIC_FILES) {
  app.get(`/${file}`, (req, res) => res.sendFile(path.join(__dirname, file)));
}
app.get("/healthz", (req, res) => res.json({ status: "ok" }));

function createToken(user) {
  return jwt.sign(
    { userId: user._id.toString(), role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
}

function authenticateToken(req, res, next) {
  const header = req.headers.authorization || "";
  if (!header.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Please log in to continue." });
  }
  try {
    req.auth = jwt.verify(header.slice(7), process.env.JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ message: "Session expired. Please log in again." });
  }
}

function requireAdmin(req, res, next) {
  if (req.auth?.role !== "admin") {
    return res.status(403).json({ message: "Administrator access required." });
  }
  next();
}

app.post("/api/auth/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body || {};
    if (typeof name !== "string" || typeof email !== "string" || typeof password !== "string") {
      return res.status(400).json({ message: "Enter your name, email and password." });
    }
    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();
    if (cleanName.length < 2 || cleanName.length > 60) {
      return res.status(400).json({ message: "Name must be 2–60 characters." });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail) || cleanEmail.length > 254) {
      return res.status(400).json({ message: "Enter a valid email address." });
    }
    if (password.length < 8 || password.length > 72) {
      return res.status(400).json({ message: "Password must be 8–72 characters." });
    }
    const user = await User.create({
      name: cleanName,
      email: cleanEmail,
      password: await bcrypt.hash(password, 12),
      role: "user"
    });
    res.status(201).json({
      message: "Account created successfully!",
      token: createToken(user),
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });
  } catch (error) {
    if (error.code === 11000) return res.status(409).json({ message: "An account with this email already exists." });
    if (error.name === "ValidationError") return res.status(400).json({ message: "Please check your account details." });
    console.error("Signup error:", error.message);
    res.status(500).json({ message: "Could not create account. Please try again." });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (typeof email !== "string" || typeof password !== "string" || !email.trim() || !password) {
      return res.status(400).json({ message: "Enter your email and password." });
    }
    const user = await User.findOne({ email: email.trim().toLowerCase() }).select("+password");
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "Invalid email or password." });
    }
    res.json({
      message: "Login successful!",
      token: createToken(user),
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });
  } catch (error) {
    console.error("Login error:", error.message);
    res.status(500).json({ message: "Could not log in. Please try again." });
  }
});

app.get("/api/auth/me", authenticateToken, async (req, res) => {
  const user = await User.findById(req.auth.userId).select("name email role");
  if (!user) return res.status(401).json({ message: "Account not found." });
  res.json({ user: { id: user._id, name: user.name, email: user.email, role: user.role } });
});

// Movie catalogue and genre filtering
app.get("/api/movies", async (req, res) => {
  try {
    res.json(await Movie.find().sort({ title: 1 }));
  } catch (error) {
    console.error("Movie fetch error:", error.message);
    res.status(500).json({ message: "Could not fetch movies." });
  }
});

app.get("/api/movies/genre/:genre", async (req, res) => {
  try {
    res.json(await Movie.find({ genre: { $regex: `^${req.params.genre}$`, $options: "i" } }));
  } catch (error) {
    res.status(500).json({ message: "Could not fetch movies." });
  }
});

// Movie creation is restricted to admins.
app.post("/api/movies", authenticateToken, requireAdmin, async (req, res) => {
  try {
    res.status(201).json(await Movie.create(req.body));
  } catch (error) {
    res.status(400).json({ message: "Could not create movie.", error: error.message });
  }
});

app.put("/api/movies/:id", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const movie = await Movie.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!movie) return res.status(404).json({ message: "Movie not found." });
    res.json(movie);
  } catch (error) {
    res.status(400).json({ message: "Could not update movie." });
  }
});

app.delete("/api/movies/:id", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const movie = await Movie.findByIdAndDelete(req.params.id);
    if (!movie) return res.status(404).json({ message: "Movie not found." });
    await Review.deleteMany({ movie: movie._id });
    await User.updateMany({}, { $pull: { watchlist: movie._id, watchHistory: { movie: movie._id } } });
    res.json({ message: "Movie deleted." });
  } catch (error) {
    res.status(400).json({ message: "Could not delete movie." });
  }
});

// Watchlist
app.get("/api/watchlist", authenticateToken, async (req, res) => {
  const user = await User.findById(req.auth.userId).populate("watchlist");
  res.json(user ? user.watchlist : []);
});

app.post("/api/watchlist/:movieId", authenticateToken, async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.movieId);
    if (!movie) return res.status(404).json({ message: "Movie not found." });
    await User.findByIdAndUpdate(req.auth.userId, { $addToSet: { watchlist: movie._id } });
    res.json({ message: "Added to your watchlist." });
  } catch {
    res.status(400).json({ message: "Could not update watchlist." });
  }
});

app.delete("/api/watchlist/:movieId", authenticateToken, async (req, res) => {
  await User.findByIdAndUpdate(req.auth.userId, { $pull: { watchlist: req.params.movieId } });
  res.json({ message: "Removed from your watchlist." });
});

// Watch history
app.get("/api/history", authenticateToken, async (req, res) => {
  const user = await User.findById(req.auth.userId).populate("watchHistory.movie");
  res.json(user ? user.watchHistory.filter(item => item.movie) : []);
});

app.post("/api/history/:movieId", authenticateToken, async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.movieId);
    if (!movie) return res.status(404).json({ message: "Movie not found." });
    await User.findByIdAndUpdate(req.auth.userId, {
      $pull: { watchHistory: { movie: movie._id } }
    });
    await User.findByIdAndUpdate(req.auth.userId, {
      $push: { watchHistory: { $each: [{ movie: movie._id, watchedAt: new Date() }], $position: 0, $slice: 100 } }
    });
    res.json({ message: "Watch history updated." });
  } catch {
    res.status(400).json({ message: "Could not update watch history." });
  }
});

// Reviews: one review per user per movie; users can update their own review.
app.get("/api/movies/:movieId/reviews", async (req, res) => {
  try {
    const reviews = await Review.find({ movie: req.params.movieId })
      .populate("user", "name").sort({ createdAt: -1 });
    res.json(reviews);
  } catch {
    res.status(400).json({ message: "Could not fetch reviews." });
  }
});

app.post("/api/movies/:movieId/reviews", authenticateToken, async (req, res) => {
  try {
    const rating = Number(req.body?.rating);
    const text = typeof req.body?.text === "string" ? req.body.text.trim() : "";
    if (!Number.isInteger(rating) || rating < 1 || rating > 10) {
      return res.status(400).json({ message: "Rating must be between 1 and 10." });
    }
    if (text.length > 1000) return res.status(400).json({ message: "Review must be 1000 characters or fewer." });
    const movie = await Movie.findById(req.params.movieId);
    if (!movie) return res.status(404).json({ message: "Movie not found." });
    const review = await Review.findOneAndUpdate(
      { user: req.auth.userId, movie: movie._id },
      { rating, text },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
    );
    const aggregate = await Review.aggregate([
      { $match: { movie: movie._id } },
      { $group: { _id: "$movie", average: { $avg: "$rating" } } }
    ]);
    if (aggregate.length) {
      movie.rating = Math.round(aggregate[0].average * 10) / 10;
      await movie.save();
    }
    res.status(201).json({ message: "Review saved.", review });
  } catch (error) {
    console.error("Review error:", error.message);
    res.status(400).json({ message: "Could not save review." });
  }
});

app.delete("/api/reviews/:reviewId", authenticateToken, async (req, res) => {
  try {
    const review = await Review.findOneAndDelete({ _id: req.params.reviewId, user: req.auth.userId });
    if (!review) return res.status(404).json({ message: "Review not found." });
    res.json({ message: "Review deleted." });
  } catch {
    res.status(400).json({ message: "Could not delete review." });
  }
});

async function startServer() {
  try {
    if (!process.env.MONGO_URI) throw new Error("MONGO_URI is missing from .env");
    if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
      throw new Error("Add a strong JWT_SECRET (at least 32 characters) to .env");
    }
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB!");
    const count = await Movie.countDocuments();
    if (count === 0) {
      await Movie.insertMany([
        { title: "Interstellar", genre: "Sci-Fi", year: 2014, rating: 8.7, description: "A team of explorers travels through a wormhole in space to find a new home for humanity." },
        { title: "The Martian", genre: "Sci-Fi", year: 2015, rating: 8.0, description: "An astronaut stranded on Mars uses science and ingenuity to survive until rescue becomes possible." },
        { title: "The Dark Knight", genre: "Action", year: 2008, rating: 9.0, description: "Batman faces the Joker, a criminal mastermind who pushes Gotham City into chaos." },
        { title: "The Notebook", genre: "Romance", year: 2004, rating: 7.8, description: "A romantic story about two people whose love endures through separation, hardship, and time." }
      ]);
      console.log("Starter movies added!");
    }
    app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
  } catch (error) {
    console.error("Startup failed:", error.message);
    process.exit(1);
  }
}

startServer();
