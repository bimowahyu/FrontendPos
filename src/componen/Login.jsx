import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Login, reset } from "../fitur/AuthSlice";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import {
  FormControl,
  InputLabel,
  OutlinedInput,
  Stack,
  Button,
  FormControlLabel,
  Checkbox,
  Box,
  Typography,
  InputAdornment,
  IconButton,
} from "@mui/material";
// import smk9logo from "../images/smk9logo.webp";
import { Eye, EyeSlash } from "@phosphor-icons/react";

const MySwal = withReactContent(Swal);

export const LoginPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [isManualLogin, setIsManualLogin] = useState(false);

  const { user, isError, isSuccess, isLoading, message } = useSelector(
    (state) => state.auth
  );

  useEffect(() => {
    const savedUsername = localStorage.getItem("username");
    const savedPassword = localStorage.getItem("password");
    if (savedUsername && savedPassword) {
      setUsername(savedUsername);
      setPassword(savedPassword);
      setRememberMe(true);
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      Swal.fire({
        icon: "warning",
        title: "Peringatan",
        text: "Username dan password wajib diisi!",
        confirmButtonText: "OK",
      });
      return;
    }

    setIsManualLogin(true);
    try {
      // eslint-disable-next-line no-unused-vars
      const result = await dispatch(Login({ username, password })).unwrap();
      
      if (rememberMe) {
        localStorage.setItem("username", username);
        localStorage.setItem("password", password);
      } else {
        localStorage.removeItem("username");
        localStorage.removeItem("password");
      }

    } catch (error) {
      let errorMessage = "Terjadi kesalahan saat login";

      if (typeof error === 'string') {
        errorMessage = error;
      } else if (error?.msg) {
        errorMessage = error.msg;
      } else if (error?.message) {
        errorMessage = error.message;
      }

      Swal.fire({
        icon: "error",
        title: "Login Gagal",
        text: errorMessage,
        confirmButtonText: "OK"
      });
      dispatch(reset());
      setIsManualLogin(false);
    }
  };

  useEffect(() => {
    if (isSuccess && user && isManualLogin) {
      const userData = user.data || user;
      Swal.fire({
        icon: "success",
        title: "Login Berhasil!",
        text: `Selamat datang kembali, ${userData.username}`,
        showConfirmButton: false,
        timer: 2000,
      });

      const userRole = userData.role;
      if (userRole === "admin") {
        navigate("/dashboardadmin");
      } else if (userRole === "kasir") {
        navigate("/dashboardkasir");
      } else {
        Swal.fire({
        icon: "false",
        title: "Akses Di tolak",
       // text: `Selamat datang kembali, ${userData.username}`,
        showConfirmButton: false,
        timer: 2000,
      });
      }

      dispatch(reset());
      setIsManualLogin(false);
    }
    if (isError && isManualLogin) {
      let errorMessage = "Terjadi kesalahan saat login";
      if (typeof message === 'string') {
        errorMessage = message;
      } else if (message?.msg) {
        errorMessage = message.msg;
      } else if (message?.message) {
        errorMessage = message.message;
      }

      Swal.fire({
        icon: "error",
        title: "Login Gagal",
        text: errorMessage,
        confirmButtonText: "OK"
      });
      dispatch(reset());
      setIsManualLogin(false);
    }
  }, [isSuccess, isError, message, user, navigate, dispatch, isManualLogin])

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#f5f5f5",
      }}
    >
      <Box
        sx={{
          maxWidth: "400px",
          width: "100%",
          p: 4,
          backgroundColor: "white",
          borderRadius: 2,
          boxShadow: 3,
        }}
      >
        <Stack spacing={3}>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              mb: 2,
            }}
          >
            {/* <img
              src={smk9logo}
              alt="SMK 9 Logo"
              style={{
                width: "100px",
                height: "100px",
                objectFit: "contain",
                marginBottom: "1rem",
              }}
            /> */}
            <Typography variant="h5" component="h1" gutterBottom>
              Login
            </Typography>
          </Box>

          <form onSubmit={handleLogin}>
            <Stack spacing={3}>
              <FormControl variant="outlined" fullWidth>
                <InputLabel htmlFor="username">Username</InputLabel>
                <OutlinedInput
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  label="Username"
                />
              </FormControl>

              <FormControl variant="outlined" fullWidth>
                <InputLabel htmlFor="password">Password</InputLabel>
                <OutlinedInput
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  endAdornment={
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? (
                          <EyeSlash size={20} />
                        ) : (
                          <Eye size={20} />
                        )}
                      </IconButton>
                    </InputAdornment>
                  }
                  label="Password"
                />
              </FormControl>

              <FormControlLabel
                control={
                  <Checkbox
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    color="primary"
                  />
                }
                label="Remember me"
              />

              <Button
                type="submit"
                variant="contained"
                color="primary"
                size="large"
                disabled={isLoading}
                sx={{
                  height: "48px",
                  textTransform: "none",
                  fontSize: "16px",
                }}
              >
                {isLoading ? "Loading..." : "Login"}
              </Button>
            </Stack>
          </form>
        </Stack>
      </Box>
    </Box>
  );
};

