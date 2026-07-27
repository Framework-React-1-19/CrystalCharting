import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Grid,
  Box,
  Chip,
  Stack,
} from "@mui/material";
import { Boat } from "../types/boat";
import Calendario from "./Calendario";
import { BoatDivider } from "./BoatDivider";

interface DettagliProps {
  boat: Boat | null;
  open: boolean;
  onClose: () => void;
}

export const Dettagli: React.FC<DettagliProps> = ({ boat, open, onClose }) => {
  if (!boat) return null;

  const [calendar, setCalendarOpen] = useState<boolean>(false);

  const handleOpenModal = () => {
    setCalendarOpen(true);
  };

  const handleCloseCalendar = () => {
    setCalendarOpen(false);
  };

  return (
    <>
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

          <BoatDivider />

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

          <BoatDivider />

          <Box 
            display="flex" 
            flexDirection={{ xs: "column", sm: "row" }}
            justifyContent="space-between" 
            alignItems={{ xs: "flex-start", sm: "center" }}
            gap={{ xs: 1.5, sm: 0 }}
            sx={{ width: "100%", flexGrow: 1, py: 1 }}>

            <Typography variant="h6" color="text.secondary">
              Costo Giornaliero:
            </Typography>

            <Stack 
              direction="row" 
              alignItems="center" 
              justifyContent={{ xs: "space-between", sm: "flex-end" }}
              spacing={{ xs: 2, sm: 3 }}
              sx={{ width: { xs: "100%", sm: "auto" }, marginLeft: "auto" }}>

              <Chip
                label={`€ ${boat.costo_giornaliero} / gg`}
                color="success"
                sx={{ fontWeight: "bold", height: "auto", py: 1, px: 1.5 }}/>

              <Button
                variant="contained"
                color="primary"
                onClick={handleOpenModal}
                sx={{ fontWeight: "bold", px: 3 }}>
                Prenota
              </Button>
            </Stack>
          </Box>
        </DialogContent>

        <DialogActions>
          <Button onClick={onClose} variant="contained" color="primary">
            Chiudi
          </Button>
        </DialogActions>
      </Dialog>


      <Calendario 
        boat={boat} 
        open={calendar} 
        onClose={handleCloseCalendar}
      />
    </>
  );
};
