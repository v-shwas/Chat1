import jwt from "jsonwebtoken";

const generateToken = (payload, res) => {
  const token = jwt.sign(payload, process.env.SECRET_KEY, {
    expiresIn: "7d",
  });
  res.status(200).json({ err: 0, msg: "logged In", _token: token });
};

export default generateToken;
