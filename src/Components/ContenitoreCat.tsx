import { useState } from "react";
import { Outlet, useNavigate, Link } from "react-router-dom";
import { Box, Typography } from "@mui/material";

export function ContenitoreCat() {
  return (
    <Box>
      <Typography>Catalogo</Typography>
      <Box>
        <Outlet />
      </Box>
    </Box>
  );
}
