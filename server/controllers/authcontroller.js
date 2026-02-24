import bcrypt from "bcryptjs";
import User from "../models/userModel.js";
import { generateKey } from "crypto";
import generateToken from "../utils/generateToken.js";

const salt = bcrypt.genSaltSync(10);

const SignIn = (req, res) => {
  const { userInfo, password } = req.body;
  User.findOne({ $or: [{ email: userInfo }, { username: userInfo }] })
    .then((data) => {
      if (!data) {
        // User not found
        return res.status(404).json({ error: true, message: "User not found" });
      }
      if (bcrypt.compareSync(password, data.password)) {
        const payload = {
          _id: data._id,
          fullname: data.fullname,
          username: data.username,
          profilePic: data.profilePic,
        };
        generateToken(payload, res);
        res.status(200).json({
          _id: data._id,
          fullname: data.fullname,
          username: data.username,
          profilePic: data.profilePic,
          email: data.email,
          gender: data.gender
        });
      } else {
        return res.status(401).json({ err: 1, msg: "Incorrect Password" });
      }
    })
    .catch((error) => {
      // Handle database errors
      console.error("Error:", error);
      res.status(500).json({ error: true, message: "Internal Server Error" });
    });
};
const SignUp = async (req, res) => {
  try {
    console.log(req.body);
    const { fullname, username, email, password, confirmPassword, gender } =
      req.body;

    if (password !== confirmPassword) {
      return res.status(400).json({ error: "Passwords don't match " });
    }

    const user = await User.findOne({ username });

    if (user) {
      return res.status(400).json({ error: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, salt);

    const profilePic =
      "https://img.freepik.com/free-vector/businessman-character-avatar-isolated_24877-60111.jpg?w=740&t=st=1709056891~exp=1709057491~hmac=c9547fbec32bc739cf8320b282024cde1410403907f1be28400232f85d1755b1";

    const newUser = new User({
      fullname,
      username,
      email,
      password: hashedPassword,
      gender,
      profilePic,
    });

    if (newUser) {
      const payload = {
        _id: newUser._id,
        fullname: newUser.fullname,
        username: newUser.username,
        profilePic: newUser.profilePic,
      };

      await newUser.save();
      generateToken(payload, res);

      res.status(201).json({
        _id: newUser._id,
        fullname: newUser.fullname,
        username: newUser.username,
        profilePic: newUser.profilePic,
        email: newUser.email,
        gender: newUser.gender
      });
    } else {
      res.status(400).json({ err: "Invalid User data" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};


const Logout = (req, res) => {
  try {
    res.cookie("jwt", "", { maxAge: 0 });
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.log("Error in logout controller", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const GetMe = async (req, res) => {
  try {
    // req.user is set by protectRoute middleware
    const user = await User.findById(req.user._id).select("-password");
    res.status(200).json(user);
  } catch (error) {
    console.log("Error in getMe controller", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export { SignIn, SignUp, Logout, GetMe };

