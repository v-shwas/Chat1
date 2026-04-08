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
            background: "rgba(255,255,255,0.06)",
            backdropFilter: "blur(20px)",
            color: "var(--text-primary)",
            border: "1px solid var(--glass-border)",
            borderRadius: "var(--r-md)",
            fontSize: "13px",
            fontFamily: "var(--font-body)",
            fontWeight: "400",
            boxShadow: "var(--glass-shadow)",
          },
        }}
      />
    </>
  );
};

export default App;
