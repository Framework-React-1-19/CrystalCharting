import React, { useEffect, useState, useMemo } from "react";
import {
  Container,
  Typography,
  CircularProgress,
  Alert,
  Box,
  Grid,
} from "@mui/material";
import { Boat, FilterState } from "../types/boat";
import { BoatCard } from "./BoatCard";
import { Dettagli } from "./Dettagli";
import { FiltriBarche } from "./FiltriBarche";

const API_URL = "api.php?action=get_barche";

const INITIAL_FILTERS: FilterState = {
  tipo: "",
  capienzaMin: "",
  lunghezzaMin: "",
  lunghezzaMax: "",
};

export const Catalogo: React.FC = () => {
  const [barche, setBarche] = useState<Boat[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedBoat, setSelectedBoat] = useState<Boat | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [filters, setFilters] = useState<FilterState>(INITIAL_FILTERS);

  useEffect(() => {
    const fetchBarche = async () => {
      try {
        setLoading(true);
        const response = await fetch(API_URL);

        if (!response.ok) {
          throw new Error(`Errore HTTP: ${response.status}`);
        }

        const data: Boat[] = await response.json();
        
        const normalizedData = data.map((b) => ({
          ...b,
          idBarca: Number(b.idBarca),
          capienza: Number(b.capienza),
          potenza: Number(b.potenza),
          lunghezza: Number(b.lunghezza),
          costo_giornaliero: Number(b.costo_giornaliero),
        }));

        setBarche(normalizedData);
        setError(null);
      } catch (err: any) {
        console.error("Errore recupero dati:", err);
        setError("Impossibile caricare il catalogo barche. Riprova più tardi.");
      } finally {
        setLoading(false);
      }
    };

    fetchBarche();
  }, []);

  const tipiDisponibili = useMemo(() => {
    const tipiSet = new Set(barche.map((b) => b.tipo).filter(Boolean));
    return Array.from(tipiSet);
  }, [barche]);

  const barcheFiltrate = useMemo(() => {
    return barche.filter((barca) => {
      if (filters.tipo && barca.tipo !== filters.tipo) return false;
      if (filters.capienzaMin !== "" && barca.capienza < Number(filters.capienzaMin)) return false;
      if (filters.lunghezzaMin !== "" && barca.lunghezza < Number(filters.lunghezzaMin)) return false;
      if (filters.lunghezzaMax !== "" && barca.lunghezza > Number(filters.lunghezzaMax)) return false;
      return true;
    });
  }, [barche, filters]);

  const handleOpenModal = (boat: Boat) => {
    setSelectedBoat(boat);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedBoat(null);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h3" component="h1" gutterBottom sx={{ textAlign: "center", fontWeight: "bold" }}>
        Catalogo Imbarcazioni
      </Typography>

      <FiltriBarche
        filters={filters}
        onFilterChange={setFilters}
        tipiDisponibili={tipiDisponibili}
        onReset={() => setFilters(INITIAL_FILTERS)}
      />

      {loading && (
        <Box sx={{ display: "flex", justifyContent: "center", my: 5 }}>
          <CircularProgress />
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ my: 2 }}>
          {error}
        </Alert>
      )}

      {!loading && !error && barcheFiltrate.length === 0 && (
        <Alert severity="info" sx={{ my: 2 }}>
          Nessuna imbarcazione risponde ai criteri di ricerca selezionati.
        </Alert>
      )}

      {!loading && !error && (
        <Grid container spacing={3} sx={{ justifyContent: "center", alignItems: "stretch", maxWidth: { xs: "100%", md: "960px" }, mx: "auto" }}>
          {barcheFiltrate.map((barca) => (
            <Grid key={barca.idBarca} item xs={12} sm={6} md={4} sx={{ display: "flex", justifyContent: "center" }}>
              <Box sx={{ width: "100%", maxWidth: 360 }}>
                <BoatCard boat={barca} onSelect={handleOpenModal} />
              </Box>
            </Grid>
          ))}
        </Grid>
      )}

      <Dettagli boat={selectedBoat} open={isModalOpen} onClose={handleCloseModal} />
    </Container>
  );
};

export default Catalogo;