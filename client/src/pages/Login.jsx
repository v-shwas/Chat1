import React, { useState } from "react";
import { Button, Container, Paper, TextField, Typography } from "@mui/material";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { userLogin } from "../services/authServices";

const Login = () => {
  const [userInfo, setUserInfo] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const submitHandler = async (e) => {
    e.preventDefault();
    console.log(e);
    if (userInfo != "" && password != "") {
      // const data = new FormData(e.target);
      // console.log(data);

      const formData = {
        userInfo: userInfo,
        password: password,
      };
      userLogin(formData)
        .then((res) => {
          console.log(res.data);
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
            />
            <Button
              sx={{ marginTop: "1rem" }}
              variant="contained"
              color="primary"
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
