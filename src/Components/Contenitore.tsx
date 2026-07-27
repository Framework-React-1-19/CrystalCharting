import { Outlet } from "react-router-dom";
import { Header } from "./Header";
import { Footer } from "./Footer";

export function Contenitore() {
  return (
    <>
      <Header />
      <Outlet />
      <Footer />
    </>
  );
}
