/* Calendario di prenotazione — parte di Assane.
   Riceve la barca già caricata da Dettagli (niente fetch della lista barche),
   scarica solo le prenotazioni per sapere quali giorni sono occupati e si
   apre come Dialog collegata al bottone "Prenota". */

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  IconButton,
  Box,
  Paper,
  Typography,
  Grid,
  Button,
  TextField,
  Alert,
  CircularProgress,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { Boat } from "../types/boat";

const API_URL = "api.php";

interface Periodo {
  checkin: Date;
  checkout: Date;
}

interface Props {
  boat: Boat;
  open: boolean;
  onClose: () => void;
}

const oggi = new Date();
oggi.setHours(0, 0, 0, 0);

// Formatta la data in formato YYYY-MM-DD usando i valori locali per evitare shift di fuso orario
const iso = (d: Date) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const g = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${g}`;
};

// Parser flessibile per date YYYY-MM-DD o DD/MM/YYYY
const parseData = (str: string): Date => {
  if (!str) return new Date();
  
  if (str.includes("-")) {
    const [y, m, d] = str.split("-").map(Number);
    return new Date(y, m - 1, d);
  }
  
  if (str.includes("/")) {
    const [d, m, y] = str.split("/").map(Number);
    return new Date(y, m - 1, d);
  }
  
  return new Date(str);
};

const giorniTra = (a: Date, b: Date) => Math.round((b.getTime() - a.getTime()) / 86400000);

export default function Calendario({ boat, open, onClose }: Props) {
  const [prenotazioni, setPrenotazioni] = useState<Periodo[]>([]);
  const [caricamento, setCaricamento] = useState(true);
  const [mese, setMese] = useState(new Date(oggi.getFullYear(), oggi.getMonth(), 1));
  const [checkin, setCheckin] = useState<Date | null>(null);
  const [checkout, setCheckout] = useState<Date | null>(null);
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [confermata, setConfermata] = useState(false);
  const [errore, setErrore] = useState("");
  const [invio, setInvio] = useState(false);

  useEffect(() => {
    if (!open || !boat) return;
    
    setCaricamento(true);
    setConfermata(false);
    setCheckin(null);
    setCheckout(null);
    setErrore("");

    fetch(`${API_URL}?action=get_prenotazioni`)
      .then((r) => {
        if (!r.ok) throw new Error(`Errore HTTP ${r.status}`);
        return r.json();
      })
      .then((pren) => {
        if (Array.isArray(pren)) {
          const prenotazioniBarca = pren
            .filter((p: any) => Number(p.idBarca) === Number(boat.idBarca))
            .map((p: any) => ({
              checkin: parseData(p.data_checkin || p.checkin),
              checkout: parseData(p.data_checkout || p.checkout),
            }));
          setPrenotazioni(prenotazioniBarca);
        }
      })
      .catch((e) => {
        console.error("Errore nel caricamento delle prenotazioni:", e);
        setErrore("Impossibile caricare le prenotazioni esistenti.");
      })
      .finally(() => setCaricamento(false));
  }, [open, boat]);

  const occupato = (d: Date) => prenotazioni.some((p) => d >= p.checkin && d < p.checkout);

  function clicGiorno(d: Date) {
    if (d < oggi || occupato(d)) return;
    if (!checkin || checkout || d <= checkin) {
      setCheckin(d);
      setCheckout(null);
    } else {
      setCheckout(d);
    }
  }

  const notti = checkin && checkout ? giorniTra(checkin, checkout) : 0;
  const totale = notti * boat.costo_giornaliero;

  async function prenota() {
    if (!checkin || !checkout || !nome || !email) {
      setErrore("Compila tutti i campi e seleziona le date di check-in e check-out.");
      return;
    }

    setErrore("");
    setInvio(true);

    try {
      const r = await fetch(`${API_URL}?action=add_prenotazione`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idBarca: boat.idBarca,
          data_checkin: iso(checkin),
          data_checkout: iso(checkout),
          email: email,
          nome_prenotazione: nome,
        }),
      });

      const risposta = await r.text();

      if (r.ok && risposta.trim() === "OK") {
        setConfermata(true);
      } else {
        console.error("Risposta errore dal server:", risposta);
        setErrore(`Errore dal server: ${risposta || "Impossibile completare la prenotazione"}`);
      }
    } catch (e) {
      console.error("Errore di rete durante la prenotazione:", e);
      setErrore("Impossibile contattare il server. Controlla la connessione e riprova.");
    } finally {
      setInvio(false);
    }
  }

  const numGiorni = new Date(mese.getFullYear(), mese.getMonth() + 1, 0).getDate();
  const giorniMese = Array.from({ length: numGiorni }, (_, i) => new Date(mese.getFullYear(), mese.getMonth(), i + 1));

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <IconButton onClick={onClose} sx={{ position: "absolute", right: 8, top: 8 }}>
        <CloseIcon />
      </IconButton>

      <DialogContent sx={{ pt: 5 }}>
        {caricamento ? (
          <Box display="flex" justifyContent="center" py={4}>
            <CircularProgress />
          </Box>
        ) : confermata ? (
          <Alert severity="success" sx={{ my: 2 }}>
            Prenotazione confermata per <strong>{boat.nomebarca}</strong> — Totale: <strong>€{totale}</strong>
          </Alert>
        ) : (
          <Box>
            <Typography variant="h5" sx={{ fontWeight: "bold" }}>
              {boat.nomebarca} — €{boat.costo_giornaliero}/giorno
            </Typography>

            <Box display="flex" justifyContent="space-between" alignItems="center" mt={2}>
              <Button onClick={() => setMese(new Date(mese.getFullYear(), mese.getMonth() - 1, 1))}>◀</Button>
              <Typography sx={{ textTransform: "capitalize", fontWeight: "bold" }}>
                {mese.toLocaleDateString("it-IT", { month: "long", year: "numeric" })}
              </Typography>
              <Button onClick={() => setMese(new Date(mese.getFullYear(), mese.getMonth() + 1, 1))}>▶</Button>
            </Box>

            <Grid container spacing={1} mt={1}>
              {giorniMese.map((d) => (
                <Grid item key={iso(d)}>
                  <Button
                    size="small"
                    variant={checkin?.getTime() === d.getTime() || checkout?.getTime() === d.getTime() ? "contained" : "outlined"}
                    color={occupato(d) ? "error" : "primary"}
                    disabled={d < oggi || occupato(d)}
                    onClick={() => clicGiorno(d)}
                  >
                    {d.getDate()}
                  </Button>
                </Grid>
              ))}
            </Grid>

            <Paper sx={{ p: 2, mt: 2, backgroundColor: "#f8fafc" }} variant="outlined">
              <Typography variant="body2">
                Check-in: <strong>{checkin ? checkin.toLocaleDateString("it-IT") : "—"}</strong>
              </Typography>
              <Typography variant="body2">
                Check-out: <strong>{checkout ? checkout.toLocaleDateString("it-IT") : "—"}</strong>
              </Typography>
              <Typography variant="subtitle1" fontWeight="bold" sx={{ mt: 1, color: "primary.main" }}>
                Totale: €{totale}
              </Typography>
            </Paper>

            <TextField
              label="Nome e cognome"
              fullWidth
              margin="normal"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
            />
            <TextField
              label="Email"
              type="email"
              fullWidth
              margin="normal"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            {errore && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {errore}
              </Alert>
            )}

            <Button
              variant="contained"
              fullWidth
              size="large"
              sx={{ mt: 2, py: 1.2, fontWeight: "bold" }}
              onClick={prenota}
              disabled={invio}
            >
              {invio ? "Invio in corso…" : "Conferma prenotazione"}
            </Button>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
}