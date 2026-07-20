import { useState } from "react";
import {Outlet, useNavigate, Link } from "react-router-dom";
import { Box, Typography } from "@mui/material";

export function Admin() {
  return (
    <Box>
      <Typography>Area Admin</Typography>
      {/* Qui verrà inserita la gestione dei prodotti */}
      <Box>
        {/* QUI dentro React Router caricherà la sotto-pagina (Inserimento) */}
        <Outlet />
      </Box>
    </Box>
  );
}
