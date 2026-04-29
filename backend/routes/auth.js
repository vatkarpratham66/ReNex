const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { OAuth2Client } = require("google-auth-library");

const router = express.Router();
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const buildAuthPayload = (user, fallbackPicture = "") => ({
  token: jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  ),
  user: {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    phone: user.phone || "",
    blocked: Boolean(user.blocked),
    profilePic: user.profilePic || fallbackPicture || "",
  },
});

// @route   POST /api/auth/register
router.post("/register", async (req, res) => {
  try {
    const { name, email, phone, password, role } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ msg: "Please enter all required fields" });
    }

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ msg: "Email already exists" });

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    const user = new User({ name, email, phone, password_hash, role });
    await user.save();

    res.status(201).json(buildAuthPayload(user));
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});


// @route   POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: "Invalid credentials" });
    if (user.blocked) {
      return res.status(403).json({ msg: "Your account has been blocked" });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) return res.status(400).json({ msg: "Invalid credentials" });

    res.json(buildAuthPayload(user));
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

// @route   POST /api/auth/google
router.post("/google", async (req, res) => {
  try {
    const { tokenId, role } = req.body;

    if (!tokenId) {
      return res.status(400).json({ msg: "No token provided" });
    }

    const ticket = await client.verifyIdToken({
      idToken: tokenId,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload(); // { email, name, picture, sub }
    const { email, name, picture } = payload;

    let user = await User.findOne({ email });

    if (!user) {
      if (!role) {
        return res
          .status(400)
          .json({ msg: "Role is required for new Google users" });
      }

      // Create new user with Google info
      user = new User({
        name,
        email,
        phone: "",
        password_hash: "google-oauth", // placeholder
        role,
        profilePic: picture,
      });
      await user.save();
    } else if (user.blocked) {
      return res.status(403).json({ msg: "Your account has been blocked" });
    }

    res.json(buildAuthPayload(user, picture));
  } catch (err) {
    console.error("Google login error:", err);
    res.status(500).json({ msg: "Google login failed" });
  }
});

module.exports = router;
