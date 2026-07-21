import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Contenitore } from "./Components/Contenitore";
import { Home } from "./Components/Home";
import { Catalogo } from "./Components/Catalogo";
import { Admin } from "./Components/Admin";
import { Login } from "./Components/Login";
import { Inserimento } from "./Components/Inserimento";
import { Prenotazioni } from "./Components/Prenotazioni";
import { NotFound } from "./Components/NotFound";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Contenitore />}>
          <Route index element={<Home />} />

          <Route path="catalogo" element={<Catalogo />} />

          <Route path="admin" element={<Admin />}>
            <Route index element={<Login />} />
            <Route path="Inserimento" element={<Inserimento />} />
            <Route path="Prenotazioni" element={<Prenotazioni />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
