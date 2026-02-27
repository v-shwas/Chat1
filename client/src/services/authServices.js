import axios from "axios";

const authAPI = "http://localhost:3000/api/auth";

const userLogin = (data) => {
  return axios.post(`${authAPI}/login`, data);
};

const userRegister = (data) => {
  return axios.post(`${authAPI}/signup`, data);
};

const token = () => {
  return localStorage.getItem("_token");
};

const isLoggedIn = () => {
  if (token()) {
    return true;
  } else {
    return false;
  }
};

const logout = () => {
  localStorage.removeItem("_token");
};

export { userLogin, userRegister, token, isLoggedIn, logout };
