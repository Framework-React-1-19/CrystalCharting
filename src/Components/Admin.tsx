import { Container, Stack } from "@mui/material";
import { Inserimento } from "./Inserimento";
import { CalendarioAdmin } from "./CalendarioAdmin";

export function Admin() {

  return (
    <Container maxWidth="lg" sx={{ py: 4 }} >
      <Stack spacing={5} sx={{ alignItems: "center" }}>
        <Inserimento />

        <CalendarioAdmin />
      </Stack>
    </Container>
  );
}