import { BrowserRouter, Router, Routes } from "react-router-dom";
import { Calendario } from "./Components/Calendario";

export function App() {}

return (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<Contenitore />}></Route>

      <Route index element={<Home />} />

      <Route path="catalogo" element={<Catalogo />} />
      <Route path="calendario" element={<Calendario />} />
    </Routes>
  </BrowserRouter>
);
