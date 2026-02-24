import React, { useState } from "react";
import { Button, Container, Paper, TextField, Typography } from "@mui/material";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { userLogin } from "../services/authServices";

const Login = ({ setAuthUser }) => {
  const [userInfo, setUserInfo] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const submitHandler = async (e) => {
    e.preventDefault();
    console.log(e);
    if (userInfo != "" && password != "") {
      const formData = {
        userInfo: userInfo,
        password: password,
      };
      userLogin(formData)
        .then((res) => {
          console.log(res.data);
          // localStorage.setItem("_token", res.data._token);
          setAuthUser(res.data); // Update App state
          navigate("/dashboard", { state: { user: res.data } });
        })
        .catch((err) => console.log("An error has occured", err));
    }
  };

  return (
    <Container
      component={"main"}
      maxWidth="xs"
      sx={{
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Paper
        elevation={3}
        sx={{
          padding: 4,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          color: "white",
        }}
      >
        <>
          <Typography variant="h5">Login</Typography>
          <form
            onSubmit={submitHandler}
            style={{ width: "100%", marginTop: "1rem" }}
          >
            <TextField
              required
              fullWidth
              type="text"
              name="userInfo"
              label="UserName"
              margin="normal"
              variant="outlined"
              onChange={(e) => setUserInfo(e.target.value)}
              sx={{
                "& .MuiOutlinedInput-root": {
                  color: "white",
                  "& fieldset": {
                    borderColor: "white", // Default border color
                  },
                  "&:hover fieldset": {
                    borderColor: "white", // Border color on hover
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "white", // Border color when focused
                  },
                },
                "& .MuiInputLabel-root": {
                  color: "white", // Watermark (label) color
                },
                "& .MuiInputBase-input::placeholder": {
                  color: "white", // Placeholder text color
                },
              }}
            />

            <TextField
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              margin="normal"
              variant="outlined"
              onChange={(e) => setPassword(e.target.value)}
              sx={{
                "& .MuiOutlinedInput-root": {
                  color: "white",
                  "& fieldset": {
                    borderColor: "white", // Default border color
                  },
                  "&:hover fieldset": {
                    borderColor: "white", // Border color on hover
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "white", // Border color when focused
                  },
                },
                "& .MuiInputLabel-root": {
                  color: "white", // Watermark (label) color
                },
                "& .MuiInputBase-input::placeholder": {
                  color: "white", // Placeholder text color
                },
              }}
            />
            <Button
              sx={{
                marginTop: "1rem",
                color: "white",
                backgroundColor: "rgb(56, 75, 105)",
              }}
              variant="contained"
              type="submit"
              fullWidth
            >
              Login
            </Button>

            <Typography textAlign={"center"} m={"1rem"}>
              OR
            </Typography>

            <Button fullWidth variant="text" component={Link} to="/signup">
              Sign Up instead
            </Button>
          </form>
        </>
      </Paper>
    </Container>
  );
};

export default Login;
