import React, { lazy } from "react";
import "./App.css";
import { Route, Routes, BrowserRouter as Router } from "react-router-dom";
import SignUp from "./pages/SignUp";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import { getToken, validateToken } from "./utils/tokenValidate";
import { Navigate } from "react-router-dom";

// const Login = lazy(() => import("./pages/Login"));
const Chat = lazy(() => import("./pages/Chat"));
const Groups = lazy(() => import("./pages/Groups"));

const ProtectedRoute = ({ children }) => {
  const isAuthenticated = getToken; // Example using token from localStorage
  return validateToken() ? children : <Navigate to="/login" />;
};
console.log(validateToken());

const App = () => {
  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/chat/:chatId" element={<Chat />} />
          <Route path="/groups" element={<Groups />} />
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
    </>
  );
};

export default App;
