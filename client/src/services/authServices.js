import axios from "axios";

const authAPI = "http://localhost:3000/api/auth";

// Create an axios instance with default config
const apiClient = axios.create({
  baseURL: authAPI,
  withCredentials: true,
});

const userLogin = (data) => {
  return apiClient.post("/login", data);
};

const userRegister = (data) => {
  return apiClient.post("/signup", data);
};

const logout = () => {
  return apiClient.post("/logout");
};

const checkAuth = () => {
  return apiClient.get("/me");
};

export { userLogin, userRegister, logout, checkAuth };
