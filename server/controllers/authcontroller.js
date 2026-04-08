import bcrypt from "bcryptjs";
import User from "../models/userModel.js";
import generateToken from "../utils/generateToken.js";

const salt = bcrypt.genSaltSync(10);

const SignIn = async (req, res) => {
  try {
    const { userInfo, password } = req.body;

    if (!userInfo || !password) {
      return res.status(400).json({ error: true, message: "All fields are required" });
    }

    // Sanitize: trim whitespace
    const trimmedUserInfo = userInfo.trim();

    const user = await User.findOne({
      $or: [{ email: trimmedUserInfo }, { username: trimmedUserInfo }],
    });

    if (!user) {
      return res.status(401).json({ error: true, message: "Invalid credentials" });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(401).json({ error: true, message: "Invalid credentials" });
    }

    const payload = {
      _id: user._id,
      fullname: user.fullname,
      username: user.username,
      profilePic: user.profilePic,
    };
    generateToken(payload, res);
  } catch (error) {
    console.error("SignIn error:", error);
    res.status(500).json({ error: true, message: "Internal Server Error" });
  }
};

const SignUp = async (req, res) => {
  try {
    const { fullname, username, email, password, confirmPassword, gender } = req.body;

    // Input validation
    if (!fullname || !username || !email || !password || !confirmPassword || !gender) {
      return res.status(400).json({ error: "All fields are required" });
    }

    if (fullname.trim().length < 2 || fullname.trim().length > 50) {
      return res.status(400).json({ error: "Full name must be 2-50 characters" });
    }

    if (username.trim().length < 3 || username.trim().length > 30) {
      return res.status(400).json({ error: "Username must be 3-30 characters" });
    }

    // Basic email format check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "Invalid email format" });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters" });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ error: "Passwords don't match" });
    }

    if (!["male", "female"].includes(gender)) {
      return res.status(400).json({ error: "Invalid gender value" });
    }

    // Check existing user (both username and email)
    const existingUser = await User.findOne({
      $or: [{ username: username.trim() }, { email: email.trim().toLowerCase() }],
    });

    if (existingUser) {
      if (existingUser.username === username.trim()) {
        return res.status(400).json({ error: "Username already taken" });
      }
      return res.status(400).json({ error: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, salt);

    const profilePic = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(fullname.trim())}`;

    const newUser = new User({
      fullname: fullname.trim(),
      username: username.trim(),
      email: email.trim().toLowerCase(),
      password: hashedPassword,
      gender,
      profilePic,
    });

    await newUser.save();

    const payload = {
      _id: newUser._id,
      fullname: newUser.fullname,
      username: newUser.username,
      profilePic: newUser.profilePic,
    };

    generateToken(payload, res);
  } catch (error) {
    console.error("SignUp error:", error);
    // Handle mongoose duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({ error: "Username or email already exists" });
    }
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export { SignIn, SignUp };
