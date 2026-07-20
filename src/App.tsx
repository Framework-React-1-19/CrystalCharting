import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Contenitore } from "./Components/Contenitore";
import { Home } from "./Components/Home";
import { Catalogo } from "./Components/Catalogo";
import { Dettagli } from "./Components/Dettagli";
import { Calendario } from "./Components/Calendario";
import { Admin } from "./Components/Admin";
import { Inserimento } from "./Components/Inserimento";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Contenitore />}>
          <Route index element={<Home />} />

          <Route path="catalogo" element={<Catalogo />}>
            <Route path="dettagli" element={<Dettagli />} />
          </Route>

          <Route path="calendario" element={<Calendario />} />

          <Route path="admin" element={<Admin />}>
            <Route path="inserimento" element={<Inserimento />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App