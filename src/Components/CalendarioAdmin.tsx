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
  Divider,
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
    parseISO
} from "date-fns";
import { it } from "date-fns/locale";

export interface Prenotazione {
    id: string | number;
    nomebarca: string;
    cliente: string;
    data_inizio: string;
    data_fine: string;
    note?: string;
}


export function CalendarioAdmin() {
    const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
    const [prenotazioni, setPrenotazioni] = useState<Prenotazione[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [selectedDay, setSelectedDay] = useState<Date | null>(null);
    const [deleteLoadingId, setDeleteLoadingId] = useState<string | number | null>(null);

    const fetchPrenotazioni = useCallback(async () => {
        setLoading(true);
        try {
            const response = await fetch("https://crystalcharting.awardspace.net/api.php?action=get_prenotazioni");
            const data = await response.json();
            setPrenotazioni(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Errore nel recupero prenotazioni:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPrenotazioni();
    }, [fetchPrenotazioni]);

    const handleDelete = async (id: string | number) => {
        if (!window.confirm("Sei sicuro di voler eliminare questa prenotazione?")) return;

        setDeleteLoadingId(id);
        try {
            const formData = new FormData();
            formData.append("action", "delete_prenotazione");
            formData.append("id", String(id));

            const response = await fetch(`https://crystalcharting.atwebpages.com/api.php?action=delete_prenotazione&id=${id}`, {
                method: "POST",
                body: formData,
            });

            const risposta = await response.text();
            if (risposta.trim() === "OK") {
                setPrenotazioni((prev) => prev.filter((p) => String(p.id) !== String(id)));
            } else {
                alert("Errore nell'eliminazione: " + risposta);
            }
        } catch (error) {
        alert("Impossibile eliminare la prenotazione.");
        } finally {
        setDeleteLoadingId(null);
        }
    };

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const days = eachDayOfInterval({ start: startDate, end: endDate });
  const weekDays = ["Lun", "Mar", "Mer", "Gio", "Ven", "Sab", "Dom"];

  const getPrenotazioniPerGiorno = (day: Date) => {
    return prenotazioni.filter((p) => {
      const inizio = parseISO(p.data_inizio);
      const fine = parseISO(p.data_fine);
      return day >= inizio && day <= fine;
    });
  };

  const prenotazioniGiornoSelezionato = selectedDay ? getPrenotazioniPerGiorno(selectedDay) : [];

  return (
    <Box sx={{ width: "100%", maxWidth: 800, mx: "auto" }}>
      <Paper elevation={12} sx={{ p: 2, borderRadius: 3 }}>
        
        {/* Intestazione Mese e Navigazione */}
        <Box sx={{display: "flex", alignItems: "center", mb: 1.5}}>
          <Box sx={{display: "flex", alignItems: "center", gap: 1 }}>
            <EventAvailableIcon color="primary" fontSize="medium" />

            <Stack direction="row" spacing={0.5}>
                <IconButton size="small" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
                    <ChevronLeftIcon fontSize="small" />
                </IconButton>

                <Typography variant="h6" sx={{ fontWeight: "bold", textTransform: "capitalize", fontSize: "1.1rem" }}>
                    {format(currentMonth, "MMMM yyyy", { locale: it })}
                </Typography>

                <IconButton size="small" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
                    <ChevronRightIcon fontSize="small" />
                </IconButton>
            </Stack>
          </Box>

          <Stack direction="row" spacing={0.5}>
            <Button
              variant="outlined"
              size="small"
              onClick={() => setCurrentMonth(new Date())}
              sx={{ px: 1.5, py: 0.2, fontSize: "0.75rem" }}>
              Oggi
            </Button>
          </Stack>
        </Box>

        {loading ? (
          <Box sx={{display: "flex", py: 4}}>
            <CircularProgress size={28} />
          </Box>
            ) : (
          <Box sx={{ width: "100%" }}>
            
            {/* Giorni della settimana*/}
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "repeat(7, 1fr)",
                gap: 0.5,
                textAlign: "center",
                mb: 0.5
              }}>
              {weekDays.map((d) => (
                <Typography
                  key={d}
                  variant="caption"
                  sx={{ fontWeight: "bold", color: "text.secondary", fontSize: "0.75rem" }}>
                  {d}
                </Typography>
              ))}
            </Box>

            {/* Griglia Giorni del Mese */}
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "repeat(7, 1fr)",
                gap: 0.5
              }}>
                
              {days.map((day, idx) => {
                const inCurrentMonth = isSameMonth(day, monthStart);
                const isToday = isSameDay(day, new Date());
                const prenotazioniDelGiorno = getPrenotazioniPerGiorno(day);

                return (
                  <Paper
                    key={idx}
                    variant="outlined"
                    onClick={() => setSelectedDay(day)}
                    sx={{
                      minHeight: 52,
                      p: 0.4,
                      cursor: "pointer",
                      boxSizing: "border-box",
                      backgroundColor: !inCurrentMonth ? "#f8fafc" : isToday ? "#246ac588" : "background.paper",
                      borderColor: isToday ? "primary.main" : "divider",
                      borderWidth: isToday ? 2 : 1,
                      transition: "all 0.15s ease-in-out",
                      "&:hover": {
                        boxShadow: 2,
                        borderColor: "primary.light"
                      }
                    }}>

                    {/* Numero Giorno */}
                    <Typography
                      variant="caption"
                      sx={{
                        fontSize: "0.75rem",
                        fontWeight: isToday ? "bold" : "normal",
                        color: !inCurrentMonth ? "text.disabled" : "text.primary",
                        lineHeight: 1,
                        display: "block"
                      }}>

                      {format(day, "d")}
                    </Typography>

                    {/* Chip Prenotazioni */}
                    <Stack spacing={0.2} sx={{mt:0.3}}>
                      {prenotazioniDelGiorno.slice(0, 1).map((p) => (
                        <Chip
                          key={p.id}
                          size="small"
                          color="primary"
                          icon={<DirectionsBoatIcon style={{ fontSize: 9 }} />}
                          label={p.nomebarca}
                          sx={{
                            height: 14,
                            fontSize: "0.55rem",
                            "& .MuiChip-label": { px: 0.4, py: 0 }
                          }}/>
                      ))}
                      {prenotazioniDelGiorno.length > 1 && (
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ fontSize: "0.5rem", lineHeight: 1 }}>
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

      {/* Modale Dettagli */}
      <Dialog open={Boolean(selectedDay)} onClose={() => setSelectedDay(null)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: "bold", fontSize: "0.95rem", py: 1.5 }}>
          {selectedDay && format(selectedDay, "EEEE d MMMM yyyy", { locale: it })}
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ py: 1.5 }}>
          {prenotazioniGiornoSelezionato.length === 0 ? (
            <Typography sx={{color: "text.secondary", textAlign: "center", py: 1.5}}  variant="body2">
              Nessuna prenotazione per questo giorno.
            </Typography>
          ) : (
            <Stack spacing={1}>
              {prenotazioniGiornoSelezionato.map((p) => (
                <Card key={p.id} variant="outlined" sx={{ position: "relative" }}>
                  <CardContent sx={{ pr: 4, py: 1, "&:last-child": { pb: 1 } }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: "bold", color: "primary.main" }}>
                      {p.nomebarca}
                    </Typography>
                    <Typography variant="caption" sx={{color: "text.secondary", display: "block"}}>
                      Cliente: <strong>{p.cliente}</strong>
                    </Typography>
                    <Typography variant="caption" sx={{color: "text.secondary", display: "block"}}>
                      Dal: {p.data_inizio} al {p.data_fine}
                    </Typography>
                    {p.note && (
                      <Typography variant="caption"  sx={{color: "text.secondary", display: "block", fontStyle: "italic"}}>
                        Note: {p.note}
                      </Typography>
                    )}

                    <Tooltip title="Elimina prenotazione">
                      <IconButton
                        color="error"
                        size="small"
                        disabled={deleteLoadingId === p.id}
                        onClick={() => handleDelete(p.id)}
                        sx={{ position: "absolute", top: 4, right: 4 }}>
                        {deleteLoadingId === p.id ? (
                          <CircularProgress size={14} color="error" />
                        ) : (
                          <DeleteIcon fontSize="small" />
                        )}
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