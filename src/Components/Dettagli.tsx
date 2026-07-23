import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Grid,
  Divider,
  Box,
  Chip,
  Stack,
} from "@mui/material";
import { Boat } from "../types/boat";

interface DettagliProps {
  boat: Boat | null;
  open: boolean;
  onClose: () => void;
}

export const Dettagli: React.FC<DettagliProps> = ({ boat, open, onClose }) => {
  if (!boat) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: "bold", fontSize: "1.5rem" }}>
        {boat.nomebarca}
      </DialogTitle>

      <DialogContent dividers>
        <Box mb={3}>
          <Typography variant="subtitle1" color="text.secondary" gutterBottom>
            Descrizione
          </Typography>
          <Typography variant="body1">
            {boat.descrizione || "Nessuna descrizione disponibile."}
          </Typography>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Griglia dettagli tecnici */}
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Typography variant="body2" color="text.secondary">
              Tipo Imbarcazione
            </Typography>
            <Typography variant="body1" fontWeight="medium">
              {boat.tipo}
            </Typography>
          </Grid>

          <Grid item xs={6}>
            <Typography variant="body2" color="text.secondary">
              Alimentazione
            </Typography>
            <Typography variant="body1" fontWeight="medium">
              {boat.alimentazione}
            </Typography>
          </Grid>

          <Grid item xs={6}>
            <Typography variant="body2" color="text.secondary">
              Capienza Max
            </Typography>
            <Typography variant="body1" fontWeight="medium">
              {boat.capienza} persone
            </Typography>
          </Grid>

          <Grid item xs={6}>
            <Typography variant="body2" color="text.secondary">
              Numero Cabine
            </Typography>
            <Typography variant="body1" fontWeight="medium">
              {boat.cabine}
            </Typography>
          </Grid>

          <Grid item xs={6}>
            <Typography variant="body2" color="text.secondary">
              Lunghezza
            </Typography>
            <Typography variant="body1" fontWeight="medium">
              {boat.lunghezza} metri
            </Typography>
          </Grid>

          <Grid item xs={6}>
            <Typography variant="body2" color="text.secondary">
              Potenza motore
            </Typography>
            <Typography variant="body1" fontWeight="medium">
              {boat.potenza} CV
            </Typography>
          </Grid>
        </Grid>

        <Divider sx={{ my: 2 }} />

        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Costo Giornaliero:</Typography>
          <Chip
            label={`€ ${boat.costo_giornaliero} / gg`}
            color="success"
            sx={{ fontSize: "1.1rem", py: 2, px: 1, fontWeight: "bold" }}
          />
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} variant="contained" color="primary">
          Chiudi
        </Button>
      </DialogActions>
    </Dialog>
  );
};
