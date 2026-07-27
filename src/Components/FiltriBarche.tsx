import React from "react";
import {
  Paper,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Box,
  Typography,
} from "@mui/material";
import FilterAltOffIcon from "@mui/icons-material/FilterAltOff";
import { FilterState } from "../types/boat";

interface FiltriBarcheProps {
  filters: FilterState;
  onFilterChange: (newFilters: FilterState) => void;
  tipiDisponibili: string[];
  onReset: () => void;
}

export const FiltriBarche: React.FC<FiltriBarcheProps> = ({
  filters,
  onFilterChange,
  tipiDisponibili,
  onReset,
}) => {
  const handleChange = (field: keyof FilterState, value: any) => {
    onFilterChange({
      ...filters,
      [field]: value,
    });
  };

  return (
    <Paper
      elevation={2}
      sx={{
        p: 3,
        mb: 4,
        borderRadius: 2,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <Typography variant="h6" mb={2} fontWeight="bold" align="center">
        Filtra Imbarcazioni
      </Typography>
      <Grid container spacing={2} alignItems="center" justifyContent="center">
        {/* Filtro Tipo */}
        <Grid item xs={12} sm={6} md={3}>
          <FormControl fullWidth size="small">
            <InputLabel id="select-tipo-label">Tipo Imbarcazione</InputLabel>
            <Select
              labelId="select-tipo-label"
              value={filters.tipo}
              label="Tipo Imbarcazione"
              onChange={(e) => handleChange("tipo", e.target.value)}
            >
              <MenuItem value="">
                <em>Tutti i tipi</em>
              </MenuItem>
              {tipiDisponibili.map((tipo) => (
                <MenuItem key={tipo} value={tipo}>
                  {tipo}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        {/* Filtro Capienza Minima */}
        <Grid item xs={12} sm={6} md={3}>
          <TextField
            fullWidth
            size="small"
            type="number"
            label="Capienza Minima (persone)"
            value={filters.capienzaMin}
            onChange={(e) =>
              handleChange(
                "capienzaMin",
                e.target.value === "" ? "" : Number(e.target.value),
              )
            }
            inputProps={{ min: 0 }}
          />
        </Grid>

        {/* Filtro Lunghezza Minima */}
        <Grid item xs={12} sm={6} md={2.5}>
          <TextField
            fullWidth
            size="small"
            type="number"
            label="Lunghezza Min (m)"
            value={filters.lunghezzaMin}
            onChange={(e) =>
              handleChange(
                "lunghezzaMin",
                e.target.value === "" ? "" : Number(e.target.value),
              )
            }
            inputProps={{ min: 0 }}
          />
        </Grid>

        {/* Filtro Lunghezza Massima */}
        <Grid item xs={12} sm={6} md={2.5}>
          <TextField
            fullWidth
            size="small"
            type="number"
            label="Lunghezza Max (m)"
            value={filters.lunghezzaMax}
            onChange={(e) =>
              handleChange(
                "lunghezzaMax",
                e.target.value === "" ? "" : Number(e.target.value),
              )
            }
            inputProps={{ min: 0 }}
          />
        </Grid>

        {/* Bottone Reset */}
        <Grid item xs={12} sm={6} md={1}>
          <Button
            fullWidth
            variant="outlined"
            color="secondary"
            onClick={onReset}
            title="Azzera Filtri"
            sx={{ height: "40px" }}
          >
            <FilterAltOffIcon />
          </Button>
        </Grid>
      </Grid>
    </Paper>
  );
};
