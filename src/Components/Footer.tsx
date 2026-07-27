import { Box, Container, Typography, Stack } from "@mui/material";

export function Footer() {
  const teamMembers = ["Ken", "Ben", "Mattia", "Assan"];

  return (
    <Box
      component="footer"
      sx={{
        py: 3,
        px: 2,
        mt: "auto",
        backgroundColor: (theme) =>
          theme.palette.mode === "light"
            ? theme.palette.grey[200]
            : theme.palette.grey[800],
      }}
    >
      <Container maxWidth="xl">
        <Stack
          spacing={2}
          sx={{
            flexDirection: { xs: "column", sm: "row" },
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography variant="body2" color="text.secondary">
            © {new Date().getFullYear()} Noleggio Imbarcazioni
          </Typography>

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              flexWrap: "wrap",
            }}
          >
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ fontWeight: 600, mr: 0.5 }}
            >
              Sviluppato da:
            </Typography>

            {teamMembers.map((member, index) => (
              <Box
                key={member}
                sx={{ display: "flex", alignItems: "center", gap: 1 }}
              >
                <Typography
                  variant="body2"
                  color="text.primary"
                  sx={{ fontWeight: 500 }}
                >
                  {member}
                </Typography>

                {index < teamMembers.length - 1 && (
                  <Typography variant="caption" color="text.secondary">
                    •
                  </Typography>
                )}
              </Box>
            ))}
          </Box>
        </Stack>
      </Container>
    </Box>
  );
}
