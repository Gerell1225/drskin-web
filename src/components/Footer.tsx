import { Box, Container, Typography } from "@mui/material";
import BranchList from "./BranchList";


const Footer = () => {
  return (
    <Box
      id="footer"
      component="footer"
      sx={{
        bgcolor: "#111", // darker style
        color: "white",
        py: { xs: 4, md: 6 },
        mt: "auto",
      }}
    >
      <Container maxWidth="lg">
        <Typography
          variant="h6"
          align="center"
          sx={{
            mb: { xs: 3, md: 5 },
            fontWeight: "bold",
            fontSize: { xs: "1rem", md: "1.3rem" },
          }}
        >
          Манай салбарууд
        </Typography>
        <BranchList />
        <Typography
          variant="body2"
          align="center"
          sx={{
            mt: { xs: 3, md: 5 },
            fontSize: { xs: "0.75rem", md: "0.9rem" },
            color: "gray",
          }}
        >
          © {new Date().getFullYear()} Dr.Skin & Dr.Hair Salon.
        </Typography>
      </Container>
    </Box>
  );
};

export default Footer;
