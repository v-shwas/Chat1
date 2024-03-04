import jwt from "jsonwebtoken";
import User from "../models/userModel.js";

const protectRoute = (req, res, next) => {
  try {
    const token = req.headers["authorization"];
    if (!token) {
      return res.status(401).json({ error: "Unauthorised No Token Provided" });
    }
    const decoded = jwt.verify(token, process.env.SECRET_KEY);

    if (!decoded) {
      return res.status(401).json({ error: "Unauthorised - Invalid Token" });
    }

    const user = User.findOne(decoded._id).select("-password");

    if (!user) {
      return res.status(401).json({ error: "User Not Found" });
    }

    req.user = user;

    next();
  } catch (error) {
    console.log("Error in protectROute middleware", error.message);
    res.status(500).json({ error: "Internal Server error" });
  }
};

export default protectRoute;
