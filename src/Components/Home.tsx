import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
} from "@mui/material";
import { Link } from "react-router-dom";
import DirectionsBoatIcon from "@mui/icons-material/DirectionsBoat";
import AnchorIcon from "@mui/icons-material/Anchor";
import SecurityIcon from "@mui/icons-material/Security";
import SupportAgentIcon from "@mui/icons-material/SupportAgent";
import heroVideo from "../assets/crystal.mp4";

const FEATURES = [
  {
    icon: <DirectionsBoatIcon sx={{ fontSize: 40, color: "primary.main" }} />,
    title: "Flotta Esclusiva",
    description:
      "Imbarcazioni eleganti, moderne e costantemente manutenzionate per offrirti la massima sicurezza.",
  },
  {
    icon: <AnchorIcon sx={{ fontSize: 40, color: "primary.main" }} />,
    title: "Esperienze Su Misura",
    description:
      "Dalle uscite giornaliere alle lunghe crociere, personalizziamo ogni dettaglio della tua navigazione.",
  },
  {
    icon: <SecurityIcon sx={{ fontSize: 40, color: "primary.main" }} />,
    title: "Sicurezza Garantita",
    description:
      "Equipaggiamenti all’avanguardia e skipper professionisti con anni di esperienza in mare.",
  },
  {
    icon: <SupportAgentIcon sx={{ fontSize: 40, color: "primary.main" }} />,
    title: "Assistenza 24/7",
    description:
      "Un team dedicato sempre a tua disposizione prima, durante e dopo il tuo viaggio in barca.",
  },
];

export function Home() {
  return (
    <Box>
      <Box
        sx={{
          position: "relative",
          minHeight: { xs: "70vh", md: "80vh" },
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
          textAlign: "center",
          borderRadius: 2,
          overflow: "hidden",
          mb: 6,
          px: 2,
        }}
      >
        <Box
          component="video"
          autoPlay
          loop
          muted
          playsInline
          src={heroVideo}
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            zIndex: 0,
          }}
        />

        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0, 0, 0, 0.50)",
            zIndex: 1,
          }}
        />

        <Container maxWidth="md" sx={{ position: "relative", zIndex: 2 }}>
          <Typography
            variant="h2"
            component="h1"
            sx={{
              fontWeight: 800,
              fontSize: { xs: "2.2rem", sm: "3.2rem", md: "4rem" },
              mb: 2,
              letterSpacing: "-0.5px",
              textShadow: "0px 2px 8px rgba(0,0,0,0.6)",
            }}
          >
            Crystal Charting
          </Typography>

          <Typography
            variant="h5"
            sx={{
              mb: 4,
              fontWeight: 300,
              fontSize: { xs: "1.1rem", sm: "1.4rem" },
              maxWidth: "700px",
              mx: "auto",
              opacity: 0.95,
              textShadow: "0px 1px 4px rgba(0,0,0,0.6)",
            }}
          >
            Esplora le acque più affascinanti a bordo delle nostre imbarcazioni
            di lusso. Noleggio semplice, trasparente e indimenticabile.
          </Typography>

          <Box sx={{ display: "flex", justifyContent: "center" }}>
            <Button
              variant="contained"
              size="large"
              component={Link}
              to="/catalogo"
              sx={{
                px: 5,
                py: 1.8,
                fontSize: "1.1rem",
                fontWeight: "bold",
                borderRadius: 2,
                boxShadow: 3,
              }}
            >
              Esplora la Flotta
            </Button>
          </Box>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ mb: 8 }}>
        <Box sx={{ textAlign: "center", mb: 5 }}>
          <Typography
            variant="h4"
            component="h2"
            sx={{ fontWeight: "bold", mb: 1 }}
          >
            Perché Scegliere Crystal Charting
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Offriamo uno standard elevato per rendere la tua esperienza di
            navigazione unica e senza pensieri.
          </Typography>
        </Box>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, 1fr)",
              md: "repeat(4, 1fr)",
            },
            gap: 3,
          }}
        >
          {FEATURES.map((feature, index) => (
            <Card
              key={index}
              elevation={1}
              sx={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                textAlign: "center",
                transition:
                  "transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: 4,
                },
              }}
            >
              <CardContent sx={{ flexGrow: 1, py: 4 }}>
                <Box sx={{ mb: 2 }}>{feature.icon}</Box>
                <Typography
                  variant="h6"
                  component="h3"
                  sx={{ fontWeight: "bold", mb: 1 }}
                >
                  {feature.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {feature.description}
                </Typography>
              </CardContent>
            </Card>
          ))}
        </Box>
      </Container>

      <Box
        sx={{
          backgroundColor: "primary.main",
          color: "primary.contrastText",
          borderRadius: 2,
          p: { xs: 4, md: 6 },
          textAlign: "center",
          mb: 4,
        }}
      >
        <Typography
          variant="h4"
          component="h2"
          sx={{ fontWeight: "bold", mb: 2 }}
        >
          Pronto per Salpare?
        </Typography>
        <Typography
          variant="body1"
          sx={{ mb: 3, opacity: 0.9, maxWidth: "600px", mx: "auto" }}
        >
          Scopri le disponibilità per la tua prossima destinazione e prenota
          subito la barca dei tuoi sogni.
        </Typography>
        <Button
          variant="contained"
          size="large"
          component={Link}
          to="/catalogo"
          sx={{
            backgroundColor: "white",
            color: "primary.main",
            fontWeight: "bold",
            px: 4,
            py: 1.5,
            "&:hover": {
              backgroundColor: "rgba(255, 255, 255, 0.9)",
            },
          }}
        >
          Vai al Catalogo
        </Button>
      </Box>
    </Box>
  );
}
