"use client";

import { useEffect, useState } from "react";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";

interface Branch {
  id: number;
  title: string;
  description: string;
  phone: string[];
}

const BranchList = () => {
  const [branches, setBranches] = useState<Branch[]>([]);

  useEffect(() => {
    fetch("/api/branches")
      .then((res) => res.json())
      .then((data) => setBranches(data));
  }, []);

  return (
    <Grid container spacing={2}>
      {branches.map((branch) => (
        <Grid item xs={12} sm={6} md={4} key={branch.id}>
          <Card
            sx={{
              height: "100%",
              bgcolor: "#222",
              color: "white",
              borderRadius: 2,
              boxShadow: 2,
              transition: "all 0.3s ease",
              "&:hover": { boxShadow: 6, transform: "translateY(-4px)" },
            }}
          >
            <CardContent>
              <Typography variant="h6">{branch.title}</Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                {branch.description}
              </Typography>
              <Box>
                {branch.phone?.map((p, idx) => (
                  <Typography key={idx} variant="body2">
                    Утас: {p}
                  </Typography>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

export default BranchList;
