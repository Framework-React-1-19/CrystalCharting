// Interfaccia basata sulla risposta JSON dell'API
export interface Boat {
  idBarca: number;
  nomebarca: string;
  tipo: string;
  alimentazione: string;
  capienza: number;
  cabine: string; // Nota: nel JSON è una stringa (es. "0")
  potenza: number;
  descrizione: string;
  lunghezza: number;
  costo_giornaliero: number;
}

// Interfaccia per la gestione dello stato dei filtri
export interface FilterState {
  tipo: string;
  capienzaMin: number | '';
  lunghezzaMin: number | '';
  lunghezzaMax: number | '';
}