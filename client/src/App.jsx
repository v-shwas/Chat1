import React, { useEffect, Suspense, lazy } from "react";
import "./App.css";
import { Route, Routes, BrowserRouter as Router, Navigate } from "react-router-dom";
import SignUp from "./pages/SignUp";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import useAuthStore from "./store/useAuthStore";
import useSocketStore from "./store/useSocketStore";
import { Toaster } from "react-hot-toast";

const ProtectedRoute = ({ children }) => {
  const { authUser } = useAuthStore();
  return authUser ? children : <Navigate to="/login" />;
};

const PublicRoute = ({ children }) => {
  const { authUser } = useAuthStore();
  return authUser ? <Navigate to="/dashboard" /> : children;
};

const App = () => {
  const { checkAuth, authUser } = useAuthStore();
  const { connectSocket, disconnectSocket } = useSocketStore();

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (authUser?._id) {
      connectSocket(authUser._id);
    }
    return () => {
      disconnectSocket();
    };
  }, [authUser]);

  return (
    <>
      <Router>
        <Routes>
          <Route
            path="/"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />
          <Route
            path="/login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />
          <Route
            path="/signup"
            element={
              <PublicRoute>
                <SignUp />
              </PublicRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            background: "var(--bg-tertiary)",
            color: "var(--text-primary)",
            border: "1px solid var(--border-glow)",
            borderRadius: "var(--radius-md)",
            fontSize: "13px",
            fontFamily: "'Rajdhani', sans-serif",
            fontWeight: "500",
            boxShadow: "0 4px 20px rgba(0, 229, 255, 0.1)",
            letterSpacing: "0.02em",
          },
        }}
      />
    </>
  );
};

export default App;
