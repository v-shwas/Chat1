import jwt from "jsonwebtoken";
import crypto from "crypto";

const secretKey = crypto.randomBytes(64).toString("hex");

const generateToken = (payload, res) => {
  const token = jwt.sign({ payload }, secretKey, { expiresIn: "15d" });
  console.log(jwt.decode(token));
  res.status(200).json({ err: 0, msg: "logged In", _token: token });
};

export default generateToken;
