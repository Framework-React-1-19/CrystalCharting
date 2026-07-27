import { HashRouter, Routes, Route } from "react-router-dom";
import { Contenitore } from "./Components/Contenitore";
import { Home } from "./Components/Home";
import { Catalogo } from "./Components/Catalogo";
import { Admin } from "./Components/Admin";
import { NotFound } from "./Components/NotFound";
import { Login } from "./Components/Login";

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Contenitore />}>
          <Route index element={<Home />} />
          <Route path="catalogo" element={<Catalogo />} />
          <Route path="admin" element={<Login />} />
          <Route path="adminPage" element={<Admin />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}

export default App;