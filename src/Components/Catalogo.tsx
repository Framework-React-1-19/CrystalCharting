import { useState } from "react";
import { Outlet, useNavigate, Link } from "react-router-dom";
import { Box, Typography } from "@mui/material";

export function Catalogo() {
  return (
    <Box>
      <Typography>Catalogo Imbarcazioni</Typography>
      {/* Qui verrà creata la griglia con le card delle imbarcazioni */}
      <Box>
        {/* QUI dentro React Router caricherà la sotto-pagina modale (Dettagli) */}
        <Outlet />
      </Box>
    </Box>
  );
}
