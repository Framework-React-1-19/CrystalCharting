import { useEffect, useState } from "react";
import {
  ChevronLeft, ChevronRight, Anchor, Calendar as CalendarIcon,
  Check, Phone, Mail, User, Ship, RotateCcw, AlertTriangle,
} from "lucide-react";
import {
  TextField, Button, InputAdornment, CircularProgress, Alert, Snackbar,
} from "@mui/material";

/* ============================================================================
   Calendario di prenotazione — parte di Assan.
   Riceve `idBarca` dal Dettaglio Prodotto (Ben e Ken), scarica barca e
   prenotazioni dall'API PHP e permette al cliente di scegliere le date e
   confermare la prenotazione.
   ============================================================================ */

const API = "http://crystalcharting.atwebpages.com/api.php";
const GIORNI = ["Lun", "Mar", "Mer", "Gio", "Ven", "Sab", "Dom"];
const MESI = ["Gennaio","Febbraio","Marzo","Aprile","Maggio","Giugno","Luglio","Agosto","Settembre","Ottobre","Novembre","Dicembre"];

/* ---- tipi ---- */
interface Barca {
  id: number;
  nome: string;
  tipo: string;
  porto: string;
  capienzaMax: number;
  prezzoGiorno: number;
}
interface Prenotazione {
  id: number;
  idBarca: number;
  checkin: Date;
  checkout: Date;
}
interface DatiCliente {
  nome: string;
  cognome: string;
  email: string;
  telefono: string;
  persone: number;
}
type Errori = Partial<Record<keyof DatiCliente | "date", string>>;
interface Confermata extends DatiCliente {
  checkin: Date;
  checkout: Date;
  notti: number;
  totale: number;
  codice: string;
}
interface Props {
  idBarca: number;
  barcaIniziale?: Barca | null;
}

/* ---- date: teniamo solo giorno/mese/anno, senza orario ---- */
const oggiPulito = (): Date => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; };
const toISO = (d: Date): string => d.toISOString().slice(0, 10);
const toItaliano = (d: Date): string => d.toLocaleDateString("it-IT", { day: "2-digit", month: "short", year: "numeric" });
const dataDaStringaIt = (s: string): Date => { const [g, m, a] = s.split("/").map(Number); return new Date(a, m - 1, g); };
const giorniTra = (a: Date, b: Date): number => Math.round((b.getTime() - a.getTime()) / 86400000);

/* ---- adattamento dei campi che arrivano dal backend PHP ---- */
const leggiBarca = (r: any): Barca => ({
  id: r.idBarca ?? r.id,
  nome: r.nomebarca ?? r.nome ?? "Imbarcazione",
  tipo: r.tipo ?? "—",
  porto: r.porto ?? r.marina ?? "Marina di Genova",
  capienzaMax: Number(r.capienza ?? r.capienzaMax ?? 1),
  prezzoGiorno: Number(r.costo_giornaliero ?? r.prezzoGiorno ?? 0),
});
const leggiPrenotazione = (r: any): Prenotazione => ({
  id: r.idPrenotazione ?? r.id,
  idBarca: r.idBarca ?? r.id_barca,
  checkin: dataDaStringaIt(r.data_checkin ?? r.checkin),
  checkout: dataDaStringaIt(r.data_checkout ?? r.checkout),
});

export default function CalendarioPrenotazioni({ idBarca, barcaIniziale = null }: Props) {
  const oggi = oggiPulito();
  const [mese, setMese] = useState(new Date(oggi.getFullYear(), oggi.getMonth(), 1));
  const [checkin, setCheckin] = useState<Date | null>(null);
  const [checkout, setCheckout] = useState<Date | null>(null);
  const [hover, setHover] = useState<Date | null>(null);

  const [barca, setBarca] = useState<Barca | null>(barcaIniziale ? leggiBarca(barcaIniziale) : null);
  const [prenotazioni, setPrenotazioni] = useState<Prenotazione[]>([]);
  const [caricamento, setCaricamento] = useState(!barcaIniziale);
  const [erroreCaricamento, setErroreCaricamento] = useState<string | null>(null);

  const [cliente, setCliente] = useState<DatiCliente>({ nome: "", cognome: "", email: "", telefono: "", persone: 1 });
  const [errori, setErrori] = useState<Errori>({});
  const [confermata, setConfermata] = useState<Confermata | null>(null);
  const [invio, setInvio] = useState(false);
  const [erroreInvio, setErroreInvio] = useState<string | null>(null);

  /* ---- caricamento barca + prenotazioni dall'API ---- */
  async function caricaDati() {
    setCaricamento(true);
    setErroreCaricamento(null);
    try {
      const r = await fetch(`${API}?action=get_barche`);
      if (!r.ok) throw new Error("Il server non risponde (elenco barche).");
      const lista = await r.json();
      const trovata = (Array.isArray(lista) ? lista : lista?.barche ?? [])
        .find((b: any) => String(b.idBarca ?? b.id) === String(idBarca));
      if (!trovata) throw new Error("Imbarcazione non trovata.");
      setBarca(leggiBarca(trovata));

      const rp = await fetch(`${API}?action=get_prenotazioni`);
      const dati = rp.ok ? await rp.json() : [];
      const lista2 = Array.isArray(dati) ? dati : dati?.data ?? dati?.prenotazioni ?? [];
      setPrenotazioni(
        lista2.map(leggiPrenotazione).filter((p: Prenotazione) => String(p.idBarca) === String(idBarca))
      );
    } catch (e: any) {
      setErroreCaricamento(e.message);
    } finally {
      setCaricamento(false);
    }
  }
  useEffect(() => { caricaDati(); }, [idBarca]);

  /* ---- disponibilità ---- */
  const occupato = (d: Date) => prenotazioni.some((p) => d >= p.checkin && d < p.checkout);
  const passato = (d: Date) => d < oggi;
  const periodoLibero = (a: Date, b: Date) => !prenotazioni.some((p) => a < p.checkout && b > p.checkin);

  function clicGiorno(d: Date) {
    if (passato(d) || occupato(d)) return;
    setConfermata(null);
    const nuovaSelezione = !checkin || checkout || d <= checkin || !periodoLibero(checkin, d);
    if (nuovaSelezione) { setCheckin(d); setCheckout(null); }
    else setCheckout(d);
  }
  function azzera() { setCheckin(null); setCheckout(null); setConfermata(null); setErrori({}); }

  const notti = checkin && checkout ? giorniTra(checkin, checkout) : 0;
  const totale = barca ? notti * barca.prezzoGiorno : 0;

  /* ---- griglia del mese ---- */
  const primoGiorno = new Date(mese.getFullYear(), mese.getMonth(), 1);
  const numGiorni = new Date(mese.getFullYear(), mese.getMonth() + 1, 0).getDate();
  const offset = (primoGiorno.getDay() + 6) % 7; // lunedì = 0
  const celle: (Date | null)[] = [
    ...Array(offset).fill(null),
    ...Array.from({ length: numGiorni }, (_, i) => new Date(mese.getFullYear(), mese.getMonth(), i + 1)),
  ];
  const meseCorrente = oggi.getFullYear() === mese.getFullYear() && oggi.getMonth() === mese.getMonth();
  const cambiaMese = (delta: number) => setMese((m) => new Date(m.getFullYear(), m.getMonth() + delta, 1));

  function classiGiorno(d: Date): string {
    const isCheckin = checkin?.getTime() === d.getTime();
    const isCheckout = checkout?.getTime() === d.getTime();
    const inRange = !!checkin && !!checkout && d > checkin && d < checkout;
    const inAnteprima = !!checkin && !checkout && !!hover && hover > checkin && d > checkin && d < hover;
    const conflitto = inAnteprima && checkin && hover ? !periodoLibero(checkin, hover) : false;

    if (occupato(d)) return "bg-[#F6E7E5] text-[#C1554B] line-through cursor-not-allowed";
    if (passato(d)) return "text-[#C3CDD3] cursor-not-allowed";
    if (isCheckin || isCheckout) return "bg-[#0A2540] text-white font-semibold cursor-pointer";
    if (inRange) return "bg-[#D9EEEC] text-[#0A2540] cursor-pointer";
    if (conflitto) return "bg-[#F6E7E5] text-[#C1554B] cursor-pointer";
    if (inAnteprima) return "bg-[#EAF4F3] text-[#0A2540] cursor-pointer";
    return "text-[#0A2540] cursor-pointer hover:bg-[#F1F5F6]";
  }

  /* ---- form cliente ---- */
  function valida(): boolean {
    if (!barca) return false;
    const e: Errori = {};
    if (!checkin || !checkout) e.date = "Seleziona check-in e check-out sul calendario";
    if (!cliente.nome.trim()) e.nome = "Campo obbligatorio";
    if (!cliente.cognome.trim()) e.cognome = "Campo obbligatorio";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cliente.email)) e.email = "Email non valida";
    if (!/^[+\d\s]{6,}$/.test(cliente.telefono)) e.telefono = "Numero di telefono non valido";
    if (!cliente.persone || cliente.persone < 1 || cliente.persone > barca.capienzaMax) {
      e.persone = `Inserisci un numero tra 1 e ${barca.capienzaMax}`;
    }
    setErrori(e);
    return Object.keys(e).length === 0;
  }

  async function confermaPrenotazione(e: React.FormEvent) {
    e.preventDefault();
    if (!valida() || !barca || !checkin || !checkout) return;
    setInvio(true);
    setErroreInvio(null);
    try {
      // L'API accetta solo email + nome_prenotazione come dati cliente, con
      // date in formato ISO (non GG/MM/AAAA come nelle risposte GET).
      const r = await fetch(`${API}?action=add_prenotazione`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idBarca: barca.id,
          data_checkin: toISO(checkin),
          data_checkout: toISO(checkout),
          email: cliente.email,
          nome_prenotazione: `${cliente.nome} ${cliente.cognome}`.trim(),
        }),
      });
      const risultato = await r.json().catch(() => ({}));
      if (!r.ok || !risultato?.success) throw new Error(risultato?.message || "Il server ha rifiutato la prenotazione.");

      setPrenotazioni((p) => [...p, { id: risultato.id, idBarca: barca.id, checkin, checkout }]);
      setConfermata({ ...cliente, checkin, checkout, notti, totale, codice: `CC-${risultato.id ?? Math.random().toString(36).slice(2, 8).toUpperCase()}` });
    } catch (e: any) {
      setErroreInvio(e.message);
    } finally {
      setInvio(false);
    }
  }
  function nuovaPrenotazione() {
    setCliente({ nome: "", cognome: "", email: "", telefono: "", persone: 1 });
    azzera();
  }

  /* ============================== RENDER ============================== */
  if (caricamento) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-[#E1E8EA] p-10 flex flex-col items-center gap-3 max-w-lg mx-auto">
        <CircularProgress size={28} sx={{ color: "#0A2540" }} />
        <p className="text-sm text-[#4C6577]">Caricamento dati imbarcazione…</p>
      </div>
    );
  }
  if (erroreCaricamento || !barca) {
    return (
      <div className="max-w-lg mx-auto">
        <Alert severity="error" icon={<AlertTriangle className="w-5 h-5" />}
          action={<Button color="inherit" size="small" onClick={caricaDati}>Riprova</Button>}>
          {erroreCaricamento || "Impossibile caricare i dati dal sito."}
        </Alert>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: "'Inter', sans-serif" }} className="min-h-full w-full bg-[#F1F5F6] p-4 sm:p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-11 h-11 rounded-full bg-[#0A2540] flex items-center justify-center shrink-0">
            <Anchor className="w-5 h-5 text-[#D4A24C]" />
          </div>
          <div>
            <h1 className="font-display text-2xl text-[#0A2540] leading-tight">Crystalcharting</h1>
            <p className="text-xs text-[#4C6577] tracking-wide uppercase">Prenota la tua imbarcazione</p>
          </div>
        </div>

        {confermata ? (
          <RiepilogoFinale barca={barca} cliente={confermata} onNuova={nuovaPrenotazione} />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6 items-start">
            <div className="bg-white rounded-2xl shadow-sm border border-[#E1E8EA] p-5 sm:p-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-[#0A2540] flex items-center justify-center shrink-0">
                  <Ship className="w-6 h-6 text-[#D4A24C]" />
                </div>
                <div className="min-w-0">
                  <h2 className="font-display text-xl text-[#0A2540] truncate">{barca.nome}</h2>
                  <p className="text-sm text-[#4C6577]">{barca.tipo} · {barca.porto}</p>
                </div>
                <div className="ml-auto text-right shrink-0">
                  <p className="text-lg font-bold text-[#0A2540]">€{barca.prezzoGiorno}</p>
                  <p className="text-xs text-[#8098A6]">a giorno</p>
                </div>
              </div>

              <div className="flex items-center justify-between mt-6 mb-4">
                <button type="button" onClick={() => cambiaMese(-1)} disabled={meseCorrente}
                  className="w-9 h-9 rounded-full flex items-center justify-center border border-[#E1E8EA] text-[#0A2540] disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#F1F5F6] transition">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="font-display text-lg text-[#0A2540]">{MESI[mese.getMonth()]} {mese.getFullYear()}</span>
                <button type="button" onClick={() => cambiaMese(1)}
                  className="w-9 h-9 rounded-full flex items-center justify-center border border-[#E1E8EA] text-[#0A2540] hover:bg-[#F1F5F6] transition">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-7 mb-1">
                {GIORNI.map((g) => (
                  <div key={g} className="text-center text-[11px] font-semibold text-[#8098A6] py-1 uppercase tracking-wide">{g}</div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-y-1">
                {celle.map((d, i) => d ? (
                  <button type="button" key={toISO(d)} disabled={passato(d) || occupato(d)}
                    onClick={() => clicGiorno(d)} onMouseEnter={() => setHover(d)} onMouseLeave={() => setHover(null)}
                    title={occupato(d) ? "Non disponibile" : toItaliano(d)}
                    className={`relative h-10 sm:h-11 flex items-center justify-center text-sm rounded-lg mx-auto w-full transition select-none ${classiGiorno(d)}`}>
                    {d.getDate()}
                  </button>
                ) : <div key={"vuoto-" + i} />)}
              </div>

              <div className="flex flex-wrap gap-4 mt-5 pt-4 border-t border-[#EEF2F3] text-xs text-[#4C6577]">
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-[#0A2540]" />Check-in / Check-out</span>
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-[#D9EEEC]" />Periodo selezionato</span>
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-[#F6E7E5]" />Non disponibile</span>
              </div>

              {checkin && (
                <button type="button" onClick={azzera}
                  className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-[#4C6577] hover:text-[#0A2540] transition">
                  <RotateCcw className="w-3.5 h-3.5" /> Azzera selezione date
                </button>
              )}
            </div>

            <div className="flex flex-col gap-5">
              <div className="bg-[#0A2540] rounded-2xl p-5 text-white">
                <h3 className="font-display text-lg mb-4 flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4 text-[#D4A24C]" /> Riepilogo prenotazione
                </h3>
                <div className="space-y-2.5 text-sm">
                  <Riga etichetta="Imbarcazione" valore={barca.nome} />
                  <Riga etichetta="Check-in" valore={checkin ? toItaliano(checkin) : "—"} />
                  <Riga etichetta="Check-out" valore={checkout ? toItaliano(checkout) : "—"} />
                  <Riga etichetta="Durata" valore={notti > 0 ? `${notti} ${notti === 1 ? "giorno" : "giorni"}` : "—"} />
                </div>
                <div className="h-px bg-white/15 my-4" />
                <div className="flex justify-between items-baseline">
                  <span className="text-sm text-[#B9CAD3]">Totale</span>
                  <span className="font-display text-2xl text-[#D4A24C]">{totale > 0 ? `€${totale.toLocaleString("it-IT")}` : "€0"}</span>
                </div>
                {notti === 0 && <p className="text-xs text-[#8098A6] mt-3">Seleziona check-in e check-out per calcolare il totale.</p>}
              </div>

              <FormCliente cliente={cliente} setCliente={setCliente} errori={errori} invio={invio}
                disabilitato={!checkin || !checkout} capienzaMax={barca.capienzaMax} onSubmit={confermaPrenotazione} />
            </div>
          </div>
        )}
      </div>

      <Snackbar open={Boolean(erroreInvio)} autoHideDuration={6000} onClose={() => setErroreInvio(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
        <Alert severity="error" variant="filled" onClose={() => setErroreInvio(null)}>{erroreInvio}</Alert>
      </Snackbar>
    </div>
  );
}

/* ============================== SOTTOCOMPONENTI ============================== */

function Riga({ etichetta, valore }: { etichetta: string; valore: string }) {
  return (
    <div className="flex justify-between text-[#B9CAD3]">
      <span>{etichetta}</span>
      <span className="text-white font-medium text-right">{valore}</span>
    </div>
  );
}

const stileCampo = {
  "& .MuiOutlinedInput-root": {
    borderRadius: "0.5rem", fontSize: "0.875rem",
    "& fieldset": { borderColor: "#DCE4E7" },
    "&:hover fieldset": { borderColor: "#0A2540" },
    "&.Mui-focused fieldset": { borderColor: "#0A2540" },
  },
};

interface FormProps {
  cliente: DatiCliente;
  setCliente: React.Dispatch<React.SetStateAction<DatiCliente>>;
  errori: Errori;
  onSubmit: (e: React.FormEvent) => void;
  disabilitato: boolean;
  capienzaMax: number;
  invio: boolean;
}
function FormCliente({ cliente, setCliente, errori, onSubmit, disabilitato, capienzaMax, invio }: FormProps) {
  const aggiorna = (campo: keyof DatiCliente) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setCliente((c) => ({ ...c, [campo]: campo === "persone" ? Number(e.target.value) : e.target.value }));

  return (
    <form onSubmit={onSubmit} className="bg-white rounded-2xl shadow-sm border border-[#E1E8EA] p-5 flex flex-col gap-4">
      <h3 className="font-display text-lg text-[#0A2540]">I tuoi dati</h3>
      {disabilitato && <p className="text-xs text-[#8098A6] -mt-2">Seleziona prima le date sul calendario a sinistra.</p>}

      <div className="grid grid-cols-2 gap-3">
        <TextField label="Nome" size="small" fullWidth value={cliente.nome} onChange={aggiorna("nome")}
          error={Boolean(errori.nome)} helperText={errori.nome} placeholder="Mario" sx={stileCampo}
          InputProps={{ startAdornment: <InputAdornment position="start"><User className="w-4 h-4 text-[#8098A6]" /></InputAdornment> }} />
        <TextField label="Cognome" size="small" fullWidth value={cliente.cognome} onChange={aggiorna("cognome")}
          error={Boolean(errori.cognome)} helperText={errori.cognome} placeholder="Rossi" sx={stileCampo} />
      </div>

      <TextField label="Email" type="email" size="small" fullWidth value={cliente.email} onChange={aggiorna("email")}
        error={Boolean(errori.email)} helperText={errori.email} placeholder="mario.rossi@email.com" sx={stileCampo}
        InputProps={{ startAdornment: <InputAdornment position="start"><Mail className="w-4 h-4 text-[#8098A6]" /></InputAdornment> }} />

      <div className="grid grid-cols-2 gap-3">
        <TextField label="Telefono" size="small" fullWidth value={cliente.telefono} onChange={aggiorna("telefono")}
          error={Boolean(errori.telefono)} helperText={errori.telefono} placeholder="+39 333 1234567" sx={stileCampo}
          InputProps={{ startAdornment: <InputAdornment position="start"><Phone className="w-4 h-4 text-[#8098A6]" /></InputAdornment> }} />
        <TextField label="Passeggeri" type="number" size="small" fullWidth inputProps={{ min: 1, max: capienzaMax }}
          value={cliente.persone} onChange={aggiorna("persone")} error={Boolean(errori.persone)} helperText={errori.persone} sx={stileCampo} />
      </div>

      {errori.date && <p className="text-xs text-[#C1554B] bg-[#F6E7E5] rounded-lg px-3 py-2">{errori.date}</p>}

      <Button type="submit" disabled={invio} fullWidth disableElevation
        startIcon={invio ? <CircularProgress size={16} sx={{ color: "#0A2540" }} /> : <Check className="w-4 h-4" />}
        sx={{ mt: 0.5, borderRadius: "0.5rem", backgroundColor: "#D4A24C", color: "#0A2540", fontWeight: 600,
          fontSize: "0.875rem", textTransform: "none", py: 1.1, "&:hover": { backgroundColor: "#C1913D" } }}>
        {invio ? "Invio in corso…" : "Conferma prenotazione"}
      </Button>
    </form>
  );
}

function RiepilogoFinale({ barca, cliente, onNuova }: { barca: Barca; cliente: Confermata; onNuova: () => void }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-[#E1E8EA] p-8 sm:p-10 text-center max-w-lg mx-auto">
      <div className="w-14 h-14 rounded-full bg-[#D9EEEC] flex items-center justify-center mx-auto mb-5">
        <Check className="w-7 h-7 text-[#0A2540]" />
      </div>
      <h2 className="font-display text-2xl text-[#0A2540] mb-1">Prenotazione confermata</h2>
      <p className="text-sm text-[#4C6577] mb-6">Codice prenotazione <span className="font-semibold text-[#0A2540]">{cliente.codice}</span></p>

      <div className="bg-[#F1F5F6] rounded-xl p-5 text-left text-sm space-y-2.5 mb-6">
        <RigaScura etichetta="Imbarcazione" valore={barca.nome} />
        <RigaScura etichetta="Cliente" valore={`${cliente.nome} ${cliente.cognome}`} />
        <RigaScura etichetta="Check-in" valore={toItaliano(cliente.checkin)} />
        <RigaScura etichetta="Check-out" valore={toItaliano(cliente.checkout)} />
        <RigaScura etichetta="Passeggeri" valore={String(cliente.persone)} />
        <div className="h-px bg-[#DCE4E7] my-1" />
        <div className="flex justify-between text-base">
          <span className="text-[#0A2540] font-semibold">Totale ({cliente.notti} {cliente.notti === 1 ? "giorno" : "giorni"})</span>
          <span className="text-[#0A2540] font-bold">€{cliente.totale.toLocaleString("it-IT")}</span>
        </div>
      </div>

      <Button onClick={onNuova} startIcon={<RotateCcw className="w-4 h-4" />}
        sx={{ borderRadius: "0.5rem", border: "1px solid #DCE4E7", color: "#0A2540", fontWeight: 600,
          fontSize: "0.875rem", textTransform: "none", "&:hover": { backgroundColor: "#F1F5F6", border: "1px solid #DCE4E7" } }}>
        Effettua un'altra prenotazione
      </Button>
    </div>
  );
}

function RigaScura({ etichetta, valore }: { etichetta: string; valore: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-[#4C6577]">{etichetta}</span>
      <span className="font-medium text-[#0A2540]">{valore}</span>
    </div>
  );
}