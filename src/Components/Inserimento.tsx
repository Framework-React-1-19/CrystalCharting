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

import DirectionsBoatIcon from "@mui/icons-material/DirectionsBoat";
import SendIcon from "@mui/icons-material/Send";

export function Inserimento() {

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    const form = e.currentTarget;
    const dati = new FormData(form);
    
    try {
      const response = await fetch('api.php?action=add_barca', {
        method: 'POST',
        body: dati,
      });

      const risposta = await response.text();

      if (risposta.trim() === "OK") {
        alert("Barca aggiunta con successo!");
        form.reset();
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
        <Box display="flex" alignItems="center" justifyContent="center" gap={2} mb={3}>
          <DirectionsBoatIcon color="primary" sx={{ fontSize: 32 }} />
          <Typography variant="h5" component="h1" sx={{fontWeight: "bold", color: "primary"}}>
            Inserisci Nuova Imbarcazione
          </Typography>
        </Box>

        <form onSubmit={handleSubmit}>
          <Stack spacing={2}>
            <Typography variant="subtitle1" sx={{fontWeight: "bold", color: "text.secondary"}}>
              Informazioni Principali
            </Typography>

            <TextField fullWidth required id="nomebarca" name="nomebarca" label="Nome Barca" placeholder="Es: Poseidon" sx={{ mt : 2}}/>

            <Box sx={{ gap:2, display: "flex", flexDirection: { xs: "column", sm: "row" } }}>
              <FormControl fullWidth required sx={{ mt : 2 }}>
                <InputLabel id="tipo-label">Tipo di Barca</InputLabel>
                <Select labelId="tipo-label" id="tipo" name="tipo" defaultValue="" label="Tipo di Barca">
                  <MenuItem value="Vela">Vela</MenuItem>
                  <MenuItem value="Motore">Vetroresina</MenuItem>
                  <MenuItem value="Catamarano">Catamarano</MenuItem>
                  <MenuItem value="Yacht">Yacht</MenuItem>
                  <MenuItem value="Gommone">Gommone</MenuItem>
                  <MenuItem value="Altro">Altro</MenuItem>
                </Select>
              </FormControl>

              <FormControl fullWidth required sx={{ mt : 2 }}>
                <InputLabel id="alimentazione-label">Alimentazione</InputLabel>
                <Select labelId="alimentazione-label" id="alimentazione" name="alimentazione" defaultValue="" label="Alimentazione">
                  <MenuItem value="Benzina">Benzina</MenuItem>
                  <MenuItem value="Diesel">Diesel</MenuItem>
                  <MenuItem value="Elettrica">Elettrica</MenuItem>
                  <MenuItem value="Nessuna (Vela pura)">Nessuna (Vela pura)</MenuItem>
                </Select>
              </FormControl>
            </Box>

            <Divider sx={{ my: 2 }} />

            <Typography variant="subtitle1" sx={{fontWeight: "bold", color: "text.secondary"}}>
              Specifiche Tecniche & Spazi
            </Typography>

            <Box sx={{display: "flex", gap: 2, flexDirection: { xs: "column", sm: "row" } }}>
              <TextField
                fullWidth
                required
                type="number"
                id="lunghezza"
                name="lunghezza"
                label="Lunghezza"
                placeholder="12.5"
                slotProps={{
                  input: { startAdornment: <InputAdornment position="start">Metri</InputAdornment> },
                  htmlInput: { step: "0.25", min: 0 }
                }}/>
            </Box>

            <Box sx={{display: "flex", gap: 2, flexDirection: { xs: "column", sm: "row" } }}>
              <TextField fullWidth type="number" id="cabine" name="cabine" label="Numero Cabine" placeholder="3" />
              <TextField fullWidth required type="number" id="capienza" name="capienza" label="Capienza" placeholder="8" InputProps={{ endAdornment: <InputAdornment position="end">persone</InputAdornment> }} />
            </Box>

            <Box sx={{display: "flex", gap: 2, flexDirection: { xs: "column", sm: "row" } }}>
              <TextField fullWidth type="number" id="potenza" name="potenza" label="Potenza Motore" placeholder="150" slotProps={{ input: { startAdornment: <InputAdornment position="start">kW</InputAdornment> } }} />
            </Box>

            <Divider sx={{ my: 2 }} />

            <Typography variant="subtitle1" sx={{fontWeight: "bold", color: "text.secondary"}}>
              Descrizione
            </Typography>

            <TextField fullWidth multiline rows={3} id="descrizione" name="descrizione" label="Note e dettagli aggiuntivi" />

            <Divider sx={{ my: 2 }} />

            <Typography variant="subtitle1" sx={{fontWeight: "bold", color: "text.secondary"}}>
              Costo
            </Typography>

            <TextField fullWidth required type="number" id="costo_giornaliero" name="costo_giornaliero" label="Costo Giornaliero" placeholder="350" InputProps={{ startAdornment: <InputAdornment position="start">€</InputAdornment>, endAdornment: <InputAdornment position="end">/giorno</InputAdornment> }} />

            <Button type="submit" variant="contained" size="large" endIcon={<SendIcon />} sx={{ mt: 1, py: 1.3, fontSize: "1rem", fontWeight: "bold", borderRadius: 2 }}>
              Salva Imbarcazione
            </Button>
          </Stack>
        </form>
      </Paper>
    </Box>
  );
}