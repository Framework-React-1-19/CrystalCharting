import { useState, useEffect, useMemo, useCallback } from "react";
// https://lucide.dev/guide/react/advanced/typescript
import {
  Dialog, DialogContent, IconButton, Box, Paper, Typography,
  Grid, Button, TextField, Alert, CircularProgress,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { Boat } from "../types/boat";

/* Calendario di prenotazione — parte di Assane.
   Riceve la barca già caricata da Dettagli (niente fetch della lista barche),
   scarica solo le prenotazioni per sapere quali giorni sono occupati e si
   apre come Dialog collegata al bottone "Prenota". */

const API = "https://crystalcharting.awardspace.net/api.php";

interface Periodo { checkin: Date; checkout: Date; }
interface Props {
  boat: Boat;
  open: boolean;
  onClose: () => void;
}

const oggi = new Date();
oggi.setHours(0, 0, 0, 0);

// Costruisce la stringa YYYY-MM-DD usando i valori LOCALI della data.
// Prima si usava toISOString(), che converte in UTC: con fusi orari
// positivi (es. Italia) la mezzanotte locale può "scivolare" al giorno
// prima, mandando al server una data di check-in/check-out sbagliata.
const iso = (d: Date) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const g = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${g}`;
};

const giorniTra = (a: Date, b: Date) => Math.round((b.getTime() - a.getTime()) / 86400000);
const dataIt = (s: string) => { const [g, m, a] = s.split("/").map(Number); return new Date(a, m - 1, g); };

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
  const [invio, setInvio] = useState(false); // true mentre la richiesta di prenotazione è in corso

  // Ogni volta che la modale si apre, ricarica le prenotazioni e azzera la selezione precedente.
  useEffect(() => {
    if (!open) return;
    setCaricamento(true);
    setConfermata(false);
    setCheckin(null);
    setCheckout(null);
    setErrore("");
    fetch(`${API}?action=get_prenotazioni`)
      .then((r) => r.json())
      .then((pren) => {
        setPrenotazioni(
          pren
            .filter((p: any) => p.idBarca === boat.idBarca)
            .map((p: any) => ({ checkin: dataIt(p.data_checkin), checkout: dataIt(p.data_checkout) }))
        );
      })
      .catch((e) => {
        console.error("Errore nel caricamento delle prenotazioni", e);
        setErrore("Impossibile caricare le prenotazioni esistenti");
      })
      .finally(() => setCaricamento(false));
  }, [open, boat.idBarca]);

  const occupato = (d: Date) => prenotazioni.some((p) => d >= p.checkin && d < p.checkout);

  function clicGiorno(d: Date) {
    if (d < oggi || occupato(d)) return;
    if (!checkin || checkout || d <= checkin) { setCheckin(d); setCheckout(null); }
    else setCheckout(d);
  }

  const notti = checkin && checkout ? giorniTra(checkin, checkout) : 0;
  const totale = notti * boat.costo_giornaliero;

  async function prenota() {
    if (!checkin || !checkout || !nome || !email) {
      setErrore("Compila i campi e seleziona le date");
      return;
    }

    setErrore("");
    setInvio(true);
    try {
      const r = await fetch(`${API}?action=add_prenotazione`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idBarca: boat.idBarca,
          data_checkin: iso(checkin),
          data_checkout: iso(checkout),
          email,
          nome_prenotazione: nome,
        }),
      });

      // Leggiamo prima come testo: se il PHP restituisce un warning/notice
      // prima del JSON (frequente su hosting condivisi), r.json() esploderebbe
      // e prima veniva inghiottito silenziosamente da .catch(() => ({})).
      const testo = await r.text();
      let res: any = {};
      try { res = testo ? JSON.parse(testo) : {}; } catch {
        console.error("Risposta del server non è JSON valido:", testo);
      }

      if (!r.ok) {
        console.error("add_prenotazione: errore HTTP", r.status, testo);
        setErrore(`Errore dal server (${r.status}). Riprova più tardi.`);
        return;
      }

      if (res?.success) {
        setConfermata(true);
      } else {
        console.error("add_prenotazione: risposta inattesa", res);
        setErrore("Il server ha rifiutato la prenotazione");
      }
    } catch (e) {
      // Qui finiscono errori di rete/CORS: prima non erano intercettati,
      // quindi la promise falliva in silenzio e sembrava che il click
      // non facesse nulla.
      console.error("Errore di rete durante la prenotazione", e);
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
          <Alert severity="success">
            Prenotazione confermata per {boat.nomebarca} — Totale €{totale}
          </Alert>
        ) : (
          <Box>
            <Typography variant="h5">{boat.nomebarca} — €{boat.costo_giornaliero}/giorno</Typography>

            <Box display="flex" justifyContent="space-between" alignItems="center" mt={2}>
              <Button onClick={() => setMese(new Date(mese.getFullYear(), mese.getMonth() - 1, 1))}>◀</Button>
              <Typography>{mese.toLocaleDateString("it-IT", { month: "long", year: "numeric" })}</Typography>
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

            <Paper sx={{ p: 2, mt: 2 }}>
              <Typography>Check-in: {checkin ? checkin.toLocaleDateString("it-IT") : "—"}</Typography>
              <Typography>Check-out: {checkout ? checkout.toLocaleDateString("it-IT") : "—"}</Typography>
              <Typography fontWeight="bold">Totale: €{totale}</Typography>
            </Paper>

            <TextField label="Nome e cognome" fullWidth margin="normal" value={nome} onChange={(e) => setNome(e.target.value)} />
            <TextField label="Email" fullWidth margin="normal" value={email} onChange={(e) => setEmail(e.target.value)} />

            {errore && <Alert severity="error" sx={{ mt: 1 }}>{errore}</Alert>}

            <Button variant="contained" fullWidth sx={{ mt: 2 }} onClick={prenota} disabled={invio}>
              {invio ? "Invio in corso…" : "Conferma prenotazione"}
            </Button>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
}