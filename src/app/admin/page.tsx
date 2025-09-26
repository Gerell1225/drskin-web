"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Snackbar,
  Alert,
} from "@mui/material";
import { supabase } from "@/lib/supabaseClient";

export default function AdminLoginPage() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [alert, setAlert] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({
    open: false,
    message: "",
    severity: "success",
  });

  const handleLogin = async () => {
    if (!phone || !password) {
      setAlert({
        open: true,
        message: "Please enter phone and password",
        severity: "error",
      });
      return;
    }

    const { data, error } = await supabase
      .from("managers")
      .select("*")
      .eq("phone", phone)
      .eq("password", password)
      .single();

    if (error || !data) {
      setAlert({
        open: true,
        message: "Invalid phone or password",
        severity: "error",
      });
      return;
    }

    localStorage.setItem("manager", JSON.stringify(data));

    setAlert({ open: true, message: "Login successful", severity: "success" });

    setTimeout(() => {
      router.push("/admin/dashboard");
    }, 800);
  };

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="100vh"
      bgcolor="#fafafa"
    >
      <Paper elevation={3} sx={{ p: 4, width: 360 }}>
        <Typography variant="h5" mb={3} textAlign="center">
          Manager Login
        </Typography>

        <TextField
          label="Phone"
          fullWidth
          margin="normal"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />

        <TextField
          label="Password"
          type="password"
          fullWidth
          margin="normal"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <Button
          variant="contained"
          fullWidth
          sx={{ mt: 3 }}
          onClick={handleLogin}
        >
          Login
        </Button>
      </Paper>

      <Snackbar
        open={alert.open}
        autoHideDuration={3000}
        onClose={() => setAlert({ ...alert, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity={alert.severity}>{alert.message}</Alert>
      </Snackbar>
    </Box>
  );
}
