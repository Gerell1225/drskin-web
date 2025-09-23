"use client";

import { Container, Box, Paper, Typography } from "@mui/material";
import Header from "@/components/Header";
import BookingForm from "@/components/BookingForm";
import Footer from "@/components/Footer";

export default function BookingPage() {
  return (
    <>
      <Header />
      <Box
        sx={{
          pt: { xs: 12, md: 12 },
          pb: { xs: 6, md: 10 },
          minHeight: "100vh",
          bgcolor: "rgba(0,0,0,0.45)",
        }}
      >
        <Container maxWidth="md">
          <Paper
            elevation={2}
            sx={{
              p: { xs: 3, md: 5 },
              borderRadius: 2,
              bgcolor: "white",
              color: "black",
            }}
          >
            <Typography
              variant="h4"
              gutterBottom
              sx={{
                fontWeight: "bold",
                color: "black",
                mb: 3,
                textAlign: "center",
              }}
            >
              Цаг Захиалга
            </Typography>
            <BookingForm />
          </Paper>
        </Container>
      </Box>
      <Footer/>
    </>
  );
}
