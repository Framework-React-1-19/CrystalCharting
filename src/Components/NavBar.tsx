import React, { useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Container,
  IconButton,
  Menu,
  MenuItem,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import DirectionsBoatIcon from "@mui/icons-material/DirectionsBoat";
import { Link, useLocation } from "react-router-dom";

export function Navbar() {
  const location = useLocation();
  const [anchorElNav, setAnchorElNav] = useState<null | HTMLElement>(null);

  // Voci della nav
  const pages = [
    { name: "Home", path: "/" },
    { name: "Catalogo", path: "/catalogo" },
    { name: "Area Admin", path: "/admin" },
  ];

  const handleOpenNavMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElNav(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  return (
    <AppBar position="static" color="primary" elevation={3}>
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          {/*  VISTA DESKTOP: LOGO  */}
          <DirectionsBoatIcon
            sx={{ display: { xs: "none", md: "flex" }, mr: 1 }}
          />
          <Typography
            variant="h6"
            noWrap
            component={Link}
            to="/"
            sx={{
              mr: 4,
              display: { xs: "none", md: "flex" },
              fontWeight: 700,
              letterSpacing: ".1rem",
              color: "inherit",
              textDecoration: "none",
            }}
          >
            Crystal Charting
          </Typography>

          {/* VISTA MOBILE: MENU HAMBURGER */}
          <Box sx={{ flexGrow: 1, display: { xs: "flex", md: "none" } }}>
            <IconButton
              size="large"
              aria-label="menu di navigazione"
              onClick={handleOpenNavMenu}
              color="inherit"
            >
              <MenuIcon />
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorElNav}
              anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
              keepMounted
              transformOrigin={{ vertical: "top", horizontal: "left" }}
              open={Boolean(anchorElNav)}
              onClose={handleCloseNavMenu}
              sx={{ display: { xs: "block", md: "none" } }}
            >
              {pages.map((page) => (
                <MenuItem
                  key={page.name}
                  onClick={handleCloseNavMenu}
                  component={Link}
                  to={page.path}
                  selected={location.pathname === page.path}
                  sx={{ justifyContent: "center" }}
                >
                  {page.name}
                </MenuItem>
              ))}
            </Menu>
          </Box>

          {/* VISTA MOBILE: LOGO CENTRATO */}
          <DirectionsBoatIcon
            sx={{ display: { xs: "flex", md: "none" }, mr: 1 }}
          />
          <Typography
            variant="h5"
            noWrap
            component={Link}
            to="/"
            sx={{
              mr: 2,
              display: { xs: "flex", md: "none" },
              flexGrow: 1,
              fontWeight: 700,
              color: "inherit",
              textDecoration: "none",
            }}
          >
            NOLEGGIO
          </Typography>

          {/* VISTA DESKTOP: LINK DI NAVIGAZIONE */}
          <Box
            sx={{
              flexGrow: 1,
              display: { xs: "none", md: "flex" },
              justifyContent: "flex-end",
              gap: 1,
            }}
          >
            {pages.map((page) => {
              const isActive = location.pathname === page.path;

              return (
                <Button
                  key={page.name}
                  component={Link}
                  to={page.path}
                  sx={{
                    my: 1,
                    color: "white",
                    display: "block",
                    fontWeight: isActive ? "bold" : "normal",
                    borderBottom: isActive
                      ? "2px solid white"
                      : "2px solid transparent",
                    borderRadius: 0,
                    "&:hover": {
                      borderBottom: "2px solid rgba(255, 255, 255, 0.7)",
                    },
                  }}
                >
                  {page.name}
                </Button>
              );
            })}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}
