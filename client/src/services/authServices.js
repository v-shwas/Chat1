import axios from "axios";

const authAPI = "http://localhost:3000/api/auth";

const userLogin = (data) => {
  return axios.post(`${authAPI}/login`, data);
};

const userRegister = (data) => {
  return axios.post(`${authAPI}/signup`, data);
};

export { userLogin, userRegister };
