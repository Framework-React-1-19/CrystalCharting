import { useState } from 'react';
import { Box, Container, Stack } from "@mui/material";
import { Inserimento } from "./Inserimento";
import { CalendarioAdmin } from "./CalendarioAdmin";
import { Login } from './Login';

export function Admin() {
  const handleLogout = () => {
    localStorage.removeItem("isAdminAuth");
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }} >
      <Stack spacing={5} sx={{ alignItems: "center" }}>
        <Inserimento />

        <CalendarioAdmin />
      </Stack>
    </Container>
  );
}