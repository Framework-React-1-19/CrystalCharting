import { useState } from "react";

export function Contenitore() {
  return (
    <>
      <Header />
      <Outlet />
      <Footer />
    </>
  );
}
