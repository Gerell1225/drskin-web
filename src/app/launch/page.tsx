"use client";

import { Box, Button, Typography, Container, LinearProgress } from "@mui/material";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";

const Fireworks = dynamic(
  () => import("react-canvas-confetti/dist/presets/fireworks").then((m) => m.default),
  { ssr: false }
);

export default function LaunchPage() {
  const router = useRouter();
  const [celebrate, setCelebrate] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleEnter = () => {
    setCelebrate(true);
  };

  useEffect(() => {
    if (celebrate) {
      let value = 0;
      const interval = setInterval(() => {
        value += 2;
        setProgress(value);
      }, 100);

      const timer = setTimeout(() => {
        clearInterval(interval);
        router.push("/");
      }, 5000);

      return () => {
        clearInterval(interval);
        clearTimeout(timer);
      };
    }
  }, [celebrate, router]);

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
        overflow: "hidden",
      }}
    >
      {celebrate && (
        <Fireworks
          autorun={{ speed: 3, duration: 5000 }}
          style={{
            position: "fixed",
            pointerEvents: "none",
            width: "100%",
            height: "100%",
            top: 0,
            left: 0,
            zIndex: 2,
          }}
        />
      )}

      {!celebrate ? (
        <Container maxWidth="sm" sx={{ zIndex: 3 }}>
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
            onClick={handleEnter}
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
            Вэбсайтыг асаах
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
      ) : (
        <Box
          sx={{
            zIndex: 3,
            position: "absolute",
            top: "35%",
            left: "50%",
            transform: "translateX(-50%)",
            width: "80%",
            maxWidth: 500,
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: [0, 1, 1, 0], scale: [0.9, 1, 1, 0.98] }}
            transition={{ duration: 5, times: [0, 0.15, 0.85, 1], ease: "easeInOut" }}
          >
            <Typography
              variant="h2"
              sx={{
                fontWeight: 800,
                fontFamily: "'Playfair Display', serif",
                color: "#fff",
                textShadow: "0 0 18px rgba(0,0,0,0.9)",
                letterSpacing: 1,
                mb: 3,
              }}
            >
              🎉 Баяр хүргэе!
            </Typography>
          </motion.div>

          <LinearProgress
            variant="determinate"
            value={progress}
            sx={{
              height: 12,
              borderRadius: 6,
              backgroundColor: "rgba(255,255,255,0.2)",
              "& .MuiLinearProgress-bar": {
                backgroundColor: "#D42121",
              },
            }}
          />
        </Box>
      )}
    </Box>
  );
}
