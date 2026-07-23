import { useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  Divider,
  InputAdornment,
  Stack
} from "@mui/material";

// Icone MUI
import DirectionsBoatIcon from "@mui/icons-material/DirectionsBoat";
import SendIcon from "@mui/icons-material/Send";

export function Inserimento() {

  // Funzione all'evento submit del form
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    const form = e.currentTarget;

    //creazione del body per la request API
    const dati = new FormData(form);
    
    try {
      const response = await fetch('https://crystalcharting.awardspace.net/api.php?action=add_barca', {
        method: 'POST',
        body: dati,
      });

      const risposta = await response.text();

      if (risposta.trim() === "OK") {
        alert("Barca aggiunta con successo!");
        form.reset(); // Pulisce i campi del form
      } else {
        alert("Errore dal server: " + risposta);
      }
    } catch (error) {
      console.error("Errore di rete:", error);
      alert("Impossibile contattare il server. Controlla la connessione!");
    }
  };

  return (
    <Box sx={{ maxWidth: 650, margin: "auto", p: { xs: 2, md: 3 } }}>
      <Paper elevation={3} sx={{ p: { xs: 3, md: 4 }, borderRadius: 3 }}>

        {/* Header */}
        <Box display="flex" alignItems="center" justifyContent="center" gap={2} mb={3}>
          <DirectionsBoatIcon color="primary" sx={{ fontSize: 32 }} />
          <Typography variant="h5" component="h1" sx={{fontWeight: "bold", color: "primary"}}>
            {/* variant="h5": Definisce la dimensione e lo stile del testo - component="h1": Cambia il tag HTML generato*/}
            Inserisci Nuova Imbarcazione
          </Typography>
        </Box>

        <form onSubmit={handleSubmit}>
          <Stack spacing={2}> {/* spazio tra gli elementi */}

            {/* SEZIONE 1: Info Principali */}
            <Typography variant="subtitle1" sx={{fontWeight: "bold", color: "text.secondary"}}>
              Informazioni Principali
            </Typography>

            {/* input nome */}
            <TextField
              fullWidth
              required
              id="nomebarca"
              name="nomebarca"
              label="Nome Barca"
              placeholder="Es: Poseidon"
              sx={{ mt : 2}}/>

            {/* scelta tipo barca COMBOBOX */}
            <Box sx={{ gap:2, display: "flex", flexDirection: { xs: "column", sm: "row" } }}>
              <FormControl fullWidth required sx={{ mt : 2 }}>
                <InputLabel id="tipo-label">Tipo di Barca</InputLabel>
                <Select
                  labelId="tipo-label"
                  id="tipo"
                  name="tipo"
                  defaultValue=""
                  label="Tipo di Barca">
                  <MenuItem value="Vela">Vela</MenuItem>
                  <MenuItem value="Motore">Vetroresina</MenuItem>
                  <MenuItem value="Catamarano">Catamarano</MenuItem>
                  <MenuItem value="Yacht">Yacht</MenuItem>
                  <MenuItem value="Gommone">Gommone</MenuItem>
                  <MenuItem value="Altro">Altro</MenuItem>
                </Select>
              </FormControl>

            {/* scelta alimentazione COMBOBOX */}
              <FormControl fullWidth required sx={{ mt : 2 }}>
                <InputLabel id="alimentazione-label">Alimentazione</InputLabel>
                <Select
                  labelId="alimentazione-label"
                  id="alimentazione"
                  name="alimentazione"
                  defaultValue=""
                  label="Alimentazione">
                  <MenuItem value="Benzina">Benzina</MenuItem>
                  <MenuItem value="Diesel">Diesel</MenuItem>
                  <MenuItem value="Elettrica">Elettrica</MenuItem>
                  <MenuItem value="Nessuna (Vela pura)">Nessuna (Vela pura)</MenuItem>
                </Select>
              </FormControl>
            </Box>

            <Divider 
              sx={{ 
                height: "2px",
                border: "none",
                position: "relative",
                overflow: "hidden",
                backgroundColor: "#bae6fd",
                my: 3,
                "&::after": {
                  content: '""',
                  position: "absolute",
                  top: 0,
                  left: "-100%",
                  width: "100%",
                  height: "100%",
                  background: "linear-gradient(90deg, transparent, #0284c7, transparent)",
                  animation: "wave 3s infinite linear",
                },
                "@keyframes wave": {
                  "0%": { left: "-100%" },
                  "100%": { left: "100%" }
                }
              }} 
            />

            {/* SEZIONE 2: Specifiche Tecniche */}
            <Typography variant="subtitle1" sx={{fontWeight: "bold", color: "text.secondary"}}>
              Specifiche Tecniche & Spazi
            </Typography>

            {/* lunghezza */}
            <Box sx={{display: "flex", gap: 2, flexDirection: { xs: "column", sm: "row" } }}>
              <TextField
                fullWidth
                required
                type="number"
                id="lunghezza"
                name="lunghezza"
                label="Lunghezza"
                placeholder="12.5"
                sx={{ mt : 0.5 }}
                slotProps={{
                  input: {
                    startAdornment: <InputAdornment position="start">Metri</InputAdornment>,
                  },
                  htmlInput: {
                    step: "0.25",
                    min: 0,
                  }
                }}/>
            </Box>

            {/* cabine */}
            <Box sx={{display: "flex", gap: 2, flexDirection: { xs: "column", sm: "row" } }}>
              <TextField
                fullWidth
                type="number"
                id="cabine"
                name="cabine"
                label="Numero Cabine"
                placeholder="3"
                sx={{ mt : 2}}
                inputProps={{
                  htmlInput: {
                    step: "1",
                    min: 0,
                  }
                }}/>

              <TextField
                fullWidth
                required
                type="number"
                id="capienza"
                name="capienza"
                label="Capienza"
                placeholder="8"
                sx={{ mt : 2}}
                InputProps={{
                  endAdornment: <InputAdornment position="end">persone</InputAdornment>,
                }}
                inputProps={{ min: 1 }}/>
            </Box>

            
            <Box sx={{display: "flex", gap: 2, flexDirection: { xs: "column", sm: "row" } }}>
            {/* capacità del serbatoio del carburante 
              <TextField
                fullWidth
                type="number"
                id="capacita"
                name="capacita"
                label="Capacità Serbatoio"
                placeholder="200"
                sx={{ mt : 2}}
                slotProps={{
                  input: {
                    startAdornment: <InputAdornment position="start">Litri</InputAdornment>,
                  },
                  htmlInput: {
                    step: "0.1",
                    min: 0,
                  }
                }}/>*/}

              {/* potenza */}
              <TextField
                fullWidth
                type="number"
                id="potenza"
                name="potenza"
                label="Potenza Motore"
                placeholder="150"
                sx={{ mt : 2}}
                slotProps={{
                  input: {
                    startAdornment: <InputAdornment position="start">kW</InputAdornment>,
                  },
                  htmlInput: {
                    step: "0.1",
                    min: 0,
                  }
                }}/>
            </Box>

            <Divider 
              sx={{ 
                height: "2px",
                border: "none",
                position: "relative",
                overflow: "hidden",
                backgroundColor: "#bae6fd",
                my: 3,
                "&::after": {
                  content: '""',
                  position: "absolute",
                  top: 0,
                  left: "-100%",
                  width: "100%",
                  height: "100%",
                  background: "linear-gradient(90deg, transparent, #0284c7, transparent)",
                  animation: "wave 3s infinite linear",
                },
                "@keyframes wave": {
                  "0%": { left: "-100%" },
                  "100%": { left: "100%" }
                }
              }} 
            />

            {/* SEZIONE 3: Descrizione */}
            <Typography variant="subtitle1" sx={{fontWeight: "bold", color: "text.secondary"}}>
              Descrizione
            </Typography>

            <TextField 
              fullWidth
              multiline
              rows={3}
              id="descrizione"
              name="descrizione"
              label="Note e dettagli aggiuntivi"
              placeholder="Esempio: Dotazioni di bordo, skipper incluso, ecc..."/>

              <Divider 
              sx={{ 
                height: "2px",
                border: "none",
                position: "relative",
                overflow: "hidden",
                backgroundColor: "#bae6fd",
                my: 3,
                "&::after": {
                  content: '""',
                  position: "absolute",
                  top: 0,
                  left: "-100%",
                  width: "100%",
                  height: "100%",
                  background: "linear-gradient(90deg, transparent, #0284c7, transparent)",
                  animation: "wave 3s infinite linear",
                },
                "@keyframes wave": {
                  "0%": { left: "-100%" },
                  "100%": { left: "100%" }
                }
              }} 
            />

              {/* costo */}
              <Typography variant="subtitle1" sx={{fontWeight: "bold", color: "text.secondary"}}>
              Costo
              </Typography>
              <TextField
                fullWidth
                required
                type="number"
                id="costo_giornaliero"
                name="costo_giornaliero"
                label="Costo Giornaliero"
                placeholder="350"
                InputProps={{
                  startAdornment: <InputAdornment position="start">€</InputAdornment>,
                  endAdornment: <InputAdornment position="end">/giorno</InputAdornment>,
                }}
                inputProps={{ min: 0 }}/>

            {/* Pulsante Invio */}
            <Button
              type="submit"
              variant="contained"
              size="large"
              endIcon={<SendIcon />}
              sx={{
                mt: 1,
                py: 1.3,
                fontSize: "1rem",
                fontWeight: "bold",
                borderRadius: 2
              }}>
              Salva Imbarcazione
            </Button>

          </Stack>
        </form>
      </Paper>
    </Box>
  );
}