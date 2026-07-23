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
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    //dico dal TS a React che: React.FormEvent<HTMLFormElement> è un evento di un form generato specificamente da un elemento HTML <form>
    e.preventDefault();

    const form = e.currentTarget; //form tag
    const formData = new FormData(form);
    const datiForm = Object.fromEntries(formData.entries()); 
    /* formData.entries() restituisce un elenco di coppie [chiave, valore] estratte dal form 
    e Object.fromEntries(...) trasforma quell'elenco in un classico oggetto JavaScript { ... }*/

    //Chiamata API {POST}
    fetch('https://crystalcharting.awardspace.net/api.php?action=add_barca', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json' 
      },
      body: JSON.stringify({
        nomebarca: datiForm.nome,
        tipo: datiForm.tipo,
        alimentazione: datiForm.alimentazione,
        capienza: datiForm.capienza,
        costo_giornaliero: datiForm.costoGiornaliero,
        potenza: datiForm.potenza,
        lunghezza: datiForm.lunghezza,
        cabine: datiForm.cabine,
        capacita: datiForm.capacita,
        descrizione: datiForm.descrizione
      })
    })
    .then(response => {
      if (!response.ok) { // se la risposta è esplosiva
        throw new Error(`Errore Server: ${response.status} ${response.statusText}`);
      }
      return response.json();
    })
    .then(data => {
      console.log("Risposta server:", data);
      alert("Imbarcazione inserita con successo!");
      form.reset(); // Pulisce i campi del form
    })
    .catch(error => {
      console.error("Errore durante l'inserimento:", error);
      alert("Si è verificato un errore durante il salvataggio. Verificare la console.");
    });
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
              id="nome"
              name="nome"
              label="Nome Barca"
              placeholder="Es: Poseidon"
              sx={{ mt : 2}}/>

            {/* scelta tipo barca COMBOBOX */}
            <Box display="flex" sx={{ gap:2 }} flexDirection={{ xs: "column", sm: "row" }}>
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
            <Box display="flex" gap={2} flexDirection={{ xs: "column", sm: "row" }}>
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
            <Box display="flex" gap={2} flexDirection={{ xs: "column", sm: "row" }}>
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

            {/* capacità del serbatoio del carburante */}
            <Box display="flex" gap={2} flexDirection={{ xs: "column", sm: "row" }}>
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
                }}/>

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
                id="costoGiornaliero"
                name="costoGiornaliero"
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