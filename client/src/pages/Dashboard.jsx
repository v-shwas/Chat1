import "./Dashboard.css";
import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import * as React from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";

import { logout as logoutService } from "../services/authServices";

const Dashboard = ({ user }) => {
  const location = useLocation();
  const navigate = useNavigate();
  // Fallback to location state if user prop not provided (though App should pass it)
  const currentUser = user || location.state?.user; 
  
  // console.log(user?.msg); // Removed or fixed access

  const logout = () => {
    logoutService().then(() => {
        navigate("/login");
        window.location.reload(); // To reset App state
    });
  };
  return (
    <>
      <div className="mainDiv">
        <Box sx={{ flexGrow: 1 }}>
          <AppBar
            position="static"
            sx={{ bgcolor: "grey.500" }}
            className="navbar"
          >
            <Toolbar>
              <IconButton
                size="large"
                edge="start"
                color="inherit"
                aria-label="menu"
                sx={{ mr: 2 }}
              >
                <MenuIcon />
              </IconButton>
              <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                News
              </Typography>
              <Button color="inherit" onClick={logout}>
                Logout
              </Button>
            </Toolbar>
          </AppBar>
        </Box>

        <div className="dashBack">
          <div className="chatDash">
            <div className="chatDiv1"></div>
            <div className="chatDiv2"></div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
