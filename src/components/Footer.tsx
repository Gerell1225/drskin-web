import React from 'react';
import { Box, Container, Typography, Stack, IconButton } from '@mui/material';
import FacebookIcon from '@mui/icons-material/Facebook';
import InstagramIcon from '@mui/icons-material/Instagram';

const Footer: React.FC = () => {
  return (
    <Box
      component="footer"
      sx={{
        bgcolor: '#1a1a1c',
        color: '#f5f5f5',
        py: 3,
      }}
    >
      <Container
        maxWidth="lg"
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          alignItems: { xs: 'flex-start', md: 'center' },
          justifyContent: 'space-between',
          gap: 2,
        }}
      >
        <Box>
          <Typography variant="body2">
            © 2025 Dr.Skin &amp; Dr.Hair Salon.
          </Typography>
          <Typography variant="body2">Утас: 7703-0808</Typography>
          <Typography variant="body2">Улаанбаатар, Монгол</Typography>
        </Box>

        <Stack direction="row" spacing={1.5}>
          <IconButton
            component="a"
            href="https://www.facebook.com/BudDr.SkinProFacial"
            target="_blank"
            rel="noopener noreferrer"
            sx={{
              border: '1px solid rgba(255,255,255,0.3)',
              color: '#f5f5f5',
            }}
          >
            <FacebookIcon fontSize="small" />
          </IconButton>
          <IconButton
            component="a"
            href="https://www.instagram.com/dr.skin_beauty_salon/"
            target="_blank"
            rel="noopener noreferrer"
            sx={{
              border: '1px solid rgba(255,255,255,0.3)',
              color: '#f5f5f5',
            }}
          >
            <InstagramIcon fontSize="small" />
          </IconButton>
        </Stack>
      </Container>
    </Box>
  );
};

export default Footer;
