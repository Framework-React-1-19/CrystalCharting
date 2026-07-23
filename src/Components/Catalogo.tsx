import React, { useEffect, useState, useMemo } from "react";
import {
  Container,
  Grid,
  Typography,
  CircularProgress,
  Alert,
  Box,
} from "@mui/material";
import { Boat, FilterState } from "../types/boat";
import { BoatCard } from "./BoatCard";
import { Dettagli } from "./Dettagli";
import { FiltriBarche } from "./FiltriBarche";

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

  // Stato per la modale e la barca selezionata
  const [selectedBoat, setSelectedBoat] = useState<Boat | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  // Stato per i filtri attivi
  const [filters, setFilters] = useState<FilterState>(INITIAL_FILTERS);

  // Fetch dei dati dall'API
  useEffect(() => {
    const fetchBarche = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          "https://crystalcharting.awardspace.net/api.php?action=get_barche",
        );

        if (!response.ok) {
          throw new Error(`Errore HTTP: ${response.status}`);
        }

        const data: Boat[] = await response.json();
        setBarche(data);
        setError(null);
      } catch (err) {
        console.error("Errore durante il recupero dei dati:", err);
        setError("Impossibile caricare il catalogo barche. Riprova più tardi.");
      } finally {
        setLoading(false);
      }
    };

    fetchBarche();
  }, []);

  // Ricava la lista dei tipi di barca univoci presenti per il menu a tendina
  const tipiDisponibili = useMemo(() => {
    const tipiSet = new Set(barche.map((b) => b.tipo).filter(Boolean));
    return Array.from(tipiSet);
  }, [barche]);

  // Logica di filtraggio dei dati
  const barcheFiltrate = useMemo(() => {
    return barche.filter((barca) => {
      // Filtro per tipo
      if (filters.tipo && barca.tipo !== filters.tipo) {
        return false;
      }
      // Filtro per capienza minima
      if (
        filters.capienzaMin !== "" &&
        barca.capienza < Number(filters.capienzaMin)
      ) {
        return false;
      }
      // Filtro per lunghezza minima
      if (
        filters.lunghezzaMin !== "" &&
        barca.lunghezza < Number(filters.lunghezzaMin)
      ) {
        return false;
      }
      // Filtro per lunghezza massima
      if (
        filters.lunghezzaMax !== "" &&
        barca.lunghezza > Number(filters.lunghezzaMax)
      ) {
        return false;
      }
      return true;
    });
  }, [barche, filters]);

  // Gestione apertura/chiusura modale
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
      <Typography
        variant="h3"
        component="h1"
        gutterBottom
        textAlign="center"
        fontWeight="bold"
      >
        Catalogo Imbarcazioni
      </Typography>

      {/* Componente Filtri */}
      <FiltriBarche
        filters={filters}
        onFilterChange={setFilters}
        tipiDisponibili={tipiDisponibili}
        onReset={() => setFilters(INITIAL_FILTERS)}
      />

      {/* Indicatore di caricamento */}
      {loading && (
        <Box display="flex" justifyContent="center" my={5}>
          <CircularProgress />
        </Box>
      )}

      {/* Gestione Errori */}
      {error && (
        <Alert severity="error" sx={{ my: 2 }}>
          {error}
        </Alert>
      )}

      {/* Nessun risultato trovato */}
      {!loading && !error && barcheFiltrate.length === 0 && (
        <Alert severity="info" sx={{ my: 2 }}>
          Nessuna imbarcazione risponde ai criteri di ricerca selezionati.
        </Alert>
      )}

      {/* Griglia delle Card Barche */}
      {!loading && !error && (
        <Grid container spacing={3}>
          {barcheFiltrate.map((barca) => (
            <Grid item key={barca.idBarca} xs={12} sm={6} md={4}>
              <BoatCard boat={barca} onSelect={handleOpenModal} />
            </Grid>
          ))}
        </Grid>
      )}

      {/* Modale Dettagli */}
      <Dettagli
        boat={selectedBoat}
        open={isModalOpen}
        onClose={handleCloseModal}
      />
    </Container>
  );
};

export default Catalogo;
