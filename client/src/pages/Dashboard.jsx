import React from "react";
import "./Dashboard.css";
import { useLocation } from "react-router-dom";

const Dashboard = () => {
  const location = useLocation();
  const { user } = location.state || {};
  console.log(user.msg);
  return (
    <>
      <div className="dashBack">
        <div className="chatDiv1"></div>
        <div className="chatDiv2"></div>
      </div>
    </>
  );
};

export default Dashboard;
