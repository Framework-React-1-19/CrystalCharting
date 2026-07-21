import { useState } from "react";
import { Outlet, useNavigate, Link } from "react-router-dom";
import { Box, Typography } from "@mui/material";

export function ContenitoreAd() {
  return (
    <Box>
      <Typography>Admin</Typography>
      <Box>
        <Outlet />
      </Box>
    </Box>
  );
}
