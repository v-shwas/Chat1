import React, { lazy } from "react";
import { Route, Routes, BrowserRouter as Router } from "react-router-dom";
import SignUp from "./pages/SignUp";

const Home = lazy(() => import("./pages/Home"));
const Login = lazy(() => import("./pages/Login"));
const Chat = lazy(() => import("./pages/Chat"));
const Groups = lazy(() => import("./pages/Groups"));

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
          <Route path="/about" element={<h1>About</h1>} />
        </Routes>
      </Router>
    </>
  );
};

export default App;
