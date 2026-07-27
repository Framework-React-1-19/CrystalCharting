import { useState, useEffect, useMemo, useCallback } from "react";
// https://lucide.dev/guide/react/advanced/typescript
import {
  ChevronLeft,
  ChevronRight,
  Anchor,
  Users,
  Calendar as CalendarIcon,
  Check,
  Phone,
  Mail,
  User,
  Ship,
  RotateCcw,
  AlertTriangle,
} from "lucide-react";
import {
  TextField,
  Button,
  InputAdornment,
  CircularProgress,
  Alert,
  Snackbar,
} from "@mui/material";

/* ============================================================================
   CONFIGURAZIONE API
   Questo componente NON contiene più dati mock ("BARCA", "PRENOTAZIONI_INIZIALI"):
   non funziona in autonomia, ma riceve dal resto del sito (catalogo, router,
   pagina di dettaglio, ecc.) l'id della barca da mostrare tramite la prop
   `idBarca`, e recupera tutto il resto (dati barca + prenotazioni già
   esistenti) dall'API PHP di Crystalcharting.
   ============================================================================ */
const API_BASE_URL = "http://crystalcharting.atwebpages.com/api.php";

/*
  ENDPOINT REALI (dalla documentazione dell'API):

  IMBARCAZIONI
    - GET  ?action=get_barche                → elenco di tutte le barche
    - POST ?action=add_barca                 → crea una barca
    - GET  ?action=delete_barca&id=X          → elimina una barca (e le sue prenotazioni)

  PRENOTAZIONI
    - GET  ?action=get_prenotazioni           → elenco di TUTTE le prenotazioni di TUTTE
                                                 le barche, con le date già formattate in
                                                 GG/MM/AAAA. Non esiste un filtro per
                                                 barca lato server: il filtro per idBarca
                                                 viene quindi fatto qui lato client.
    - POST ?action=add_prenotazione           → crea una prenotazione. Il body richiesto è
                                                 { idBarca, data_checkin, data_checkout,
                                                   email, nome_prenotazione }, con le date
                                                 in formato ISO YYYY-MM-DD (non GG/MM/AAAA).
    - GET  ?action=delete_prenotazione&id=X    → elimina una prenotazione (idPrenotazione)

  Nota bene: l'API di add_prenotazione accetta solo email e nome_prenotazione come dati
  del cliente (non nome/cognome separati, né telefono, né numero passeggeri). Il form
  qui sotto continua a raccogliere questi dati per mostrarli nel riepilogo e per
  verificare la capienza massima, ma solo email e nome+cognome uniti vengono inviati
  al server: se servono anche telefono e numero passeggeri lato database, il backend
  PHP va esteso di conseguenza.

  Nota anche che l'URL è in http:// (non https://): se il resto del sito è servito in
  https, il browser potrebbe bloccare la richiesta come "contenuto misto".
*/
const ENDPOINT_GET_BARCHE = `${API_BASE_URL}?action=get_barche`;
const ENDPOINT_GET_PRENOTAZIONI = `${API_BASE_URL}?action=get_prenotazioni`;
const ENDPOINT_ADD_PRENOTAZIONE = `${API_BASE_URL}?action=add_prenotazione`;
// La cancellazione (?action=delete_prenotazione&id=X) è riservata al pannello
// admin del sito: questo componente pubblico non la espone.

const GIORNI_SETTIMANA = ["Lun", "Mar", "Mer", "Gio", "Ven", "Sab", "Dom"];
const MESI = [
  "Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno",
  "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre",
];

/* ============================================================================
   UTILITY DATE — lavoriamo sempre con date "pulite" (senza orario)
   perché la prenotazione è a giornata intera, non a ore.
   ============================================================================ */
function pulisci(data) {
  const d = new Date(data);
  d.setHours(0, 0, 0, 0);
  return d;
}

// L'API restituisce le prenotazioni con le date già formattate in GG/MM/AAAA.
function parseDataItaliana(str) {
  const [d, m, y] = String(str).split("/").map(Number);
  return new Date(y, m - 1, d);
}

function formatISO(data) {
  const y = data.getFullYear();
  const m = String(data.getMonth() + 1).padStart(2, "0");
  const d = String(data.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function formatItaliano(data) {
  return data.toLocaleDateString("it-IT", { day: "2-digit", month: "short", year: "numeric" });
}

function differenzaGiorni(a, b) {
  return Math.round((b - a) / (1000 * 60 * 60 * 24));
}

/* ============================================================================
   NORMALIZZAZIONE DATI API
   Il backend PHP restituisce chiavi come "nomebarca", "costo_giornaliero",
   "idBarca" ecc. Qui le mappiamo ai nomi usati internamente dal componente,
   in modo tollerante rispetto a piccole differenze di naming.
   ============================================================================ */
function normalizzaBarca(raw) {
  return {
    id: raw.idBarca ?? raw.id,
    nome: raw.nomebarca ?? raw.nome ?? "Imbarcazione",
    tipo: raw.tipo ?? "—",
    alimentazione: raw.alimentazione ?? null,
    porto: raw.porto ?? raw.marina ?? "Marina di Genova",
    capienzaMax: Number(raw.capienza ?? raw.capienzaMax ?? 1),
    prezzoGiorno: Number(raw.costo_giornaliero ?? raw.prezzoGiorno ?? 0),
  };
}

function normalizzaPrenotazione(raw) {
  return {
    id: raw.idPrenotazione ?? raw.id,
    idBarca: raw.idBarca ?? raw.id_barca,
    checkin: parseDataItaliana(raw.data_checkin ?? raw.checkin),
    checkout: parseDataItaliana(raw.data_checkout ?? raw.checkout),
  };
}

/* ============================================================================
   COMPONENTE PRINCIPALE
   `idBarca` viene passato dal resto del sito (es. dalla card cliccata nel
   catalogo). `barcaIniziale`, opzionale, permette di passare i dati della
   barca già noti al resto del sito per evitare un primo fetch a vuoto.
   ============================================================================ */
export default function CrystalChartingCalendario({ idBarca, barcaIniziale = null }) {
  const oggi = useMemo(() => pulisci(new Date()), []);

  const [meseVisualizzato, setMeseVisualizzato] = useState(
    new Date(oggi.getFullYear(), oggi.getMonth(), 1)
  );
  const [checkin, setCheckin] = useState(null);
  const [checkout, setCheckout] = useState(null);
  const [hoverData, setHoverData] = useState(null);

  const [barca, setBarca] = useState(barcaIniziale ? normalizzaBarca(barcaIniziale) : null);
  const [prenotazioni, setPrenotazioni] = useState([]);
  const [caricamento, setCaricamento] = useState(!barcaIniziale);
  const [erroreCaricamento, setErroreCaricamento] = useState(null);

  const [datiCliente, setDatiCliente] = useState({
    nome: "",
    cognome: "",
    email: "",
    telefono: "",
    numPersone: 1,
  });
  const [errori, setErrori] = useState({});
  const [confermata, setConfermata] = useState(null);
  const [invioInCorso, setInvioInCorso] = useState(false);
  const [erroreInvio, setErroreInvio] = useState(null);

  /* ---- CARICAMENTO DATI DA API -------------------------------------------- */
  const caricaDati = useCallback(async () => {
    if (!idBarca) {
      setErroreCaricamento("Nessuna imbarcazione selezionata (idBarca non ricevuto dal sito).");
      setCaricamento(false);
      return;
    }
    setCaricamento(true);
    setErroreCaricamento(null);
    try {
      const rispostaBarche = await fetch(ENDPOINT_GET_BARCHE);
      if (!rispostaBarche.ok) throw new Error("Il server non risponde (elenco barche).");
      const datiBarche = await rispostaBarche.json();
      const elencoBarche = Array.isArray(datiBarche) ? datiBarche : datiBarche?.barche ?? [];
      const barcaTrovata = elencoBarche.find(
        (b) => String(b.idBarca ?? b.id) === String(idBarca)
      );
      if (!barcaTrovata) throw new Error("Imbarcazione non trovata nel catalogo.");
      setBarca(normalizzaBarca(barcaTrovata));

      try {
        const rispostaPren = await fetch(ENDPOINT_GET_PRENOTAZIONI);
        if (rispostaPren.ok) {
          const datiPren = await rispostaPren.json();
          const elencoPren = Array.isArray(datiPren) ? datiPren : datiPren?.data ?? datiPren?.prenotazioni ?? [];
          const soloDiQuestaBarca = elencoPren
            .map(normalizzaPrenotazione)
            .filter((p) => String(p.idBarca) === String(idBarca));
          setPrenotazioni(soloDiQuestaBarca);
        } else {
          setPrenotazioni([]);
        }
      } catch {
        // Endpoint prenotazioni non disponibile/raggiungibile: il calendario
        // resta comunque utilizzabile, semplicemente senza date bloccate.
        setPrenotazioni([]);
      }
    } catch (err) {
      setErroreCaricamento(err.message || "Errore durante il caricamento dei dati.");
    } finally {
      setCaricamento(false);
    }
  }, [idBarca]);

  useEffect(() => {
    caricaDati();
  }, [caricaDati]);

  const rangePrenotati = useMemo(
    () => prenotazioni.map((p) => ({ checkin: p.checkin, checkout: p.checkout })),
    [prenotazioni]
  );

  /* ---- LOGICA DI DISPONIBILITÀ -------------------------------------------- */

  function isOccupato(data) {
    return rangePrenotati.some((r) => data >= r.checkin && data < r.checkout);
  }

  function isPassato(data) {
    return data < oggi;
  }

  function intervalloLibero(inizio, fine) {
    return !rangePrenotati.some((r) => inizio < r.checkout && fine > r.checkin);
  }

  function handleClickGiorno(data) {
    if (isPassato(data) || isOccupato(data)) return;
    setConfermata(null);

    if (!checkin || checkout) {
      setCheckin(data);
      setCheckout(null);
      return;
    }

    if (data <= checkin) {
      setCheckin(data);
      setCheckout(null);
      return;
    }

    if (!intervalloLibero(checkin, data)) {
      setCheckin(data);
      setCheckout(null);
      return;
    }

    setCheckout(data);
  }

  function resetSelezione() {
    setCheckin(null);
    setCheckout(null);
    setConfermata(null);
    setErrori({});
  }

  const notti = checkin && checkout ? differenzaGiorni(checkin, checkout) : 0;
  const totale = barca ? notti * barca.prezzoGiorno : 0;

  /* ---- GENERAZIONE GRIGLIA MESE -------------------------------------------- */
  const griglia = useMemo(() => {
    const primoGiorno = new Date(meseVisualizzato.getFullYear(), meseVisualizzato.getMonth(), 1);
    const ultimoGiorno = new Date(meseVisualizzato.getFullYear(), meseVisualizzato.getMonth() + 1, 0);
    const offset = (primoGiorno.getDay() + 6) % 7;

    const celle = [];
    for (let i = 0; i < offset; i++) celle.push(null);
    for (let giorno = 1; giorno <= ultimoGiorno.getDate(); giorno++) {
      celle.push(new Date(meseVisualizzato.getFullYear(), meseVisualizzato.getMonth(), giorno));
    }
    return celle;
  }, [meseVisualizzato]);

  const meseCorrenteReale =
    oggi.getFullYear() === meseVisualizzato.getFullYear() && oggi.getMonth() === meseVisualizzato.getMonth();

  function meseSuccessivo() {
    setMeseVisualizzato((m) => new Date(m.getFullYear(), m.getMonth() + 1, 1));
  }
  function mesePrecedente() {
    if (meseCorrenteReale) return;
    setMeseVisualizzato((m) => new Date(m.getFullYear(), m.getMonth() - 1, 1));
  }

  /* ---- STATO VISIVO DI OGNI GIORNO ------------------------------------------ */
  function statoGiorno(data) {
    if (!data) return null;
    const passato = isPassato(data);
    const occupato = isOccupato(data);
    const isCheckin = checkin && data.getTime() === checkin.getTime();
    const isCheckout = checkout && data.getTime() === checkout.getTime();
    const inRangeConfermato = checkin && checkout && data > checkin && data < checkout;

    let inAnteprima = false;
    let anteprimaConflitto = false;
    if (checkin && !checkout && hoverData && hoverData > checkin) {
      if (data > checkin && data < hoverData) {
        inAnteprima = true;
        anteprimaConflitto = !intervalloLibero(checkin, hoverData);
      }
    }

    return { passato, occupato, isCheckin, isCheckout, inRangeConfermato, inAnteprima, anteprimaConflitto };
  }

  /* ---- VALIDAZIONE E INVIO FORM --------------------------------------------- */
  function validaForm() {
    const nuoviErrori = {};
    if (!checkin || !checkout) nuoviErrori.date = "Seleziona check-in e check-out sul calendario";
    if (!datiCliente.nome.trim()) nuoviErrori.nome = "Campo obbligatorio";
    if (!datiCliente.cognome.trim()) nuoviErrori.cognome = "Campo obbligatorio";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(datiCliente.email)) nuoviErrori.email = "Email non valida";
    if (!/^[+\d\s]{6,}$/.test(datiCliente.telefono)) nuoviErrori.telefono = "Numero di telefono non valido";
    const persone = Number(datiCliente.numPersone);
    if (!persone || persone < 1 || persone > (barca?.capienzaMax ?? 1)) {
      nuoviErrori.numPersone = `Inserisci un numero tra 1 e ${barca?.capienzaMax ?? 1}`;
    }
    setErrori(nuoviErrori);
    return Object.keys(nuoviErrori).length === 0;
  }

  async function handleConferma(e) {
    e.preventDefault();
    if (!validaForm() || !barca) return;

    // Payload nel formato richiesto da ?action=add_prenotazione: date in ISO
    // (YYYY-MM-DD, non GG/MM/AAAA) e nome_prenotazione come stringa unica.
    // Telefono e numero passeggeri non sono previsti dall'API: restano solo
    // nel riepilogo mostrato a schermo.
    const nuovaPrenotazione = {
      idBarca: barca.id,
      data_checkin: formatISO(checkin),
      data_checkout: formatISO(checkout),
      email: datiCliente.email,
      nome_prenotazione: `${datiCliente.nome} ${datiCliente.cognome}`.trim(),
    };

    setInvioInCorso(true);
    setErroreInvio(null);
    try {
      const risposta = await fetch(ENDPOINT_ADD_PRENOTAZIONE, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(nuovaPrenotazione),
      });
      const risultato = await risposta.json().catch(() => ({}));
      if (!risposta.ok || !risultato?.success) {
        throw new Error(risultato?.message || "Il server ha rifiutato la prenotazione.");
      }

      setPrenotazioni((prev) => [
        ...prev,
        { id: risultato.id, idBarca: barca.id, checkin, checkout },
      ]);
      setConfermata({
        ...datiCliente,
        checkin,
        checkout,
        notti,
        totale,
        codice: risultato?.id ? `CC-${risultato.id}` : "CC-" + Math.random().toString(36).slice(2, 8).toUpperCase(),
      });
    } catch (err) {
      setErroreInvio(err.message || "Impossibile salvare la prenotazione. Riprova.");
    } finally {
      setInvioInCorso(false);
    }
  }

  function handleNuovaPrenotazione() {
    setDatiCliente({ nome: "", cognome: "", email: "", telefono: "", numPersone: 1 });
    resetSelezione();
  }

  /* ==========================================================================
     RENDER
     ========================================================================== */
  return (
    <div
      style={{ fontFamily: "'Inter', sans-serif" }}
      className="min-h-full w-full bg-[#F1F5F6] p-4 sm:p-8"
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=Inter:wght@400;500;600;700&display=swap');
        .font-display { font-family: 'Playfair Display', serif; }
      `}</style>

      <div className="max-w-5xl mx-auto">
        {/* HEADER BRAND */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-11 h-11 rounded-full bg-[#0A2540] flex items-center justify-center shrink-0">
            <Anchor className="w-5 h-5 text-[#D4A24C]" />
          </div>
          <div>
            <h1 className="font-display text-2xl text-[#0A2540] leading-tight">Crystalcharting</h1>
            <p className="text-xs text-[#4C6577] tracking-wide uppercase">Prenota la tua imbarcazione</p>
          </div>
        </div>

        {caricamento ? (
          <StatoCaricamento />
        ) : erroreCaricamento || !barca ? (
          <StatoErrore messaggio={erroreCaricamento} onRiprova={caricaDati} />
        ) : confermata ? (
          <ConfermaPrenotazione barca={barca} datiCliente={confermata} onNuovaPrenotazione={handleNuovaPrenotazione} />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6 items-start">
            {/* COLONNA CALENDARIO */}
            <div className="bg-white rounded-2xl shadow-sm border border-[#E1E8EA] p-5 sm:p-6">
              <SchedaBarca barca={barca} />

              <div className="flex items-center justify-between mt-6 mb-4">
                <button
                  type="button"
                  onClick={mesePrecedente}
                  disabled={meseCorrenteReale}
                  className="w-9 h-9 rounded-full flex items-center justify-center border border-[#E1E8EA] text-[#0A2540] disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#F1F5F6] transition"
                  aria-label="Mese precedente"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="font-display text-lg text-[#0A2540]">
                  {MESI[meseVisualizzato.getMonth()]} {meseVisualizzato.getFullYear()}
                </span>
                <button
                  type="button"
                  onClick={meseSuccessivo}
                  className="w-9 h-9 rounded-full flex items-center justify-center border border-[#E1E8EA] text-[#0A2540] hover:bg-[#F1F5F6] transition"
                  aria-label="Mese successivo"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-7 mb-1">
                {GIORNI_SETTIMANA.map((g) => (
                  <div key={g} className="text-center text-[11px] font-semibold text-[#8098A6] py-1 uppercase tracking-wide">
                    {g}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-y-1">
                {griglia.map((data, idx) => {
                  if (!data) return <div key={"vuoto-" + idx} />;
                  const s = statoGiorno(data);
                  const disabilitato = s.passato || s.occupato;

                  let classi =
                    "relative h-10 sm:h-11 flex items-center justify-center text-sm rounded-lg mx-auto w-full transition select-none ";

                  if (disabilitato) {
                    classi += s.occupato
                      ? "bg-[#F6E7E5] text-[#C1554B] line-through cursor-not-allowed "
                      : "text-[#C3CDD3] cursor-not-allowed ";
                  } else if (s.isCheckin || s.isCheckout) {
                    classi += "bg-[#0A2540] text-white font-semibold cursor-pointer ";
                  } else if (s.inRangeConfermato) {
                    classi += "bg-[#D9EEEC] text-[#0A2540] cursor-pointer ";
                  } else if (s.inAnteprima) {
                    classi += s.anteprimaConflitto
                      ? "bg-[#F6E7E5] text-[#C1554B] cursor-pointer "
                      : "bg-[#EAF4F3] text-[#0A2540] cursor-pointer ";
                  } else {
                    classi += "text-[#0A2540] cursor-pointer hover:bg-[#F1F5F6] ";
                  }

                  return (
                    <button
                      type="button"
                      key={formatISO(data)}
                      disabled={disabilitato}
                      onClick={() => handleClickGiorno(data)}
                      onMouseEnter={() => setHoverData(data)}
                      onMouseLeave={() => setHoverData(null)}
                      className={classi}
                      title={s.occupato ? "Non disponibile" : formatItaliano(data)}
                    >
                      {data.getDate()}
                    </button>
                  );
                })}
              </div>

              <div className="flex flex-wrap gap-4 mt-5 pt-4 border-t border-[#EEF2F3] text-xs text-[#4C6577]">
                <LegendaVoce colore="bg-[#0A2540]" etichetta="Check-in / Check-out" />
                <LegendaVoce colore="bg-[#D9EEEC]" etichetta="Periodo selezionato" />
                <LegendaVoce colore="bg-[#F6E7E5]" etichetta="Non disponibile" />
              </div>

              {checkin && (
                <button
                  type="button"
                  onClick={resetSelezione}
                  className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-[#4C6577] hover:text-[#0A2540] transition"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Azzera selezione date
                </button>
              )}
            </div>

            {/* COLONNA RECAP + FORM */}
            <div className="flex flex-col gap-5">
              <RecapCard barca={barca} checkin={checkin} checkout={checkout} notti={notti} totale={totale} />
              <FormPrenotazione
                datiCliente={datiCliente}
                setDatiCliente={setDatiCliente}
                errori={errori}
                onSubmit={handleConferma}
                disabilitato={!checkin || !checkout}
                capienzaMax={barca.capienzaMax}
                invioInCorso={invioInCorso}
              />
            </div>
          </div>
        )}
      </div>

      {/* Errori di invio prenotazione, mostrati come toast MUI */}
      <Snackbar
        open={Boolean(erroreInvio)}
        autoHideDuration={6000}
        onClose={() => setErroreInvio(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity="error" variant="filled" onClose={() => setErroreInvio(null)}>
          {erroreInvio}
        </Alert>
      </Snackbar>
    </div>
  );
}

/* ============================================================================
   SOTTOCOMPONENTI
   ============================================================================ */

function StatoCaricamento() {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-[#E1E8EA] p-10 flex flex-col items-center justify-center gap-3 max-w-lg mx-auto">
      <CircularProgress size={28} sx={{ color: "#0A2540" }} />
      <p className="text-sm text-[#4C6577]">Caricamento dati imbarcazione…</p>
    </div>
  );
}

function StatoErrore({ messaggio, onRiprova }) {
  return (
    <div className="max-w-lg mx-auto">
      <Alert
        severity="error"
        icon={<AlertTriangle className="w-5 h-5" />}
        action={
          <Button color="inherit" size="small" onClick={onRiprova}>
            Riprova
          </Button>
        }
      >
        {messaggio || "Impossibile caricare i dati dal sito."}
      </Alert>
    </div>
  );
}

function LegendaVoce({ colore, etichetta }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className={`w-3 h-3 rounded ${colore}`} />
      {etichetta}
    </div>
  );
}

function SchedaBarca({ barca }) {
  return (
    <div className="flex items-center gap-4">
      <div className="w-14 h-14 rounded-xl bg-[#0A2540] flex items-center justify-center shrink-0">
        <Ship className="w-6 h-6 text-[#D4A24C]" />
      </div>
      <div className="min-w-0">
        <h2 className="font-display text-xl text-[#0A2540] truncate">{barca.nome}</h2>
        <p className="text-sm text-[#4C6577]">
          {barca.tipo} · {barca.porto}
        </p>
      </div>
      <div className="ml-auto text-right shrink-0">
        <p className="text-lg font-bold text-[#0A2540]">€{barca.prezzoGiorno}</p>
        <p className="text-xs text-[#8098A6]">a giorno</p>
      </div>
    </div>
  );
}

function RecapCard({ barca, checkin, checkout, notti, totale }) {
  return (
    <div className="bg-[#0A2540] rounded-2xl p-5 text-white">
      <h3 className="font-display text-lg mb-4 flex items-center gap-2">
        <CalendarIcon className="w-4 h-4 text-[#D4A24C]" />
        Riepilogo prenotazione
      </h3>

      <div className="space-y-2.5 text-sm">
        <div className="flex justify-between text-[#B9CAD3]">
          <span>Imbarcazione</span>
          <span className="text-white font-medium text-right">{barca.nome}</span>
        </div>
        <div className="flex justify-between text-[#B9CAD3]">
          <span>Check-in</span>
          <span className="text-white font-medium">{checkin ? formatItaliano(checkin) : "—"}</span>
        </div>
        <div className="flex justify-between text-[#B9CAD3]">
          <span>Check-out</span>
          <span className="text-white font-medium">{checkout ? formatItaliano(checkout) : "—"}</span>
        </div>
        <div className="flex justify-between text-[#B9CAD3]">
          <span>Durata</span>
          <span className="text-white font-medium">{notti > 0 ? `${notti} ${notti === 1 ? "giorno" : "giorni"}` : "—"}</span>
        </div>
      </div>

      <div className="h-px bg-white/15 my-4" />

      <div className="flex justify-between items-baseline">
        <span className="text-sm text-[#B9CAD3]">Totale</span>
        <span className="font-display text-2xl text-[#D4A24C]">
          {totale > 0 ? `€${totale.toLocaleString("it-IT")}` : "€0"}
        </span>
      </div>
      {notti === 0 && (
        <p className="text-xs text-[#8098A6] mt-3">Seleziona check-in e check-out sul calendario per calcolare il totale.</p>
      )}
    </div>
  );
}

/* Campi del form realizzati con i TextField di @mui/material, mantenendo
   le icone lucide-react come adornment per coerenza visiva col resto della UI. */
function FormPrenotazione({ datiCliente, setDatiCliente, errori, onSubmit, disabilitato, capienzaMax, invioInCorso }) {
  function aggiorna(campo, valore) {
    setDatiCliente((prev) => ({ ...prev, [campo]: valore }));
  }

  const muiSx = {
    "& .MuiOutlinedInput-root": {
      borderRadius: "0.5rem",
      fontSize: "0.875rem",
      "& fieldset": { borderColor: "#DCE4E7" },
      "&:hover fieldset": { borderColor: "#0A2540" },
      "&.Mui-focused fieldset": { borderColor: "#0A2540" },
    },
  };

  return (
    <form onSubmit={onSubmit} className="bg-white rounded-2xl shadow-sm border border-[#E1E8EA] p-5 flex flex-col gap-4">
      <h3 className="font-display text-lg text-[#0A2540]">I tuoi dati</h3>

      {disabilitato && (
        <p className="text-xs text-[#8098A6] -mt-2">Seleziona prima le date sul calendario a sinistra.</p>
      )}

      <div className="grid grid-cols-2 gap-3">
        <TextField
          label="Nome"
          size="small"
          fullWidth
          value={datiCliente.nome}
          onChange={(e) => aggiorna("nome", e.target.value)}
          error={Boolean(errori.nome)}
          helperText={errori.nome}
          placeholder="Mario"
          sx={muiSx}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <User className="w-4 h-4 text-[#8098A6]" />
              </InputAdornment>
            ),
          }}
        />
        <TextField
          label="Cognome"
          size="small"
          fullWidth
          value={datiCliente.cognome}
          onChange={(e) => aggiorna("cognome", e.target.value)}
          error={Boolean(errori.cognome)}
          helperText={errori.cognome}
          placeholder="Rossi"
          sx={muiSx}
        />
      </div>

      <TextField
        label="Email"
        type="email"
        size="small"
        fullWidth
        value={datiCliente.email}
        onChange={(e) => aggiorna("email", e.target.value)}
        error={Boolean(errori.email)}
        helperText={errori.email}
        placeholder="mario.rossi@email.com"
        sx={muiSx}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Mail className="w-4 h-4 text-[#8098A6]" />
            </InputAdornment>
          ),
        }}
      />

      <div className="grid grid-cols-2 gap-3">
        <TextField
          label="Telefono"
          size="small"
          fullWidth
          value={datiCliente.telefono}
          onChange={(e) => aggiorna("telefono", e.target.value)}
          error={Boolean(errori.telefono)}
          helperText={errori.telefono}
          placeholder="+39 333 1234567"
          sx={muiSx}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Phone className="w-4 h-4 text-[#8098A6]" />
              </InputAdornment>
            ),
          }}
        />
        <TextField
          label="Passeggeri"
          type="number"
          size="small"
          fullWidth
          inputProps={{ min: 1, max: capienzaMax }}
          value={datiCliente.numPersone}
          onChange={(e) => aggiorna("numPersone", e.target.value)}
          error={Boolean(errori.numPersone)}
          helperText={errori.numPersone}
          sx={muiSx}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Users className="w-4 h-4 text-[#8098A6]" />
              </InputAdornment>
            ),
          }}
        />
      </div>

      {errori.date && (
        <p className="text-xs text-[#C1554B] bg-[#F6E7E5] rounded-lg px-3 py-2">{errori.date}</p>
      )}

      <Button
        type="submit"
        disabled={invioInCorso}
        fullWidth
        disableElevation
        startIcon={invioInCorso ? <CircularProgress size={16} sx={{ color: "#0A2540" }} /> : <Check className="w-4 h-4" />}
        sx={{
          mt: 0.5,
          borderRadius: "0.5rem",
          backgroundColor: "#D4A24C",
          color: "#0A2540",
          fontWeight: 600,
          fontSize: "0.875rem",
          textTransform: "none",
          py: 1.1,
          "&:hover": { backgroundColor: "#C1913D" },
        }}
      >
        {invioInCorso ? "Invio in corso…" : "Conferma prenotazione"}
      </Button>
    </form>
  );
}

function ConfermaPrenotazione({ barca, datiCliente, onNuovaPrenotazione }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-[#E1E8EA] p-8 sm:p-10 text-center max-w-lg mx-auto">
      <div className="w-14 h-14 rounded-full bg-[#D9EEEC] flex items-center justify-center mx-auto mb-5">
        <Check className="w-7 h-7 text-[#0A2540]" />
      </div>
      <h2 className="font-display text-2xl text-[#0A2540] mb-1">Prenotazione confermata</h2>
      <p className="text-sm text-[#4C6577] mb-6">
        Codice prenotazione <span className="font-semibold text-[#0A2540]">{datiCliente.codice}</span>
      </p>

      <div className="bg-[#F1F5F6] rounded-xl p-5 text-left text-sm space-y-2.5 mb-6">
        <div className="flex justify-between">
          <span className="text-[#4C6577]">Imbarcazione</span>
          <span className="font-medium text-[#0A2540]">{barca.nome}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-[#4C6577]">Cliente</span>
          <span className="font-medium text-[#0A2540]">{datiCliente.nome} {datiCliente.cognome}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-[#4C6577]">Check-in</span>
          <span className="font-medium text-[#0A2540]">{formatItaliano(datiCliente.checkin)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-[#4C6577]">Check-out</span>
          <span className="font-medium text-[#0A2540]">{formatItaliano(datiCliente.checkout)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-[#4C6577]">Passeggeri</span>
          <span className="font-medium text-[#0A2540]">{datiCliente.numPersone}</span>
        </div>
        <div className="h-px bg-[#DCE4E7] my-1" />
        <div className="flex justify-between text-base">
          <span className="text-[#0A2540] font-semibold">Totale ({datiCliente.notti} {datiCliente.notti === 1 ? "giorno" : "giorni"})</span>
          <span className="text-[#0A2540] font-bold">€{datiCliente.totale.toLocaleString("it-IT")}</span>
        </div>
      </div>

      <Button
        onClick={onNuovaPrenotazione}
        startIcon={<RotateCcw className="w-4 h-4" />}
        sx={{
          borderRadius: "0.5rem",
          border: "1px solid #DCE4E7",
          color: "#0A2540",
          fontWeight: 600,
          fontSize: "0.875rem",
          textTransform: "none",
          "&:hover": { backgroundColor: "#F1F5F6", border: "1px solid #DCE4E7" },
        }}
      >
        Effettua un'altra prenotazione
      </Button>
    </div>
  );
}

