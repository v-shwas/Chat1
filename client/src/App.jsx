import { useEffect } from "react";
import "./App.css";
import { Route, Routes, BrowserRouter as Router, Navigate } from "react-router-dom";
import SignUp from "./pages/SignUp";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import useAuthStore from "./store/useAuthStore";
import useSocketStore from "./store/useSocketStore";
import { Toaster } from "react-hot-toast";
import ParticleFieldLazy from "./components/3d/ParticleFieldLazy";

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
  }, [checkAuth]);

  useEffect(() => {
    if (authUser?._id) {
      connectSocket(authUser._id);
    }
    return () => {
      disconnectSocket();
    };
  }, [authUser, connectSocket, disconnectSocket]);

  return (
    <>
      {/* Layer 0: 3D particle background */}
      <ParticleFieldLazy />

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
            background: "rgba(28,27,26,0.92)",
            backdropFilter: "blur(18px)",
            color: "var(--text-primary)",
            border: "1px solid var(--glass-border)",
            borderRadius: "var(--r-lg)",
            fontSize: "13px",
            fontFamily: "var(--font-body)",
            fontWeight: "600",
            boxShadow: "var(--glass-shadow)",
          },
        }}
      />
    </>
  );
};

export default App;
