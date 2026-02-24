import jwt from "jsonwebtoken";
// import crypto from "crypto";

// const secretKey = crypto.randomBytes(64).toString("hex");

const generateToken = (payload, res) => {
  const token = jwt.sign({ payload }, process.env.SECRET_KEY, {
    expiresIn: "15d",
  });

  res.cookie("jwt", token, {
    maxAge: 15 * 24 * 60 * 60 * 1000, 
    httpOnly: true, // prevent XSS
    sameSite: "strict", // CSRF
    secure: process.env.NODE_ENV !== "development",
  });
};

export default generateToken;
