// import jwt from "jsonwebtoken";
import { jwtDecode } from "jwt-decode";

const getToken = () => {
  const lToken = localStorage.getItem("_token");
  return lToken;
};

const validateToken = () => {
  try {
    const token = getToken();
    const decoded = jwtDecode(token);
    const currentTime = Date.now() / 1000;
    return decoded.exp > currentTime;
    // const decodedToken = jwt.decode(token);
    // console.log(decodedToken);
  } catch (error) {
    console.error("Invalid token or decoding error:", error);
    return false;
  }
};
export { validateToken, getToken };
