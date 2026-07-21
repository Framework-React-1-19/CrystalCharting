import { 
  Box, 
  Typography, 
  TextField, 
  Button, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  Grid,
  Paper,
  Divider,
  InputAdornment
} from "@mui/material";

// Icone MUI
import DirectionsBoatIcon from "@mui/icons-material/DirectionsBoat";
import SendIcon from "@mui/icons-material/Send";

export function Inserimento() {
  return (
    <Box sx={{ maxWidth: 900, margin: "auto", p: { xs: 2, md: 4 } }}>
      <Paper elevation={3} sx={{ p: { xs: 3, md: 4 }, borderRadius: 2 }}>
        
        {/* Header con Titolo e Icona */}
        <Box display="flex" alignItems="center" justifyContent="center" gap={1.5} mb={3}>
          <DirectionsBoatIcon color="primary" sx={{ fontSize: 36 }} />
          <Typography variant="h4" component="h1" fontWeight="bold" color="primary">
            Inserisci Nuova Imbarcazione
          </Typography>
        </Box>

        <form>
          <Grid container spacing={3}>

            {/* SEZIONE 1: Informazioni Generali */}
            <Grid item xs={12}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Informazioni Principali
              </Typography>
            </Grid>

            {/* Nome */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                required
                id="nome"
                name="nome"
                label="Nome Barca"
                placeholder="Es: Poseidon"
                variant="outlined"
              />
            </Grid>

            {/* Tipo */}
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel id="tipo-label">Tipo di Barca</InputLabel>
                <Select
                  labelId="tipo-label"
                  id="tipo"
                  name="tipo"
                  defaultValue=""
                  label="Tipo di Barca"
                >
                  <MenuItem value="Vela">Vela</MenuItem>
                  <MenuItem value="Motore">Motore</MenuItem>
                  <MenuItem value="Catamarano">Catamarano</MenuItem>
                  <MenuItem value="Yacht">Yacht</MenuItem>
                  <MenuItem value="Gommone">Gommone</MenuItem>
                  <MenuItem value="Altro">Altro</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* SEZIONE 2: Dettagli Tecnici e Capienza */}
            <Grid item xs={12}>
              <Divider sx={{ my: 1 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom sx={{ mt: 1 }}>
                Specifiche Tecniche & Spazi
              </Typography>
            </Grid>

            {/* Lunghezza */}
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                required
                type="number"
                id="lunghezza"
                name="lunghezza"
                label="Lunghezza"
                placeholder="Es: 12.5"
                InputProps={{
                  endAdornment: <InputAdornment position="end">m</InputAdornment>,
                }}
                inputProps={{ step: "0.1", min: 0 }}
              />
            </Grid>

            {/* Alimentazione */}
            <Grid item xs={12} sm={6} md={4}>
              <FormControl fullWidth required>
                <InputLabel id="alimentazione-label">Alimentazione</InputLabel>
                <Select
                  labelId="alimentazione-label"
                  id="alimentazione"
                  name="alimentazione"
                  defaultValue=""
                  label="Alimentazione"
                >
                  <MenuItem value="Benzina">Benzina</MenuItem>
                  <MenuItem value="Diesel">Diesel</MenuItem>
                  <MenuItem value="Elettrica">Elettrica</MenuItem>
                  <MenuItem value="Ibrida">Ibrida</MenuItem>
                  <MenuItem value="Nessuna (Vela pura)">Nessuna (Vela pura)</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Cabine */}
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                type="number"
                id="cabine"
                name="cabine"
                label="Numero Cabine"
                placeholder="Es: 3"
                inputProps={{ min: 0 }}
              />
            </Grid>

            {/* Capienza Persone */}
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                required
                type="number"
                id="capienza"
                name="capienza"
                label="Capienza Passeggeri"
                placeholder="Es: 8"
                InputProps={{
                  endAdornment: <InputAdornment position="end">persone</InputAdornment>,
                }}
                inputProps={{ min: 1 }}
              />
            </Grid>

            {/* Capacità Serbatoio/Carico */}
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                type="number"
                id="capacita"
                name="capacita"
                label="Capacità Serbatoio"
                placeholder="Es: 200"
                InputProps={{
                  endAdornment: <InputAdornment position="end">L</InputAdornment>,
                }}
                inputProps={{ min: 0 }}
              />
            </Grid>

            {/* Costo Giornaliero */}
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                required
                type="number"
                id="costoGiornaliero"
                name="costoGiornaliero"
                label="Costo Giornaliero"
                placeholder="Es: 350"
                InputProps={{
                  startAdornment: <InputAdornment position="start">€</InputAdornment>,
                  endAdornment: <InputAdornment position="end">/giorno</InputAdornment>,
                }}
                inputProps={{ min: 0 }}
              />
            </Grid>

            {/* SEZIONE 3: Descrizione */}
            <Grid item xs={12}>
              <Divider sx={{ my: 1 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom sx={{ mt: 1 }}>
                Descrizione & Dettagli
              </Typography>
            </Grid>

            {/* Descrizione */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={4}
                id="descrizione"
                name="descrizione"
                label="Descrizione Aggiuntiva"
                placeholder="Inserisci dettagli su dotazioni di bordo, skipper incluso, regole di navigazione, ecc..."
              />
            </Grid>

            {/* Pulsante Invia */}
            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                size="large"
                fullWidth
                endIcon={<SendIcon />}
                sx={{ 
                  mt: 2, 
                  py: 1.5, 
                  fontSize: "1.1rem", 
                  fontWeight: "bold" 
                }}
              >
                Salva Imbarcazione
              </Button>
            </Grid>

          </Grid>
        </form>
      </Paper>
    </Box>
  );
}