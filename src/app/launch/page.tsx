"use client";

import { Box, Button, Typography, Container } from "@mui/material";
import { useRouter } from "next/navigation";

export default function LaunchPage() {
  const router = useRouter();

  return (
    <Box
      sx={{
        height: "100vh",
        width: "100%",
        backgroundImage: `
          linear-gradient(rgba(0,0,0,0.55), rgba(0,0,0,0.75)),
          url("/HeroPic.jpg")
        `,
        backgroundSize: "cover",
        backgroundPosition: "center",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        position: "relative",
        color: "#fff",
      }}
    >
      <Box
        sx={{
          position: "absolute",
          bottom: -100,
          left: "50%",
          transform: "translateX(-50%)",
          width: 500,
          height: 500,
          background:
            "radial-gradient(circle, rgba(212,33,33,0.25), transparent 70%)",
          filter: "blur(100px)",
        }}
      />

      <Container maxWidth="sm" sx={{ zIndex: 2 }}>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 600,
            fontFamily: "'Playfair Display', serif",
            mb: 2,
            color: "#D42121",
            letterSpacing: 2,
          }}
        >
          Dr.Skin & Dr.Hair
        </Typography>

        <Typography
          variant="h3"
          sx={{
            fontWeight: 700,
            fontFamily: "'Playfair Display', serif",
            mb: 0.5,
            lineHeight: 1.3,
            color: "#fff",
          }}
        >
          Таны гоо үзэсгэлэн
        </Typography>

        <Typography
          variant="h4"
          sx={{
            fontWeight: 400,
            fontFamily: "'Inter', sans-serif",
            mb: 4,
            color: "rgba(255,255,255,0.9)",
          }}
        >
          бидний баталгаа
        </Typography>

        <Box
          sx={{
            width: 80,
            height: 3,
            backgroundColor: "#D42121",
            borderRadius: "2px",
            margin: "0 auto 40px",
          }}
        />

        <Button
          variant="contained"
          onClick={() => router.push("/")}
          sx={{
            backgroundColor: "#D42121",
            borderRadius: "40px",
            px: 7,
            py: 1.8,
            fontSize: "1.1rem",
            textTransform: "none",
            fontWeight: 600,
            fontFamily: "'Inter', sans-serif",
            letterSpacing: 0.5,
            boxShadow: "0 6px 20px rgba(212,33,33,0.35)",
            "&:hover": {
              backgroundColor: "#b51b1b",
              boxShadow: "0 6px 25px rgba(212,33,33,0.45)",
            },
          }}
        >
          Launch Website
        </Button>

        <Typography
          variant="body2"
          sx={{
            mt: 10,
            color: "rgba(255,255,255,0.6)",
            fontSize: "0.85rem",
            letterSpacing: 1,
            fontFamily: "'Inter', sans-serif",
          }}
        >
          © 2025 Dr.Skin & Dr.Hair.
        </Typography>
      </Container>
    </Box>
  );
}
