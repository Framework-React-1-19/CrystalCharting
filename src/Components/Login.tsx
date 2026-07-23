import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  InputAdornment,
  IconButton,
  Avatar
} from "@mui/material";

// Icone MUI
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

export function Login() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(false);

  const handleClickShowPassword = () => setShowPassword((show) => !show);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!password) {
      setError(true);
      return;
    }

    if (password === "admin123") {
      navigate("/admin/inserimento");
    } else {
      setError(true);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "80vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: 2,
      }}>
      <Paper
        elevation={4}
        sx={{
          p: { xs: 3, sm: 4 },
          width: "100%",
          maxWidth: 400,
          borderRadius: 3,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}>
        {/* Icona di sicurezza */}
        <Avatar
          sx={{
            m: 1,
            bgcolor: "primary.main",
            width: 56,
            height: 56,
            boxShadow: 2,
          }}>
          <LockOutlinedIcon sx={{ fontSize: 32 }} />
        </Avatar>

        {/* Intestazione */}
        <Typography component="h1" variant="h5" sx={{fontWeight: "bold", mt: 1}}>
          Area Riservata
        </Typography>
        
        <Typography 
          variant="body2" 
          color="text.secondary" 
          mb={3} 
          align="center">
          Inserisci la password di amministrazione per accedere al gestionale staff.
        </Typography>

        {/* Form di Accesso */}
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ width: "100%" }}>
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password Admin"
            type={showPassword ? "text" : "password"}
            id="password"
            autoComplete="current-password"
            autoFocus
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (error) setError(false);
            }}
            error={error}
            helperText={error ? "Password errata o campo vuoto" : ""}
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="mostra o nascondi password"
                      onClick={handleClickShowPassword}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            sx={{
              mt: 3,
              mb: 2,
              py: 1.2,
              fontSize: "1rem",
              fontWeight: "bold",
              borderRadius: 2,
            }}>
            Accedi
          </Button>

          <Box sx={{ display: "flex", justifyContent: "center", mt: 1 }}>
            <Button
              component={Link}
              to="/"
              startIcon={<ArrowBackIcon />}
              color="inherit"
              size="small"
              sx={{ color: "text.secondary", textTransform: "none" }}>
              Torna al sito principale
            </Button>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}