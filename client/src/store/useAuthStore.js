import { create } from "zustand";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import toast from "react-hot-toast";
import { API_BASE } from "../config";


const useAuthStore = create((set) => ({
  authUser: null,
  token: localStorage.getItem("_token") || null,
  isLoggingIn: false,
  isSigningUp: false,
  isCheckingAuth: true,

  checkAuth: () => {
    const token = localStorage.getItem("_token");
    if (!token) {
      set({ authUser: null, token: null, isCheckingAuth: false });
      return;
    }
    try {
      const decoded = jwtDecode(token);
      const currentTime = Date.now() / 1000;
      if (decoded.exp > currentTime) {
        set({ authUser: decoded, token, isCheckingAuth: false });
      } else {
        localStorage.removeItem("_token");
        set({ authUser: null, token: null, isCheckingAuth: false });
      }
    } catch {
      localStorage.removeItem("_token");
      set({ authUser: null, token: null, isCheckingAuth: false });
    }
  },

  login: async (formData) => {
    set({ isLoggingIn: true });
    try {
      const res = await axios.post(`${API_BASE}/auth/login`, formData);
      const token = res.data._token;
      localStorage.setItem("_token", token);
      const decoded = jwtDecode(token);
      set({ authUser: decoded, token, isLoggingIn: false });
      toast.success("Welcome back!");
      return true;
    } catch (error) {
      const msg = error.response?.data?.message || error.response?.data?.msg || "Login failed";
      toast.error(msg);
      set({ isLoggingIn: false });
      return false;
    }
  },

  signup: async (formData) => {
    set({ isSigningUp: true });
    try {
      const res = await axios.post(`${API_BASE}/auth/signup`, formData);
      const token = res.data._token;
      localStorage.setItem("_token", token);
      const decoded = jwtDecode(token);
      set({ authUser: decoded, token, isSigningUp: false });
      toast.success("Account created!");
      return true;
    } catch (error) {
      const msg = error.response?.data?.error || "Signup failed";
      toast.error(msg);
      set({ isSigningUp: false });
      return false;
    }
  },

  logout: () => {
    localStorage.removeItem("_token");
    set({ authUser: null, token: null });
    toast.success("Logged out");
  },
}));

export default useAuthStore;
