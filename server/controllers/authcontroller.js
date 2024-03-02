import bcrypt from "bcryptjs";
import User from "../models/userModel.js";
import { generateKey } from "crypto";
import generateToken from "../utils/generateToken.js";

const salt = bcrypt.genSaltSync(10);

const SignIn = (req, res) => {
  res.json({ err: 0, msg: "Login success" });
};
const SignUp = async (req, res) => {
  try {
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
      generateToken(payload, res);
      await newUser.save();

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
