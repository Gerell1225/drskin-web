'use client';

import React from 'react';
import { Box, Container, Typography, Stack, Button } from '@mui/material';

function scrollToId(id: string) {
  if (typeof window === 'undefined') return;
  const el = document.getElementById(id);
  if (el) {
    const y = el.getBoundingClientRect().top + window.scrollY - 80;
    window.scrollTo({ top: y, behavior: 'smooth' });
  }
}

const HeroSection: React.FC = () => {
  return (
    <Box
      id="top"
      sx={{
        position: 'relative',
        py: { xs: 8, md: 20 },
        backgroundImage:
          "url('https://images.pexels.com/photos/3738348/pexels-photo-3738348.jpeg')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        '&::before': {
          content: "''",
          position: 'absolute',
          inset: 0,
          bgcolor: 'rgba(255,255,255,0.78)',
        },
      }}
    >
      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={4}
          alignItems="center"
        >
          <Box sx={{ flex: 1 }}>
            <Typography
              variant="h2"
              sx={{ fontSize: { xs: 36, md: 48 }, fontWeight: 700, mb: 1 }}
            >
              Таны гоо үзэсгэлэн
            </Typography>
            <Typography
              variant="h2"
              sx={{
                fontSize: { xs: 32, md: 40 },
                fontWeight: 700,
                color: 'primary.main',
                mb: 2,
              }}
            >
              бидний баталгаа
            </Typography>
            <Typography
              variant="body1"
              sx={{ fontSize: 16, maxWidth: 480, mb: 4 }}
            >
              Арьс, үс арчилгааны мэргэжлийн үйлчилгээ нэг дор. Эмчийн зөвлөгөө,
              дэвшилтэт аппарат, тав тухтай орчны хослол.
            </Typography>

            <Stack direction="row" spacing={2} flexWrap="wrap">
              <Button
                variant="contained"
                color="primary"
                size="large"
                sx={{ borderRadius: 999, textTransform: 'none', px: 4 }}
              >
                Цаг авах
              </Button>
              <Button
                variant="outlined"
                color="primary"
                size="large"
                sx={{ borderRadius: 999, textTransform: 'none', px: 3 }}
                onClick={() => scrollToId('branches')}
              >
                Манай салбарууд
              </Button>
            </Stack>
          </Box>
        </Stack>
      </Container>
    </Box>
  );
};

export default HeroSection;
