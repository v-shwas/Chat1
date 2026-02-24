import React, { lazy, useEffect, useState } from "react";
import "./App.css";
import { Route, Routes, BrowserRouter as Router, Navigate } from "react-router-dom";
import SignUp from "./pages/SignUp";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import { checkAuth } from "./services/authServices";

// const Login = lazy(() => import("./pages/Login"));
const Chat = lazy(() => import("./pages/Chat"));
const Groups = lazy(() => import("./pages/Groups"));

const ProtectedRoute = ({ children, authUser, loading }) => {
  if (loading) return <div>Loading...</div>;
  return authUser ? children : <Navigate to="/login" />;
};

const App = () => {
  const [authUser, setAuthUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth()
      .then((res) => {
        setAuthUser(res.data);
      })
      .catch((err) => {
        console.log("Not authenticated", err);
        setAuthUser(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={authUser ? <Navigate to="/dashboard" /> : <Login setAuthUser={setAuthUser} />} />
          <Route path="/login" element={authUser ? <Navigate to="/dashboard" /> : <Login setAuthUser={setAuthUser} />} />
          <Route path="/signup" element={authUser ? <Navigate to="/dashboard" /> : <SignUp setAuthUser={setAuthUser} />} />
          <Route path="/chat/:chatId" element={<Chat />} /> {/* Might need protection too */}
          <Route path="/groups" element={<Groups />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute authUser={authUser} loading={loading}>
                <Dashboard user={authUser} />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </>
  );
};

export default App;
