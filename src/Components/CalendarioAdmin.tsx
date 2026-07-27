//https://date-fns.org/docs/Getting-Started

import { useState, useEffect, useCallback } from "react";
import {
  Box,
  Paper,
  Typography,
  Button,
  IconButton,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Stack,
  Tooltip
} from "@mui/material";

import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import DeleteIcon from "@mui/icons-material/Delete";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import DirectionsBoatIcon from "@mui/icons-material/DirectionsBoat";

import {
  format,
  addMonths,
  subMonths,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  parseISO,
  isWithinInterval,
  startOfDay
} from "date-fns";
import { it } from "date-fns/locale";

import { BoatDivider } from "./BoatDivider";

// interfaccia per i dati del json
export interface Prenotazione {
  idPrenotazione: number;
  idBarca: number;
  timestamp_prenotazione?: string;
  data_checkin: string;
  data_checkout: string;
  email: string;
  nome_prenotazione: string;
  note?: string;
}

export function CalendarioAdmin() {
  //tipo dato date e nuova istanza da assegnare con usestate
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [prenotazioni, setPrenotazioni] = useState<Prenotazione[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);

  // Carica i dati dal file JSON locale - useCallBack è per tenerla in memoria (tipo solo 1 volta viene eseguita)
  //https://mimo.org/glossary/react/usecallback-hook
  const fetchPrenotazioni = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("/test.json");
      if (!response.ok) throw new Error("File non trovato");

      const data = await response.json();
      setPrenotazioni(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Errore fetch:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPrenotazioni();
  }, [fetchPrenotazioni]); //se cambia eseguo useEffect

  // Cancella una prenotazione dallo stato di React
  const handleDelete = (id: number) => {
    if (!window.confirm("Sei sicuro di voler eliminare questa prenotazione?")) return; //finestra di conferma
    setPrenotazioni((prev) => prev.filter((p) => p.idPrenotazione !== id));
  };

  // Calcoli per la griglia del mese
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const days = eachDayOfInterval({ start: startDate, end: endDate });
  const weekDays = ["Lun", "Mar", "Mer", "Gio", "Ven", "Sab", "Dom"];

  //Funzione per recuperare le prenotazioni di un singolo giorno
  const getPrenotazioniPerGiorno = (day: Date) => {
    const targetDay = startOfDay(day);

    return prenotazioni.filter((p) => {
      if (!p.data_checkin || !p.data_checkout) return false;

      // Legge i campi data_checkin e data_checkout del JSON
      const inizio = startOfDay(parseISO(p.data_checkin));
      const fine = startOfDay(parseISO(p.data_checkout));

      //prevenzione errore nella data o time
      if (isNaN(inizio.getTime()) || isNaN(fine.getTime())) return false; 

      return isWithinInterval(targetDay, { start: inizio, end: fine }); //fn di date-fns
    });
  };

  const prenotazioniGiornoSelezionato = selectedDay ? getPrenotazioniPerGiorno(selectedDay) : [];

  return (
    <Box sx={{ width: "100%", maxWidth: 800, mx: "auto", mt: 3 }}>
      <Paper elevation={6} sx={{ p: 2.5, borderRadius: 3 }}>
        
        {/* Intestazione Mese e Frecce Navigazione */}
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <EventAvailableIcon color="primary" fontSize="medium" />

            {/* in dietro di un mese */}
            <Stack direction="row" spacing={0.5} sx={{ alignItems: "center" }}>
              <IconButton size="small" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
                <ChevronLeftIcon fontSize="small" />
              </IconButton>

              {/* titolo mese + anno */}
              <Typography variant="h6" sx={{ fontWeight: "bold", textTransform: "capitalize", minWidth: 140, textAlign: "center" }}>
                {format(currentMonth, "MMMM yyyy", { locale: it })}
              </Typography>

              {/* in avanti di un mese */}
              <IconButton size="small" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
                <ChevronRightIcon fontSize="small" />
              </IconButton>
            </Stack>
          </Box>

          <Button
            variant="outlined"
            size="small"
            onClick={() => setCurrentMonth(new Date())}
            sx={{ px: 1.5, py: 0.3, fontSize: "0.75rem" }}>
            Oggi
          </Button>
        </Box>

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
            <CircularProgress size={32} />
          </Box>
        ) : (
          <Box sx={{ width: "100%" }}>
            
            {/* Nomi dei Giorni (Lun, Mar, ...) */}
            <Box sx={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 0.5, textAlign: "center", mb: 1 }}>
              {weekDays.map((d) => (
                <Typography key={d} variant="caption" sx={{ fontWeight: "bold", color: "text.secondary", fontSize: "0.75rem" }}>
                  {d}
                </Typography>
              ))}
            </Box>

            {/* Griglia delle Caselle dei Giorni */}
            <Box sx={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 0.5 }}>
              {days.map((day, idx) => {
                const inCurrentMonth = isSameMonth(day, monthStart);
                const isToday = isSameDay(day, new Date());
                const prenotazioniDelGiorno = getPrenotazioniPerGiorno(day);
                const isOccupato = prenotazioniDelGiorno.length > 0;

                let bgColor = "background.paper";
                if (!inCurrentMonth) {
                  bgColor = "#f8fafc";
                } else if (isOccupato) {
                  bgColor = "#fee2e2";
                } else if (isToday) {
                  bgColor = "#e0f2fe";
                }

                return (
                  <Paper
                    key={idx}
                    variant="outlined"
                    onClick={() => setSelectedDay(day)}
                    sx={{
                      minHeight: 58,
                      p: 0.5,
                      cursor: "pointer",
                      backgroundColor: bgColor,
                      borderColor: isOccupato ? "#ef4444" : isToday ? "primary.main" : "divider",
                      borderWidth: isOccupato || isToday ? 2 : 1,
                      "&:hover": {
                        boxShadow: 2,
                        borderColor: isOccupato ? "#dc2626" : "primary.light"
                      }
                    }}>

                    <Typography
                      variant="caption"
                      sx={{
                        fontSize: "0.75rem",
                        fontWeight: isToday || isOccupato ? "bold" : "normal",
                        color: !inCurrentMonth ? "text.disabled" : isOccupato ? "#b91c1c" : "text.primary",
                        display: "block"
                      }}>

                      {format(day, "d")}
                    </Typography>

                    {/* Chip con il Nome / Barca */}
                    <Stack spacing={0.3} sx={{ mt: 0.5 }}>
                      {prenotazioniDelGiorno.slice(0, 1).map((p) => (
                        <Chip
                          key={p.idPrenotazione}
                          size="small"
                          color="error"
                          icon={<DirectionsBoatIcon style={{ fontSize: 10, color: "white" }} />}
                          label={`Barca #${p.idBarca}`}
                          sx={{
                            height: 16,
                            fontSize: "0.55rem",
                            fontWeight: "bold",
                            "& .MuiChip-label": { px: 0.4, py: 0 }
                          }}
                        />
                      ))}
                      {prenotazioniDelGiorno.length > 1 && (
                        <Typography variant="caption" sx={{ fontSize: "0.5rem", color: "#b91c1c", fontWeight: "bold" }}>
                          + {prenotazioniDelGiorno.length - 1} altri
                        </Typography>
                      )}
                    </Stack>
                  </Paper>
                );
              })}
            </Box>
          </Box>
        )}
      </Paper>

      {/* Finestra di Dettaglio quando clicchi un Giorno */}
      <Dialog open={Boolean(selectedDay)} onClose={() => setSelectedDay(null)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: "bold", fontSize: "0.95rem", py: 1.5, textAlign: "center" }}>
          {selectedDay && format(selectedDay, "EEEE d MMMM yyyy", { locale: it })}
          <BoatDivider />
        </DialogTitle>
        
        <DialogContent sx={{ py: 1.5 }}>
          {prenotazioniGiornoSelezionato.length === 0 ? (
            <Typography sx={{ color: "text.secondary", textAlign: "center", py: 2 }} variant="body2">
              Nessuna prenotazione per questo giorno.
            </Typography>
          ) : (
            <Stack spacing={1.5}>
              {prenotazioniGiornoSelezionato.map((p) => (
                <Card key={p.idPrenotazione} variant="outlined" sx={{ position: "relative", borderColor: "#fca5a5" }}>
                  <CardContent sx={{ pr: 5, py: 1.5, "&:last-child": { pb: 1.5 } }}>
                    {/*elementi della prenotazione nella nodale */}
                    <Typography variant="subtitle2" sx={{ fontWeight: "bold", color: "error.main" }}>
                      Barca #{p.idBarca}
                    </Typography>
                    
                    <Typography variant="caption" sx={{ color: "text.primary", display: "block", mt: 0.5 }}>
                      Cliente: <strong>{p.nome_prenotazione}</strong> ({p.email})
                    </Typography>

                    <Typography variant="caption" sx={{ color: "text.secondary", display: "block" }}>
                      Dal <strong>{p.data_checkin}</strong> al <strong>{p.data_checkout}</strong>
                    </Typography>

                    {p.note && (
                      <Typography variant="caption" sx={{ color: "text.secondary", display: "block", fontStyle: "italic", mt: 0.5 }}>
                        Note: {p.note}
                      </Typography>
                    )}

                    <Tooltip title="Elimina prenotazione">
                      <IconButton
                        color="error"
                        size="small"
                        onClick={() => handleDelete(p.idPrenotazione)}
                        sx={{ position: "absolute", top: 8, right: 8 }}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </CardContent>
                </Card>
              ))}
            </Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ py: 1 }}>
          <Button size="small" onClick={() => setSelectedDay(null)}>Chiudi</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}