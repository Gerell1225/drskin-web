"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Box, TextField, Button, Typography, Paper } from "@mui/material";
import { supabase } from "@/lib/supabaseClient";

export default function AdminLogin() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    const { data, error } = await supabase
      .from("managers")
      .select("id, name, branch_id, extra_branches, is_admin")
      .eq("phone", phone)
      .eq("password", password)
      .single();

    if (error || !data) {
      alert("Алдаа: Утас эсвэл нууц үг буруу байна.");
      return;
    }

    localStorage.setItem("role", data.is_admin ? "admin" : "manager");
    localStorage.setItem("manager_id", data.id.toString());

    if (!data.is_admin && data.branch_id) {
      localStorage.setItem("branch_id", data.branch_id.toString());
    }

    router.push("/admin/dashboard");
  };

  return (
    <Box
      sx={{
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        bgcolor: "#f5f5f5",
      }}
    >
      <Paper sx={{ p: 4, width: 350, textAlign: "center" }}>
        <Typography variant="h6" gutterBottom>
          Админ / Менежер нэвтрэх
        </Typography>
        <TextField
          fullWidth
          label="Утасны дугаар"
          margin="normal"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
        <TextField
          fullWidth
          label="Нууц үг"
          type="password"
          margin="normal"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Button
          fullWidth
          variant="contained"
          sx={{ mt: 2, bgcolor: "#333", "&:hover": { bgcolor: "#000" } }}
          onClick={handleLogin}
        >
          Нэвтрэх
        </Button>
      </Paper>
    </Box>
  );
}
