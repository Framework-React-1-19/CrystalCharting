import React from "react";
import {
  Card,
  CardMedia,
  CardContent,
  CardActionArea,
  Typography,
  Chip,
  Stack,
} from "@mui/material";
import DirectionsBoatIcon from "@mui/icons-material/DirectionsBoat";
import GroupsIcon from "@mui/icons-material/Groups";
import StraightenIcon from "@mui/icons-material/Straighten";
import { Boat } from "../types/boat";

interface BoatCardProps {
  boat: Boat;
  onSelect: (boat: Boat) => void;
}

// Immagine segnaposto predefinita per le barche
const PLACEHOLDER_IMAGE =
  "https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?auto=format&fit=crop&w=600&q=80";

export const BoatCard: React.FC<BoatCardProps> = ({ boat, onSelect }) => {
  return (
    <Card
      sx={{
        height: { xs: 430, sm: 450 },
        minHeight: { xs: 430, sm: 450 },
        width: "100%",
        display: "flex",
        flexDirection: "column",
        flex: 1,
        transition: "transform 0.2s, box-shadow 0.2s",
        overflow: "hidden",
        alignSelf: "stretch",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: 6,
        },
      }}
    >
      <CardActionArea
        onClick={() => onSelect(boat)}
        sx={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "stretch",
          flex: 1,
        }}
      >
        <CardMedia
          component="img"
          height="180"
          image={PLACEHOLDER_IMAGE}
          alt={boat.nomebarca}
          sx={{ objectFit: "cover" }}
        />
        <CardContent
          sx={{
            flexGrow: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            gap: 1.5,
          }}
        >
          <Box>
            <Typography
              gutterBottom
              variant="h6"
              component="div"
              sx={{
                fontWeight: "bold",
                minHeight: 56,
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              {boat.nomebarca}
            </Typography>

            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              A partire da <strong>€{boat.costo_giornaliero}</strong> / giorno
            </Typography>
          </Box>

          {/* Badge con le informazioni principali */}
          <Stack
            direction="row"
            spacing={1}
            useFlexGap
            sx={{ flexWrap: "wrap" }}
          >
            <Chip
              icon={<DirectionsBoatIcon fontSize="small" />}
              label={boat.tipo}
              color="primary"
              variant="outlined"
              size="small"
            />

            <Chip
              icon={<GroupsIcon fontSize="small" />}
              label={`${boat.capienza} persone`}
              size="small"
            />

            <Chip
              icon={<StraightenIcon fontSize="small" />}
              label={`${boat.lunghezza} m`}
              size="small"
            />
          </Stack>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};
