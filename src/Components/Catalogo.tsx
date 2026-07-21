import { useState, useEffect } from "react";
import {
  Grid,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Typography,
  Button,
  Chip,
  Stack,
  Box,
} from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import DirectionsBoatIcon from "@mui/icons-material/DirectionsBoat";
import { Link } from "react-router-dom";

interface Barca {
  id: number;
  nomebarca: string;
  tipo: string;
  alimentazione: string;
  capienza: number;
  cabine: number;
  lunghezza: string;
  potenza: string;
  descrizione: string;
  costo: number;
}

export function Catalogo() {
  const [imbarcazioni, setImbarcazioni] = useState<Barca[]>([]);

  useEffect(() => {
    fetch("https://crystalcharting.awardspace.net/api.php?action=get_barche")
      .then((response) => response.json())
      .then((data) => console.log(data));
  });

  return (
    <Box>
      <Typography
        variant="h4"
        component="h1"
        gutterBottom
        sx={{ fontWeight: "bold", mb: 3 }}
      >
        La Nostra Flotta
      </Typography>
      <Grid container spacing={2}></Grid>
    </Box>
  );
}
