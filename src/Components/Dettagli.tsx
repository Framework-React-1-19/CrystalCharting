import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Box, Typography } from "@mui/material";

export function Dettagli() {
  return (
    <Box>
      <Typography>Dettagli Imbarcazione</Typography>
      {/* Qui ci sarà un bottone "Affitta" e bisognerà utilizzare useNavigate per collegarsi al Calendario */}
    </Box>
  );
}
