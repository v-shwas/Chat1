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
      } else {
        res.json({ err: 1, msg: "Incorrect Password" });
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

      // res.status(201).json({
      //   _id: newUser._id,
      //   fullname: newUser.fullname,
      //   username: newUser.username,
      //   profilePic: newUser.profilePic,
      // });
    } else {
      res.status(400).json({ err: "Invalid User data" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export { SignIn, SignUp };
