"use client";

import { Box, TextField } from "@mui/material";

export default function ContactStep({
  name,
  phone,
  setName,
  setPhone,
}: {
  name: string;
  phone: string;
  setName: (n: string) => void;
  setPhone: (p: string) => void;
}) {
  return (
    <Box
      display="flex"
      flexDirection="column"
      gap={2}
      sx={{ mt: 2, maxWidth: 400, mx: "auto" }}
    >
      <TextField
        label="Нэр"
        value={name}
        onChange={(e) => setName(e.target.value)}
        fullWidth
      />
      <TextField
        label="Утас"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        fullWidth
      />
    </Box>
  );
}
