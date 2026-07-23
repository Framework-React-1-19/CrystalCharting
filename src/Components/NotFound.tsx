import { useState } from 'react';
import { Link } from "react-router-dom";
import { 
  Box, 
  Typography, 
  Button, 
  Paper, 
  Container 
} from "@mui/material";

// Icone MUI
import HomeIcon from "@mui/icons-material/Home";
import NavigationIcon from "@mui/icons-material/Navigation";

export function NotFound() {
  
  const [coloreErrore] = useState(() => {
    const colori = ["#0284c7", "#06b6d4", "#0d9488"];
    const indice = Math.floor(Math.random() * colori.length);
    return colori[indice];
  });
  

  return (
    <Container maxWidth="md">
      <Box
        sx={{
          minHeight: "80vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          py: 4,
        }}>

        <Paper
          elevation={24}
          sx={{
            p: { xs: 4, md: 6 }, //lato responsive
            borderRadius: 3,
            textAlign: "center",
            width: "100%",
            maxWidth: 600,
            background: (theme) =>
              theme.palette.mode === "light" ? "linear-gradient(180deg, #FFFFFF 0%, #e8e8e8 100%)" : "default",
          }}>
            
          {/* Icona decorativa con rotazione */}
          <Box
            sx={{
              display: "inline-flex",
              p: 2,
              borderRadius: "50%",
              bgcolor: "primary.50",
              color: "primary.main",
              mb: 2,
            }}>
            <NavigationIcon
              sx={{
                fontSize: { xs: 48, sm: 64 },
                transform: "rotate(-45deg)",
                animation: "float 3s ease-in-out infinite",
                "@keyframes float": {
                  "0%, 100%": { transform: "translateY(0px) rotate(-45deg)" },
                  "50%": { transform: "translateY(-8px) rotate(-35deg)" },
                }
              }}
            />
          </Box>

          {/* Codice Errore 404 */}
          <Typography
            variant="h1"
            component="div"
            sx={{
              fontWeight: "900",
              fontSize: { xs: "5rem", sm: "7rem" },
              lineHeight: 1,
              letterSpacing: "-2px",
              mb: 1,
              color: coloreErrore,
            }}>
            404
          </Typography>

          {/* Titolo Messaggio */}
          <Typography
            variant="h5"
            component="h1"
            sx={{fontWeight: "bold"}}
            gutterBottom>
            Pagina Non Trovata
          </Typography>

          {/* Sottotitolo descrittivo */}
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ mb: 4, maxWidth: 420, mx: "auto" }}>
            Sembra che tu sia andato fuori rotta! La pagina che stai cercando non esiste o è stata spostata.
          </Typography>

          {/* Pulsante di Ritorno */}
          <Button
            component={Link}
            to="/"
            variant="contained"
            color="primary"
            size="large"
            startIcon={<HomeIcon />}
            sx={{
              px: 4,
              py: 1.5,
              borderRadius: 2,
              fontSize: "1rem",
              fontWeight: "bold",
              boxShadow: 3,
              textTransform: "none",
            }}>
            Torna al Porto
          </Button>
        </Paper>
      </Box>
    </Container>
  );
}