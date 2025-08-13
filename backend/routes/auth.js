const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { v4: uuidv4 } = require("uuid");

const router = express.Router();

// Register
router.post("/register", async (req, res) => {
  try {
    const { email, password, companyName } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create unique tenant ID
    const tenantId = uuidv4();

    // Create user
    const user = new User({
      email,
      password: hashedPassword,
      companyName,
      tenantId,
    });

    await user.save();

    // Generate JWT
    const token = jwt.sign(
      { userId: user._id, tenantId: user.tenantId },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.status(201).json({
      token,
      user: {
        id: user._id,
        email: user.email,
        companyName: user.companyName,
        tenantId: user.tenantId,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Generate JWT
    const token = jwt.sign(
      { userId: user._id, tenantId: user.tenantId },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        companyName: user.companyName,
        tenantId: user.tenantId,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
