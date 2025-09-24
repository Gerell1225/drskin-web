"use client";

import { Container, Box, Paper, Typography } from "@mui/material";
import Header from "@/components/Header";
import BookingForm from "@/components/booking/BookingForm";
import Footer from "@/components/Footer";

export default function BookingPage() {
  return (
    <>
      <Header />
      <Box
        sx={{
          pt: { xs: 14, md: 14 },
          pb: { xs: 6, md: 10 },
          minHeight: "100vh",
          backgroundImage: "url('/HeroPic.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          position: "relative",
          display: "flex",
          justifyContent: "center",
          alignItems: "flex-start",
        }}
      >
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            bgcolor: "rgba(0,0,0,0.45)",
          }}
        />
        <Container maxWidth="sm" sx={{ zIndex: 2 }}>
          <Paper
            elevation={6}
            sx={{
              p: { xs: 2, sm: 4, md: 5 },
              borderRadius: 4,
              bgcolor: "rgba(255,255,255,0.95)",
              color: "black",
              width: "100%",
              mb: { xs: 6, md: 8 },
              boxShadow: "0 8px 24px rgba(0,0,0,0.3)",
            }}
          >
            <Typography
              variant="h4"
              gutterBottom
              sx={{
                fontWeight: 700,
                textAlign: "center",
                mb: { xs: 3, md: 4 },
                fontSize: { xs: "1.75rem", md: "2.25rem" },
                textShadow: "1px 1px 4px rgba(0,0,0,0.25)",
              }}
            >
              Цаг Захиалга
            </Typography>
            <Box
              sx={{
                maxHeight: { xs: "70vh", md: "none" },
                overflowY: { xs: "auto", md: "visible" },
                pr: { xs: 1, md: 0 },
              }}
            >
              <BookingForm />
            </Box>
          </Paper>
        </Container>
      </Box>
      <Footer />
    </>
  );
}
