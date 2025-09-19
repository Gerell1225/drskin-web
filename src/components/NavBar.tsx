"use client";
import { useState, useEffect } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Button,
  IconButton,
} from "@mui/material";
import FacebookIcon from "@mui/icons-material/Facebook";
import InstagramIcon from "@mui/icons-material/Instagram";
import Link from "next/link";

const Header = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToFooter = () => {
    const footer = document.getElementById("footer");
    if (footer) footer.scrollIntoView({ behavior: "smooth" });
  };

  const scrollToHero = () => {
    const hero = document.getElementById("hero");
    if (hero) hero.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <AppBar
      position="fixed"
      elevation={scrolled ? 2 : 0}
      sx={{
        bgcolor: scrolled ? "white" : "transparent",
        color: scrolled ? "black" : "white",
        transition: "all 0.3s ease",
        px: { xs: 2, md: 6 },
      }}
    >
      <Toolbar
        disableGutters
        sx={{
          flexDirection: { xs: "column", md: "row" },
          alignItems: { xs: "flex-start", md: "center" },
          justifyContent: "space-between",
          width: "100%",
          py: { xs: 1, md: 0 },
        }}
      >
        <Typography
          variant="h6"
          component={Link}
          href="/"
          style={{
            textDecoration: "none",
            color: scrolled ? "red" : "inherit",
            fontWeight: "bold",
            whiteSpace: "nowrap",
          }}
        >
          Dr.Skin & Dr.Hair
        </Typography>
        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            flexWrap: "wrap",
            gap: { xs: 1, md: 2 },
            mt: { xs: 1, md: 0 },
          }}
        >
          <Button
            onClick={scrollToHero}
            component={Link}
            href="/"
            sx={{
              color: "inherit",
              fontSize: { xs: "0.75rem", md: "0.9rem" },
              px: { xs: 1, md: 2 },
              minWidth: "auto",
            }}
          >
            Нүүр
          </Button>
          <Button
            onClick={scrollToFooter}
            sx={{
              color: "inherit",
              fontSize: { xs: "0.75rem", md: "0.9rem" },
              px: { xs: 1, md: 2 },
              minWidth: "auto",
            }}
          >
            Салбарууд
          </Button>
          <Button
            component={Link}
            href="/"
            sx={{
              color: "inherit",
              fontSize: { xs: "0.75rem", md: "0.9rem" },
              px: { xs: 1, md: 2 },
              minWidth: "auto",
            }}
          >
            Цаг авах
          </Button>
          <IconButton
            href="https://www.facebook.com/BudDr.SkinProFacial"
            target="_blank"
            rel="noopener noreferrer"
            sx={{ color: scrolled ? "#4267B2" : "inherit" }}
          >
            <FacebookIcon fontSize="small" />
          </IconButton>
          <IconButton
            href="https://www.instagram.com/dr.skin_beauty_salon/"
            target="_blank"
            rel="noopener noreferrer"
            sx={{ color: scrolled ? "#E1306C" : "inherit" }}
          >
            <InstagramIcon fontSize="small" />
          </IconButton>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
