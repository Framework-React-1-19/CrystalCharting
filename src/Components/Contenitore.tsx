import { useState } from "react";
import { Outlet, useNavigate, Link } from "react-router-dom";
import { Box, Typography } from "@mui/material";
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
