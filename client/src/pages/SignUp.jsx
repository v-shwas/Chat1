import React, { useEffect, useState } from "react";
import {
  Button,
  Container,
  Paper,
  TextField,
  Typography,
  Box,
} from "@mui/material";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormControl from "@mui/material/FormControl";
import FormLabel from "@mui/material/FormLabel";
import Radio from "@mui/material/Radio";
import { Link } from "react-router-dom";
import { userRegister } from "../services/authServices";

const SignUp = () => {
  const [fullname, setFullname] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [gender, setGender] = useState("");

  const handleGenderChange = (event) => {
    setGender(event.target.value);
  };
  const registerHandler = (e) => {
    e.preventDefault();
    const formData = {
      fullname,
      username,
      email,
      password,
      confirmPassword,
      gender,
    };

    userRegister(formData).then((res) => {
      console.log(res.data);
    });
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
          <Typography variant="h5">SignUp</Typography>
          <form style={{ width: "100%" }} onSubmit={registerHandler}>
            <TextField
              required
              fullWidth
              label="Email"
              margin="normal"
              variant="filled"
              onChange={(e) => setEmail(e.target.value)}
            />
            <Box display="flex" justifyContent="space-between">
              <TextField
                required
                fullWidth
                label="FullName"
                margin="normal"
                variant="filled"
                onChange={(e) => setFullname(e.target.value)}
                sx={{ marginRight: 1 }}
              />
              <TextField
                required
                fullWidth
                label="UserName"
                margin="normal"
                variant="filled"
                onChange={(e) => setUsername(e.target.value)}
                sx={{ marginLeft: 1 }}
              />
            </Box>
            <Box display="flex" justifyContent="space-between">
              <TextField
                required
                fullWidth
                label="Password"
                type="password"
                margin="normal"
                variant="filled"
                onChange={(e) => setPassword(e.target.value)}
                sx={{ marginRight: 1 }}
              />
              <TextField
                required
                fullWidth
                label="Confirm Password"
                type="password"
                margin="normal"
                variant="filled"
                onChange={(e) => setConfirmPassword(e.target.value)}
                sx={{ marginLeft: 1 }}
              />
            </Box>
            <FormControl>
              <FormLabel id="demo-row-radio-buttons-group-label">
                Gender
              </FormLabel>
              <RadioGroup
                row
                aria-labelledby="demo-row-radio-buttons-group-label"
                name="row-radio-buttons-group"
                value={gender}
                onChange={handleGenderChange}
              >
                <FormControlLabel
                  value="male"
                  control={<Radio />}
                  label="Male"
                />
                <FormControlLabel
                  value="female"
                  control={<Radio />}
                  label="Female"
                />
              </RadioGroup>
            </FormControl>
            <Button
              sx={{ marginTop: "1rem" }}
              variant="contained"
              color="primary"
              type="submit"
              fullWidth
            >
              Register
            </Button>

            <Typography textAlign={"center"} m={"1rem"}>
              OR
            </Typography>

            <Button fullWidth variant="text" component={Link} to="/login">
              Sign In instead
            </Button>
          </form>
        </>
      </Paper>
    </Container>
  );
};

export default SignUp;
