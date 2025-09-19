import { Box, Button, Typography } from "@mui/material";
import Link from "next/link";


const Hero = () => {
  return (
    <Box
      id="hero"
      sx={{
        height: { xs: "70vh", md: "100vh" }, // taller for impact
        width: "100%",
        backgroundImage: "url('/HeroPic.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        color: "white",
        position: "relative",
      }}
    >
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          bgcolor: "rgba(0,0,0,0.45)",
        }}
      />
      <Box sx={{ position: "relative", zIndex: 1, px: 2 }}>
        <Typography
          variant="h2"
          sx={{
            fontSize: { xs: "1.6rem", md: "3.5rem" },
            fontWeight: 600,
            mb: { xs: 2, md: 4 },
            textShadow: "2px 2px 6px rgba(0,0,0,0.6)",
          }}
        >
          Таны гоо үзэсгэлэн <br /> бидний баталгаа
        </Typography>
        <Button
          variant="outlined"
          component={Link}
          href="/"
          sx={{
            borderColor: "white",
            color: "white",
            px: { xs: 3, md: 6 },
            py: { xs: 1, md: 1.2 },
            fontSize: { xs: "0.9rem", md: "1.1rem" },
            letterSpacing: 1,
            textTransform: "uppercase",
            "&:hover": {
              bgcolor: "white",
              color: "black",
              borderColor: "white",
            },
          }}
        >
          Цаг авах
        </Button>
      </Box>
    </Box>
  );
};

export default Hero;
