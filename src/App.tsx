import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Contenitore } from "./Components/Contenitore";
import { Home } from "./Components/Home";
import { Catalogo } from "./Components/Catalogo";
import { Dettagli } from "./Components/Dettagli";
import { Calendario } from "./Components/Calendario";
import { Admin } from "./Components/Admin";
import { Inserimento } from "./Components/Inserimento";
import { ContenitoreCat } from "./Components/ContenitoreCat";
import { ContenitoreAd } from "./Components/ContenitoreAd";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Contenitore />}>
          <Route index element={<Home />} />

          <Route path="catalogo" element={<ContenitoreCat />}>
            <Route index element={<Catalogo />} />
            <Route path="calendario" element={<Calendario />} />
          </Route>

          <Route path="admin" element={<ContenitoreAd />}>
            <Route index element={<Admin />} />
            <Route path="inserimento" element={<Inserimento />} />
          </Route>

          <Route path="*" element={<>404 Page not found</>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
