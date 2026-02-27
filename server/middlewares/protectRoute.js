import jwt from "jsonwebtoken";
import User from "../models/userModel.js";

const protectRoute = async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    if (!authHeader) {
      return res.status(401).json({ error: "Unauthorised — No Token Provided" });
    }

    // Support "Bearer <token>" format
    const token = authHeader.startsWith("Bearer ")
      ? authHeader.slice(7)
      : authHeader;

    const decoded = jwt.verify(token, process.env.SECRET_KEY);

    if (!decoded) {
      return res.status(401).json({ error: "Unauthorised — Invalid Token" });
    }

    const user = await User.findById(decoded._id).select("-password");

    if (!user) {
      return res.status(401).json({ error: "User Not Found" });
    }
    req.user = user;

    next();
  } catch (error) {
    console.log("Error in protectRoute middleware:", error.message);
    res.status(500).json({ error: "Internal Server error" });
  }
};

export default protectRoute;
