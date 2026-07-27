import { useEffect, useState } from "react";
import {
  Dialog, DialogContent, IconButton, Box, Paper, Typography,
  Grid, Button, TextField, Alert, CircularProgress,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { Boat } from "../types/boat";

/* Calendario di prenotazione — parte di Assan.
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

const iso = (d: Date) => d.toISOString().slice(0, 10);
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
    if (!checkin || !checkout || !nome || !email) { setErrore("Compila i campi e seleziona le date"); return; }
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
    const res = await r.json().catch(() => ({}));
    if (res?.success) setConfermata(true);
    else setErrore("Il server ha rifiutato la prenotazione");
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

            <Button variant="contained" fullWidth sx={{ mt: 2 }} onClick={prenota}>
              Conferma prenotazione
            </Button>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
}